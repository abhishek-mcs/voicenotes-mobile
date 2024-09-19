//
//  GotItView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/11/24.
//

import SwiftUI

struct GotItView: View {
  
  @Binding var cardShown: Bool
  
  var body: some View {
    ZStack {
      GeometryReader { _ in
        EmptyView()
      }
      .background(.black.opacity(0.7))
      .opacity(cardShown ? 1 : 0)
      .onTapGesture {
        withAnimation {
          self.cardShown.toggle()
        }
      }
      
      VStack {
        Spacer()
        
        VStack(spacing: 14) {
          RoundedRectangle(cornerRadius: 2)
            .frame(width: 50, height: 4)
            .foregroundStyle(.white.opacity(0.07))
          
          HStack(spacing: .zero) {
            Text("Your voice is securely saved and will be transcribed automatically once you’re back online.")
              .font(.SFProRounded(.demibold, size: 12))
            Spacer()
          }
          .padding(.horizontal, 16)
          
          HStack(spacing: 5) {
            Button {
              withAnimation {
                cardShown = false
              }
            } label: {
              Text("Got it")
                .font(.SFProRounded(.heavy, size: 12))
            }
          }
          .padding(.horizontal, 16)
        }
        .padding(.bottom, 16)
        .padding(.top, 4)
        .background(Color("292929"))
        .cornerRadius(24)
        .offset(y: cardShown ? 0 : 200)
      }
      .ignoresSafeArea()
    }
  }
}

#Preview {
  GotItView(cardShown: .constant(true))
}
