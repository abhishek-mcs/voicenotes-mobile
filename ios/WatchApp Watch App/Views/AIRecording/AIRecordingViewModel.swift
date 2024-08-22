//
//  AIRecordingViewModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI
import AVFoundation
import SDWebImageLottieCoder
import SwiftData

final class AIRecordingViewModel: ObservableObject {
  
  // MARK: - Properties
  @Published var startRecording = false
  @Published var recording = false
  @Published var formattedTime = "00:00"
  @Published var loadAnimation = Image("")
  
  @ObservedObject var mic = MicrophoneMonitor(numberOfSamples: numberOfSamples)
  
  var timer: Timer?
  
  // MARK: - Animation
  private var coder: SDImageLottieCoder?
  private var loadingFrame: UInt = 0
  private var loadAnimationTimer: Timer?
  private var speed: Double = 1.0
  private var getUserInfo = false
  
  var maxRecordingTime: TimeInterval = 20
  var completion: (RecordingDataModel, _ hideView: Bool) -> Void
  
  init(completion: @escaping (RecordingDataModel, Bool) -> Void) {
    
    self.completion = completion
    setupLoadAnimation()
  }
  
  // MARK: - Action Methods
  
  func recordButtonTapped() {
    withAnimation {
      if mic.audioRecorder.isRecording == true {
        stopRecording()
      } else {
        mic.startMonitoring()
        startTimer()
        recording = true
        startRecording = true
      }
    }
  }
  
  func stopRecording() {
    mic.audioRecorder.pause()
    stopTimer()
    recording = false
  }
  
  func approveRecording(hideView: Bool = true) {
    guard startRecording else { return }
    let audioTime = mic.audioRecorder.currentTime
    mic.audioRecorder.stop()
    stopTimer()
    resetTimer()
    recording = false
    
    if let audioData = try? Data(contentsOf: getFileURL()) {
      DispatchQueue.main.async {
        let recording = RecordingDataModel(duration: Int(audioTime * 1000), audioData: audioData, createdAt: Date())
        self.startRecording = !hideView
        self.completion(recording, hideView)
      }
    }
  }
  
  func cancelRecording() {
    guard startRecording else { return }
    mic.audioRecorder.stop()
    stopTimer()
    resetTimer()
    startRecording = false
    recording = false
  }
  
  // MARK: - Timer Methods
  private func startTimer() {
    timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
      self.updateTime()
    }
  }
  
  private func stopTimer() {
    timer?.invalidate()
    timer = nil
  }
  
  private func resetTimer() {
    formattedTime = "00:00"
  }
  
  private func updateTime() {
    let currentTime = mic.audioRecorder.currentTime
    if currentTime >= maxRecordingTime {
      approveRecording()
    } else {
      let minutes = Int(currentTime) / 60
      let seconds = Int(currentTime) % 60
      formattedTime = String(format: "%02d:%02d", minutes, seconds)
    }
  }
  
  private func getFileURL() -> URL {
    let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
    let documentDirectory = paths[0]
    let fileName = "audio.m4a"
    let fileURL = documentDirectory.appendingPathComponent(fileName)
    return fileURL
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

  func normalizeSoundLevel(level: Float) -> CGFloat {
    let level = max(0.2, CGFloat(level) + 50) / 2 // between 0.1 and 25
    
    return max(CGFloat(level * (70 / 25)), 15) // scaled to max at 70 (our height of our bar)
  }
}
