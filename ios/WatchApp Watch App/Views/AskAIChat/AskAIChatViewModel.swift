//
//  AskAIChatViewModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI
import SDWebImageLottieCoder
import NerdzInject
import Combine
import AVFoundation

final class AskAIChatViewModel: ObservableObject {
  
  @Published var loadAnimation = Image("")
  @Published var messages = [MessageModel]()

  @ForceInject private var AIChatRepository: AIChatRepository

  private var coder: SDImageLottieCoder?
  private var loadingFrame: UInt = 0
  private var loadAnimationTimer: Timer?
  private var speed: Double = 1.0
  
  private var threadId = ""
  private var subscriptions = Set<AnyCancellable>()
  
  var activateAskAiButton = {}
  var deactivateAskAiButton = {}
  
  init(audioData: Data) {
    setupLoadAnimation()
    createAIThread(audioData: audioData)
  }
  
  // MARK: - API Request

  private func createAIThread(audioData: Data) {
    messages.append(MessageModel(messageType: .user, loading: true))
    AIChatRepository.createAIChat(audio: StoreAudioModel(parameters: [:], audioData: audioData))
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished:
          break
        }
      } receiveValue: { [weak self] result in
        withAnimation {
          guard let self else { return }
          self.threadId = "\(result.id)"
          self.messages[0] = MessageModel(messageType: .user,
                                          loading: false,
                                          questionURL: result.relatedMessages.first?.questionUrl,
                                          question: result.relatedMessages.first?.question)
          
          self.messages.append(MessageModel(messageType: .AI, loading: true))
          self.getAnswer(messageId: "\(result.relatedMessages.first?.id ?? 0)")
        }
      }
      .store(in: &subscriptions)
  }
  
  private func getAnswer(messageId: String) {
    AIChatRepository.getAnswer(messageId: messageId)
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished:
          break
        }
      } receiveValue: { [weak self] result in
        withAnimation {
          guard let self else { return }
          self.messages[self.messages.count - 1] = MessageModel(messageType: .AI,
                                                                loading: false,
                                                                answerURL: result.relatedMessages.last?.answerUrl,
                                                                answer: result.relatedMessages.last?.answer)
          self.activateAskAiButton()
        }
      }
      .store(in: &subscriptions)
  }
  
  func addNewMessage(audioData: Data) {
    deactivateAskAiButton()
    messages.append(MessageModel(messageType: .user, loading: true))
    AIChatRepository.addNewMessage(threadId: threadId, audio: StoreAudioModel(parameters: [:], audioData: audioData))
      .receive(on: DispatchQueue.main)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished:
          break
        }
      } receiveValue: { [weak self] result in
        withAnimation {
          guard let self else { return }
          self.messages[self.messages.count - 1] = MessageModel(messageType: .user,
                                                                loading: false,
                                                                questionURL: result.relatedMessages.last?.questionUrl,
                                                                question: result.relatedMessages.last?.question)
          
          self.messages.append(MessageModel(messageType: .AI, loading: true))
          self.getAnswer(messageId: "\(result.relatedMessages.last?.id ?? 0)")
        }
      }
      .store(in: &subscriptions)
  }
  
  // MARK: - Animation Methods
  
  private func setupLoadAnimation() {
    guard let jsonData = loadJSONData(filename: "loadAnimationGray") else { return }
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
}

struct MessageModel {
  var id: String = UUID().uuidString
  var messageType: MessageType
  var loading: Bool
  var isPlaying: Bool = false
  var questionURL: String? = nil
  var question: String? = nil
  var answerURL: String? = nil
  var answer: String? = nil
}

enum MessageType {
  case user
  case AI
}
