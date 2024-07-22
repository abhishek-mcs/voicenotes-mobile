//
//  RecordAudioView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/11/24.
//

import SwiftUI

let numberOfSamples: Int = 5

struct RecordAudioView: View {
  
  @StateObject var viewModel: RecordAudioViewModel
  
  @Binding var cardShown: Bool
  
    var body: some View {
      ZStack {
        GeometryReader { _ in
          EmptyView()
        }
        .background(.black.opacity(0.7))
        .opacity(cardShown ? 1 : 0)
        
        VStack {
          Spacer()
          
          VStack(spacing: .zero) {
            HStack(spacing: 5) {
              Text(viewModel.recording ? "Rec" : "Paused")
                .font(.SFProRounded(.bold, size: 12))
                .foregroundStyle(Color("F2F2F7").opacity(0.5))
              
              Spacer()
              Circle()
                .frame(width: 6)
                .foregroundStyle(Color("FF3B30"))
              
              Text(viewModel.formattedTime)
                .font(.SFProRounded(.bold, size: 12))
                .foregroundStyle(Color("F2F2F7").opacity(0.5))
            }
            .padding(.horizontal, 17)
            
            HStack(spacing: 2) {
              ForEach(viewModel.mic.soundSamples, id: \.self) { level in
                BarView(value: viewModel.normalizeSoundLevel(level: level))
              }
            }
            .frame(height: 70)
            
            HStack(spacing: 5) {
              Button {
                if viewModel.mic.audioRecorder.currentTime < 10 {
                  viewModel.cancelRecording()
                  withAnimation {
                    cardShown = false
                  }
                } else {
                  viewModel.recordingWhileCancel = viewModel.recording
                  viewModel.stopRecording()
                  viewModel.cancel()
                }
              } label: {
                Image("close")
              }
              .tint(.red)
              
              Button {
                viewModel.recordButtonTapped()
              } label: {
                viewModel.recording ? Image("pause") : Image("play")
              }
              
              Button {
                viewModel.approveRecording()
              } label: {
                Image("approve")
              }
              .tint(.green)
              .disabled(!viewModel.startRecording)
            }
            .padding(.horizontal, 10)
          }
          .padding(.vertical, 8)
          .background(Color("1B1B1B"))
          .cornerRadius(24)
          .offset(y: cardShown ? 0 : 200)
        }
        .ignoresSafeArea()
      }
    }
}

#Preview {
  RecordAudioView(viewModel: RecordAudioViewModel(completion: { _, _ in }, cancel: {}), cardShown: .constant(true))
}

