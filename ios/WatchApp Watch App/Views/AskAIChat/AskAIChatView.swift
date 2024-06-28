//
//  AskAIChatView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI

struct AskAIChatView: View {
  
  @StateObject var viewModel: AskAIChatViewModel
  
  var body: some View {
    ScrollView {
      VStack {
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
        ZStack {
          Image("chatUserAnswer")
            .resizable()
          VStack(spacing: .zero) {
            
            
            ZStack {
              Circle()
                .frame(width: 22)
              
              Image("play")
                .resizable()
                .renderingMode(.template)
                .frame(width: 8, height: 9)
                .foregroundStyle(.black)
                .offset(x: 0.5)
            }
            .onTapGesture {
              
            }
            

            HStack(spacing: .zero) {
              Text("Looking back, what were the highlights of my past month?")
                .font(.SFProRounded(.regular, size: 10))
                .foregroundStyle(Color.white.opacity(0.5))
              Spacer(minLength: .zero)
            }
          }
          .padding(.horizontal, 10)
        }
        
//        ZStack {
//          Image("chatAIAnswer")
//            .resizable()
//          
//        }
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
  }
}

#Preview {
  AskAIChatView(viewModel: AskAIChatViewModel())
}
