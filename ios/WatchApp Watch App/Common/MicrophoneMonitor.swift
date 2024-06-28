//
//  MicrophoneMonitor.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/11/24.
//

import Foundation
import AVFoundation

class MicrophoneMonitor: ObservableObject {
  
  var audioRecorder: AVAudioRecorder
  private var timer: Timer?
  
  private var currentSample: Int
  private let numberOfSamples: Int
  
  @Published public var soundSamples: [Float]
  
  init(numberOfSamples: Int) {
    self.numberOfSamples = numberOfSamples // In production check this is > 0.
    self.soundSamples = [Float](repeating: -120, count: numberOfSamples)
    self.currentSample = 0
    
    let audioSession = AVAudioSession.sharedInstance()
    
    let recorderSettings = [
      AVFormatIDKey: Int(kAudioFormatAppleLossless),
      AVSampleRateKey: 44100,
      AVNumberOfChannelsKey: 2,
      AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
    ]
    
    let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
    let documentDirectory = paths[0]
    let fileName = "audio.m4a"
    let fileURL = documentDirectory.appendingPathComponent(fileName)
    
    do {
      try audioSession.setCategory(.playAndRecord, mode: .default, options: [])
      try audioSession.setActive(true)
      audioRecorder = try AVAudioRecorder(url: fileURL, settings: recorderSettings)
      audioRecorder.prepareToRecord()
    } catch {
      fatalError(error.localizedDescription)
    }
  }
  
  func startMonitoring() {
    audioRecorder.isMeteringEnabled = true
    audioRecorder.record()
    timer = Timer.scheduledTimer(withTimeInterval: 0.03, repeats: true, block: { (timer) in
      self.audioRecorder.updateMeters()
      self.soundSamples[self.currentSample] = self.audioRecorder.averagePower(forChannel: 0)
      self.currentSample = (self.currentSample + 1) % self.numberOfSamples
    })
  }
  
  deinit {
    timer?.invalidate()
    audioRecorder.stop()
  }
}
