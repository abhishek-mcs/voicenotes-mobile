//
//  AudioPlayerView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 7/1/24.
//

import SwiftUI

struct AudioPlayerView: View {
  @ObservedObject var audioVM: AudioPlayViewModel
  
  private func normalizeSoundLevel(level: Float) -> CGFloat {
    let level = max(6, CGFloat(level) + 65) / 2 // between 0.1 and 30
    return CGFloat(level * (40/35))
  }
  
  var body: some View {
    HStack(alignment: .center, spacing: 5) {
      ZStack {
        Circle()
          .foregroundStyle(audioVM.message.messageType == .user ? .white : .black)
        
        Image(audioVM.isPlaying ? "pause" : "play")
          .resizable()
          .renderingMode(.template)
          .frame(width: 8, height: 9)
          .foregroundStyle(audioVM.message.messageType == .user ? .black : .white)
      }
      .frame(width: 22)
      .onTapGesture {
        if audioVM.isPlaying {
          audioVM.pauseAudio()
        } else {
          audioVM.playAudio()
        }
      }
      
      HStack(alignment: .center, spacing: 2) {
        Spacer(minLength: .zero)
        if audioVM.soundSamples.isEmpty {
          ProgressView()
            .frame(width: 20, height: 20)
        } else {
          ForEach(audioVM.soundSamples, id: \.self) { model in
            MessageBarView(value: self.normalizeSoundLevel(level: model.magnitude), color: model.color)
          }
        }
        Spacer(minLength: .zero)
      }
    }
    .frame(height: 22)
  }
}
