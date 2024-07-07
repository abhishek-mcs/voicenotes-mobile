//
//  AskAIChatView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI

struct AskAIChatView: View {
  
  @StateObject var viewModel: AskAIChatViewModel
  @Binding var askAIButtonDisable: Bool
  
  var body: some View {
    ScrollView {
      LazyVStack(spacing: 3) {
        ForEach(viewModel.messages, id: \.id) { message in
          messageView(for: message)
        }
      }
    }
    .onAppear() {
      viewModel.activateAskAiButton = {
        askAIButtonDisable = false
      }
      viewModel.deactivateAskAiButton = {
        askAIButtonDisable = true
      }
    }
    .toolbar {
      ToolbarItemGroup(placement: .topBarLeading) {
        HStack(spacing: 4) {
          Spacer()
          
          Text("️Ask my AI")
            .font(.SFProRounded(.bold, size: 14))
        }
      }
    }
    .onDisappear {
      viewModel.activateAskAiButton()
    }
  }
  
  @ViewBuilder
  func messageView(for message: MessageModel) -> some View {
    switch message.messageType {
    case .AI:
      if message.loading {
        AILoading
      } else {
        MessageView(audioVM: AudioPlayViewModel(message: message))
      }
    case .user:
      if message.loading {
        userLoading
      } else {
        MessageView(audioVM: AudioPlayViewModel(message: message))
      }
    }
  }
  
  // MARK: User Loading View
  
  var userLoading: some View {
    HStack {
      Spacer()
      ZStack {
        Image("loadingAIRight")
        viewModel.loadAnimation
          .resizable()
          .frame(width: 24, height: 12)
          .offset(x: -2, y: -5)
      }
    }
  }
  
  // MARK: AI Loading View

  var AILoading: some View {
    HStack {
      ZStack {
        Image("loadingAILeft")
        viewModel.loadAnimation
          .resizable()
          .frame(width: 24, height: 12)
          .offset(x: 2, y: -5)

      }
      Spacer()
    }
  }
}
