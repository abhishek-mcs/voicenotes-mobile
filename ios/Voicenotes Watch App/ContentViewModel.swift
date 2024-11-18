//
//  ContentViewModel.swift
//  Watch-voicenotes Watch App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import SwiftUI
import KeychainSwift
import NerdzInject
import Combine
import SwiftData
import SDWebImageLottieCoder

enum ScreenType: Hashable {
    case recordingDetails(RecordModel)
    case askAI(audioData: Data)
}

final class ContentViewModel: ObservableObject {
  
  @Published var recordings = [RecordModel]()
  @Published var firstAIAudio = Data()
  @Published var askAIButtonDisable = false
  @Published var isAccessTokenValid = false
  @Published var noInternet = false
  @Published var showRecordView = false
  @Published var showAIRecordView = false
  @Published var showCancelView = false
  @Published var showDeleteView = false
  @Published var showGotItView = false
  @Published var recordAudioViewModel = RecordAudioViewModel(completion: { _, _ in }, cancel: {})
  @Published var aiRecordingViewModel = AIRecordingViewModel(completion: { _, _ in })
  @Published var askAIChatViewModel = AskAIChatViewModel(audioData: Data())
  @Published var loadAnimation = Image("")
  @Published var recordingsData: [RecordingDataModel] = []
  @Published var navigationPath: [ScreenType] = []
  
  @ObservedObject var watchConnection = WatchConnector()

  @ForceInject private var recordingRepository: RecordingRepository
  @ForceInject private var authRepository: AuthRepository
  private var context: ModelContext?
  var subscriptions = Set<AnyCancellable>()
  var updatedNotesId: [String] = []
  var userDataModel: UserDataModel?
  var listPage = 1
  var recordingForDelete: RecordModel?

  var deleteRecording: (String) -> Void = { _ in }
  
  private let keychain = KeychainSwift()
  private var getResponse = false
  
  // MARK: - Animation
  private var coder: SDImageLottieCoder?
  private var loadingFrame: UInt = 0
  private var loadAnimationTimer: Timer?
  private var speed: Double = 1.0
  
  init() {
    updateTokenValidation()
    subscribe()
    setupLoadAnimation()
  }
  
  private func checkAppGroup() {
    let sharedUserDefaults = UserDefaults(suiteName: "group.watchOS.storage")
    if let token = sharedUserDefaults?.string(forKey: "token_key") {
        print("Token: \(token)")
      self.keychain.set(token, forKey: KeychainKeys.accessToken)
      self.updateTokenValidation()
    } else {
        print("No token found")
    }
  }
  
  func update(context: ModelContext, recordings: [RecordingDataModel]) {
    self.context = context
    self.recordingsData = recordings
    addLocalNote()
  }
  
  // MARK: Add Local Note
  
  private func addLocalNote() {
    var recordings = [RecordModel]()
    recordingsData.forEach { recording in
      recordings.append(RecordModel(id: recording.id, recordingId: recording.id, createdAt: self.getNowStringDate(currentDate: recording.createdAt), updatedAt: self.getNowStringDate(currentDate: recording.createdAt), duration: Double(recording.duration), audioData: recording.audioData))
    }
    
    self.recordings += recordings
    self.recordings.sort {
      guard let date1 = getDateFromString($0.createdAt), let date2 = getDateFromString($1.createdAt) else { return false }
      return date1 > date2
    }
  }
  
  private func subscribe() {
      NotificationCenter.default.publisher(for: Notification.Name("update_token"))
          .sink { [weak self] _ in
              guard let self else { return }
              self.updateTokenValidation()
          }
          .store(in: &subscriptions)
  }
  
  // MARK: - Request Methods
  
