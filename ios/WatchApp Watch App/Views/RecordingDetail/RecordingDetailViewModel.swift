import SwiftUI
import AVFoundation
import NerdzInject
import Combine

final class RecordingDetailViewModel: ObservableObject {
  
  // MARK: - Properties
  
  @Published var song1 = false
  @Published var audioTime = "--:--"
  @Published var audioDuration = ""
  @Published var isAudioReady = false

  @ForceInject private var repository: RecordingRepository
  var subscriptions = Set<AnyCancellable>()
  
  var recording: RecordModel
  var audioPlayer: AVPlayer?
  private var timeObserverToken: Any?

  init(recording: RecordModel) {
    self.recording = recording
    
    self.audioTime = self.formatTime(seconds: Float64(recording.duration / 1000))
    self.audioDuration = self.audioTime
    
    DispatchQueue.main.async {
      if let audioData = recording.audioData {
        self.playSound(audioData: audioData)
      } else {
        self.getAudio(recordingId: recording.id)
      }
    }
  }
  
  deinit {
    if let token = timeObserverToken {
      audioPlayer?.removeTimeObserver(token)
    }
    NotificationCenter.default.removeObserver(self)
  }

  // MARK: - Methods

  func playSound(audioUrlString: String) {
    DispatchQueue.main.async {
      guard !audioUrlString.isEmpty, let url = URL(string: audioUrlString) else {
        print("Invalid URL")
        return
      }
      
      self.setupPlayer(url: url)
    }
  }
  
  func playSound(audioData: Data) {
    DispatchQueue.main.async {
      let tempFileURL = self.createTemporaryFileURL(for: audioData)
      guard let url = tempFileURL else {
        print("Failed to create temporary file URL")
        return
      }
      self.setupPlayer(url: url)
    }
  }
  
  private func setupPlayer(url: URL) {
    let playerItem = AVPlayerItem(url: url)
    self.audioPlayer = AVPlayer(playerItem: playerItem)
    self.observePlayerItemStatus(playerItem)
    print("Initialized AVPlayer with item: \(playerItem)")
    
    // Observe the end of playback
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(self.playerDidFinishPlaying),
      name: .AVPlayerItemDidPlayToEndTime,
      object: playerItem
    )
  }
  
  private func createTemporaryFileURL(for audioData: Data) -> URL? {
    let tempDirectory = FileManager.default.temporaryDirectory
    let tempFileURL = tempDirectory.appendingPathComponent(UUID().uuidString).appendingPathExtension("mp3")
    
    do {
      try audioData.write(to: tempFileURL)
      return tempFileURL
    } catch {
      print("Error writing audio data to temporary file: \(error)")
      return nil
    }
  }
  
  func resetAudio() {
    guard let player = audioPlayer else {
      print("Audio player is not initialized")
      return
    }
    
    player.pause()
    player.seek(to: CMTime.zero) { [weak self] _ in
      guard let self else { return }
      self.audioTime = self.audioDuration

      print("Audio reset to start")
    }
  }
  
  @objc private func playerDidFinishPlaying() {
    resetAudio()
    song1 = false
  }
  
  private func observePlayerItemStatus(_ playerItem: AVPlayerItem) {
    print("Observing player item status")
    
    playerItem.publisher(for: \.status)
      .sink { [weak self] status in
        guard let self = self else { return }
        print("Player item status: \(status.rawValue)")
        
        switch status {
        case .readyToPlay:
          print("Audio is ready to play")
          self.isAudioReady = true
          self.addPeriodicTimeObserver()
        case .failed:
          print("Failed to load audio")
        default:
          break
        }
      }
      .store(in: &subscriptions)
  }
  
  private func addPeriodicTimeObserver() {
    guard let player = audioPlayer else {
        print("Audio player is not initialized")
        return
    }
    
    let interval = CMTime(seconds: 1, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
    // MARK: TimeObserverToken
    timeObserverToken = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
      guard let self = self else { return }
      let currentTime = CMTimeGetSeconds(time)
      print("Periodic time observer callback called - Current time: \(currentTime)")
      
      self.audioTime = self.formatTime(seconds: currentTime)
      print("Current time: \(currentTime), Formatted time: \(self.audioTime)")
    }
    print("Added time observer: \(String(describing: timeObserverToken))")
  }
  
  private func formatTime(seconds: Float64) -> String {
    let minutes = Int(seconds) / 60
    let seconds = Int(seconds) % 60
    return String(format: "%02d:%02d", minutes, seconds)
  }
  
  func formatMilliseconds(_ milliseconds: Int) -> String {
    let seconds = Double(milliseconds) / 1000
    return String(format: "%.2f", seconds)
  }
  
  func convertDateString(_ originalDateString: String) -> String {
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
  
  private func getAudio(recordingId: String) {
    repository.getAudio(recordingId: recordingId)
      .sink {
        switch $0 {
        case .failure(let error):
          print("ERROR: \(error.localizedDescription)")
        case .finished:
          break
        }
      } receiveValue: { [weak self] audioUrlModel in
        guard let self = self else { return }
        self.playSound(audioUrlString: audioUrlModel.url)
      }
      .store(in: &subscriptions)
  }
}
