//
//  AIRecordingView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI

struct AIRecordingView: View {
  
  @StateObject var viewModel: AIRecordingViewModel
  
  @Binding var cardShown: Bool
  
    var body: some View {
      ZStack {
        GeometryReader { _ in
          EmptyView()
        }
        .background(.black.opacity(0.7))
        .opacity(cardShown ? 1 : 0)
//        .onTapGesture {
//          withAnimation {
//            viewModel.cancelRecording()
//            self.cardShown.toggle()
//          }
//        }
        
        VStack {
          Spacer()
          
          VStack(spacing: .zero) {
            Text("Ask about your notes.")
              .font(.SFProRounded(.bold, size: 12))
              .foregroundStyle(Color("F2F2F7").opacity(0.5))
                        
            HStack(spacing: 2) {
              ForEach(viewModel.mic.soundSamples, id: \.self) { level in
                BarView(value: viewModel.normalizeSoundLevel(level: level))
              }
            }
            .frame(height: 70)
            
            HStack(spacing: 10) {
              Button {
                viewModel.stopRecording()
                viewModel.cancel()
              } label: {
                Image("close")
              }
              .tint(.red)
              
              
              HStack(spacing: 5) {
                Circle()
                  .frame(width: 6)
                  .foregroundStyle(Color("E24A3B"))
                
                Text(viewModel.formattedTime)
                  .font(.SFProRounded(.bold, size: 12))
                  .foregroundStyle(Color.white)
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
  AIRecordingView(viewModel: AIRecordingViewModel(subscriptionStatus: false, completion: { _, _ in }, cancel: {}), cardShown: .constant(true))
}
