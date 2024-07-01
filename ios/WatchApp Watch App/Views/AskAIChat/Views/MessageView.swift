//
//  MessageView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 7/1/24.
//

import SwiftUI

struct MessageView: View {
  @StateObject var audioVM: AudioPlayViewModel
  
  var body: some View {
    ZStack {
      Image(audioVM.message.messageType == .user ? "chatUserAnswer" : "chatAIAnswer")
        .resizable()
      
      VStack(spacing: 3) {
        AudioPlayerView(audioVM: audioVM)
        
        HStack(spacing: .zero) {
          Text(audioVM.message.messageType == .user ? audioVM.message.question ?? "empty" : audioVM.message.answer ?? "empty")
            .font(.SFProRounded(.regular, size: 10))
            .foregroundStyle(audioVM.message.messageType == .user ? .white.opacity(0.5) : .black.opacity(0.4))
            .lineLimit(2)
          Spacer(minLength: .zero)
        }
      }
      .padding(.horizontal, 10)
    }
  }
}
