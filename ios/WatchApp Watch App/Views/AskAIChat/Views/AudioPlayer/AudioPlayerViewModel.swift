//
//  AudioPlayerViewModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 7/1/24.
//

import Foundation
import AVKit
import SwiftUI
import AVFoundation
import Combine

class AudioPlayViewModel: ObservableObject {
    
    private var timer: Timer?
    
    @Published var isPlaying: Bool = false
    
    @Published public var soundSamples = [AudioPreviewModel]()
    let sampleCount = Int((WKInterfaceDevice.current().screenBounds.width - 65) / 4)
    var index = 0
    var url: URL
    
    var dataManager = Service.shared
    let message: MessageModel

    @Published var player: AVPlayer!
    @Published var session: AVAudioSession!
    
    init(message: MessageModel) {
        self.message = message
      
        if message.messageType == .user {
            self.url = URL(string: message.questionURL ?? "")!
        } else {
            self.url = URL(string: message.answerURL ?? "")!
        }
      
        visualizeAudio()
        
        do {
            session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord)
            try session.setActive(true)
        } catch {
            print(error.localizedDescription)
        }
        
        player = AVPlayer(url: self.url)
    }

    func startTimer() {
        countDuration { duration in
            let timeInterval = duration / Double(self.sampleCount)

            self.timer = Timer.scheduledTimer(withTimeInterval: timeInterval, repeats: true, block: { (timer) in
                if self.index < self.soundSamples.count {
                    withAnimation(Animation.linear) {
                      self.soundSamples[self.index].color = self.message.messageType == .user ? .white : .black
                    }
                    self.index += 1
                }
            })
        }
    }
    
    @objc func playerDidFinishPlaying(note: NSNotification) {
        self.player.pause()
        self.player.seek(to: .zero)
        self.timer?.invalidate()
        self.isPlaying = false
        self.index = 0
        self.soundSamples = self.soundSamples.map { tmp -> AudioPreviewModel in
            var cur = tmp
            cur.color = Color("808080")
            return cur
        }
    }
    
    func playAudio() {
        if isPlaying {
            pauseAudio()
        } else {
            NotificationCenter.default.addObserver(self, selector:#selector(self.playerDidFinishPlaying(note:)),name: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: player.currentItem)

            isPlaying.toggle()
            player.play()
            
            startTimer()
            countDuration { _ in }
        }
    }
    
    func pauseAudio() {
        player.pause()
        timer?.invalidate()
        self.isPlaying = false
    }

    
    func countDuration(completion: @escaping(Float64) -> ()) {
        DispatchQueue.global(qos: .background).async {
            if let duration = self.player.currentItem?.asset.duration {
                let seconds = CMTimeGetSeconds(duration)
                DispatchQueue.main.async {
                    completion(seconds)
                }
                return
            }
            
            DispatchQueue.main.async {
                completion(1)
            }
        }

    }
    
    func visualizeAudio() {
        dataManager.buffer(url: url, samplesCount: sampleCount) { results in
            self.soundSamples = results
        }
    }
    
    func removeAudio() {
        do {
            try FileManager.default.removeItem(at: url)
        } catch {
            print(error)
        }
    }
}


struct AudioPreviewModel: Hashable {
    var magnitude: Float
    var color: Color
}