  func getAllRecordings(page: Int) {
    recordingRepository.getAllRecordings(page: page)
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished: break
        }
      } receiveValue: { [weak self] result in
        guard let self else { return }
        
        if page == 1 {
          recordings = result.data
          addLocalNote()
        } else {
          DispatchQueue.main.async {
            self.recordings += result.data
          }
        }
        listPage += 1
      }
      .store(in: &subscriptions)
  }
  
  func getUserData() {
    let internetCheckTask = DispatchWorkItem { [weak self] in
      guard let self = self else { return }
      if !self.getResponse {
        withAnimation {
          self.noInternet = true
        }
        self.getResponse = false
      }
    }
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: internetCheckTask)

    authRepository.getUserData()
      .receive(on: DispatchQueue.main)
      .sink { [weak self] completion in
        guard let self else { return }
        self.getResponse = true
        internetCheckTask.cancel()

        switch completion {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished:
          self.noInternet = false
        }
      } receiveValue: { [weak self] result in
        internetCheckTask.cancel()
        self?.userDataModel = result
      }
      .store(in: &subscriptions)
  }
  
  // MARK: Store Audio
  
  func storeAudio(recording: RecordingDataModel, context: ModelContext) {
    recordingRepository.storeAudio(model: StoreAudioModel(parameters: ["duration" : "\(recording.duration)"],
                                                 audioData: recording.audioData))
    .receive(on: DispatchQueue.main)
    .sink {
      switch $0 {
      case .failure(let error):
        print("ERROR: \(error.localizedDescription)")
        if let index = self.recordings.firstIndex(where: { $0.id == recording.id }) {
          withAnimation {
            self.recordings[index].isUploadingAudio = false
          }
        } else if self.recordings.count == 1 {
          withAnimation {
            self.recordings[0].isUploadingAudio = false
          }
        }
      case .finished: break
      }
    } receiveValue: { [weak self] model in
      guard let self else { return }
      
      if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
        withAnimation {
          self.recordings[index].isUploadingAudio = false
          self.recordings[index].isCreatingTranscript = true
        }
      } else if self.recordings.count == 1 {
        withAnimation {
          self.recordings[0].isUploadingAudio = false
        }
      }
      
      if let index = recordings.firstIndex(where: { $0.id == model.recording.recordingId }) {
        withAnimation {
          self.recordings[index].audioData = nil
        }
      }
      
      self.updateTranscripting(recordingId: model.recording.recordingId, listItemId: recording.id)
    }
    .store(in: &subscriptions)
  }
  
  func updateTranscripting(recordingId: String, listItemId: String) {
    recordingRepository.addTranscript(recordingId: recordingId)
    .receive(on: DispatchQueue.main)
    .sink {
      switch $0 {
      case .failure(let error):
        print("ERROR: \(error.localizedDescription)")
        if let index = self.recordings.firstIndex(where: { $0.id == listItemId }) {
          withAnimation {
            self.recordings[index].isCreatingTranscript = false
          }
        }
      case .finished: break
      }
    } receiveValue: { [weak self] model in
      guard let self else { return }
      print("Success update recording transcript")
      self.updateTitle(recordingId: recordingId, listItemId: listItemId, recording: model.recording)
    }
    .store(in: &subscriptions)
  }
  
  private func updateTitle(recordingId: String, listItemId: String, recording: RecordModel) {
    recordingRepository.addTitle(recordingId: recordingId)
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
          if let index = self.recordings.firstIndex(where: { $0.id == listItemId }) {
            withAnimation {
              self.recordings[index].isCreatingTranscript = false
            }
          }
        case .finished: break
        }
      } receiveValue: { [weak self] model in
        guard let self else { return }
        print("Success update recording title")
        var recording = recording
        recording.title = model.recording.title
        recording.transcript = formatText(text: model.recording.transcript ?? "")
        if let index = recordings.firstIndex(where: { $0.id == listItemId }) {
          withAnimation {
            self.recordings[index] = recording
          }
        }
      }
      .store(in: &subscriptions)
  }
  
  // MARK: Get User Data

  func getUserData(recording: RecordingDataModel) {
    if !updatedNotesId.contains(where: { $0 == recording.id }) {
      updatedNotesId.append(recording.id)
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
      if self.updatedNotesId.contains(where: { $0 == recording.id }) {
        // MARK: No interner action
        withAnimation {
          self.noInternet = true
          self.showGotItView = true
        }
        if let index = self.recordings.firstIndex(where: { $0.id == recording.id }) {
          withAnimation {
            self.recordings[index].isCheckInternet = false
            self.recordings[index].isUploadingAudio = false
            self.recordings[index].isCreatingTranscript = false
          }
        }
      }
    }
    authRepository.getUserData()
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
          if let index = self.updatedNotesId.firstIndex(where: { $0 == recording.id }) {
            self.updatedNotesId.remove(at: index)
          }
          self.noInternet = false
        case .finished: break
        }
      } receiveValue: { [weak self] result in
        guard let self else { return }
        if let index = self.updatedNotesId.firstIndex(where: { $0 == recording.id }) {
          self.updatedNotesId.remove(at: index)
          self.userDataModel = result
        }
        self.noInternet = false
        
        guard let context = self.context else { return }
        
        if let index = self.recordings.firstIndex(where: { $0.id == recording.id }) {
          withAnimation {
            self.recordings[index].isCheckInternet = false
            self.recordings[index].isUploadingAudio = true
          }
        }
        
        // if we have resopnse we can try to delete it from local storage
        self.deleteRecording(recording.id)
        
        self.storeAudio(recording: recording, context: context)
      }
      .store(in: &subscriptions)
  }
  
  // MARK: Delete note
  
  func deleteNote() {
    if recordingForDelete?.audioData == nil {
      guard let deletedRecordingID = recordingForDelete?.id else { return }
      recordingRepository.deleteRecording(recordingId: deletedRecordingID)
        .receive(on: DispatchQueue.main)
        .sink {
          switch $0 {
          case .failure(let error):
            print("ERROR: \(error.localizedDescription)")
          case .finished: break
          }
        } receiveValue: { [weak self] _ in
          guard let self else { return }
          
          if let index = recordings.firstIndex(where: { $0.id == deletedRecordingID }) {
            recordings.remove(at: index)
          }
          recordingForDelete = nil
        }
        .store(in: &subscriptions)
    } else {
      // local item
      guard let recordingForDelete = self.recordingForDelete else { return }
      self.deleteRecording(recordingForDelete.id)
      
      if let index = recordings.firstIndex(where: { $0.id == recordingForDelete.id }) {
        recordings.remove(at: index)
      }
      self.recordingForDelete = nil
    }
  }
  
  // MARK: Upload Local Note
  
  func uploadLocalNote(model: RecordModel) {
    guard let audioData = model.audioData else { return }
    let recording = RecordingDataModel(duration: Int(model.duration), audioData: audioData, createdAt: Date())
    recording.id = model.id
    
    guard let index = self.recordings.firstIndex(where: { $0.id == model.id }) else { return }
    
    if noInternet {
      self.recordings[index].isCheckInternet = true
      getUserData(recording: recording)
    } else {
      self.recordings[index].isUploadingAudio = true
      getUserData(recording: recording)
    }
  }
  
  func updateTokenValidation() {
    guard keychain.get(KeychainKeys.accessToken) != nil else {
      checkAppGroup()
      return
    }
    getUserData()
    getAllRecordings(page: listPage)
    withAnimation {
      isAccessTokenValid = true
    }
  }
  
  func formatMilliseconds(_ milliseconds: Int) -> String {
    let totalSeconds = Double(milliseconds) / 1000
    let minutes = Int(totalSeconds) / 60
    let seconds = Int(totalSeconds) % 60
    return String(format: "%d:%02d", minutes, seconds)
  }
  
  func convertDateString(_ originalDateString: String) -> String {
    // Create a DateFormatter for the input date string
    let inputDateFormatter = DateFormatter()
    inputDateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSZ"
    inputDateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    
    if let date = inputDateFormatter.date(from: originalDateString) {
      let outputDateFormatter = DateFormatter()
      outputDateFormatter.dateFormat = "MMM dd"
      
      let formattedDateString = outputDateFormatter.string(from: date)
      
      return formattedDateString
    } else {
      return ""
    }
  }
  
  func deleteToken() {
    isAccessTokenValid = false
    keychain.clear()
  }
  
  // MARK: Init Record Audio ViewModel
  
  func initRecordAudioViewModel() -> RecordAudioViewModel {
    recordAudioViewModel = RecordAudioViewModel(completion: { recording, hideView in
      
      let listItemModel = RecordModel(id: recording.id, recordingId: recording.id, createdAt: self.getNowStringDate(currentDate: Date()), updatedAt: self.getNowStringDate(currentDate: Date()), duration: Double(recording.duration), isPublished: nil, audioData: recording.audioData)
      self.recordings.insert(listItemModel, at: 0)
      
      self.context?.insert(recording)
      
      if self.noInternet {
        self.recordings[0].isCheckInternet = true
        self.getUserData(recording: recording)
      } else {
        self.recordings[0].isUploadingAudio = true
        self.getUserData(recording: recording)
      }
      
      if !self.navigationPath.isEmpty {
        self.navigationPath.removeLast(self.navigationPath.count)
      }
      
      withAnimation {
        self.showRecordView = !hideView
      }
    }, cancel: {
      withAnimation {
        self.showCancelView = true
      }
    })
    
    return recordAudioViewModel
  }
  
  // MARK: Init Record Audio ViewModel
  
  func initAIRecordingViewModel() -> AIRecordingViewModel {
    aiRecordingViewModel = AIRecordingViewModel(completion: { recording, hideView in
      
      // TODO: Added no internet case for AI chat
      
      if self.navigationPath.contains(.askAI(audioData: self.firstAIAudio)) {
        self.askAIChatViewModel.addNewMessage(audioData: recording.audioData)
      } else {
        self.firstAIAudio = recording.audioData
        self.navigationPath.append(ScreenType.askAI(audioData: recording.audioData))
        self.askAIButtonDisable = true
      }
      
      withAnimation {
        self.showAIRecordView = !hideView
      }
    })
    
    return aiRecordingViewModel
  }
  
  // MARK: Init Record Audio ViewModel
  
  func initAskAIChatViewModel(audioData: Data) -> AskAIChatViewModel {
    askAIChatViewModel = AskAIChatViewModel(audioData: audioData)
    
    return askAIChatViewModel
  }
  
  private func getNowStringDate(currentDate: Date) -> String {
    let dateFormatter = DateFormatter()
    
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSZ"
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    
    let formattedDate = dateFormatter.string(from: currentDate)
    return formattedDate
  }
  
  // MARK: - Animation Methods
  
  private func setupLoadAnimation() {
    guard let jsonData = loadJSONData(filename: "loadAnimation") else { return }
    loadingFrame = 0
    guard let coder = SDImageLottieCoder(animatedImageData: jsonData, options: [SDImageCoderOption.decodeLottieResourcePath: Bundle.main.resourcePath!]),
          let uiImage = coder.animatedImageFrame(at: loadingFrame) else { return }
    self.loadAnimation = Image(uiImage: uiImage)
    
    loadAnimationTimer?.invalidate()
    loadAnimationTimer = Timer.scheduledTimer(withTimeInterval: 0.05/speed, repeats: true, block: { (timer) in
      self.loadingFrame += 1
      if self.loadingFrame >= coder.animatedImageFrameCount {
        self.loadingFrame = 0
      }
      guard let uiImage = coder.animatedImageFrame(at: self.loadingFrame) else { return }
      self.loadAnimation = Image(uiImage: uiImage)
    })
  }
  
  private func loadJSONData(filename: String) -> Data? {
    if let url = Bundle.main.url(forResource: filename, withExtension: "json") {
      do {
        let data = try Data(contentsOf: url)
        return data
      } catch {
        print("Error reading JSON file:", error.localizedDescription)
      }
    }
    return nil
  }
  
  private func getDateFromString(_ dateString: String) -> Date? {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXXXX"
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    
    
    return dateFormatter.date(from: dateString)
  }
  
  func recordButton() {
    showRecordView = true
    let subscriptionStatus = userDataModel?.subscriptionStatus ?? false
    recordAudioViewModel.subscriptionStatus = subscriptionStatus
    recordAudioViewModel.maxRecordingTime = subscriptionStatus ? 20 * 60 : 60
    recordAudioViewModel.recordButtonTapped()
  }
  
  
  func askAIButton() {
    showAIRecordView = true
    let subscriptionStatus = userDataModel?.subscriptionStatus ?? false
    aiRecordingViewModel.recordButtonTapped()
  }
  
  private func formatText(text: String) -> String {
    return text.replacingOccurrences(of: "<br>", with: "\n", options: .regularExpression)
               .replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
               .replacingOccurrences(of: "&nbsp;", with: "\n")
  }
}
