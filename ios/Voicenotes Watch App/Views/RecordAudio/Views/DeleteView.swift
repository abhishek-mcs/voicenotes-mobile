//
//  DeleteView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import SwiftUI

struct DeleteView: View {
  
  @Binding var cardShown: Bool
  var aprove: (Bool) -> Void
  
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
        
        VStack(spacing: 11) {
          RoundedRectangle(cornerRadius: 2)
            .frame(width: 50, height: 4)
            .foregroundStyle(.white.opacity(0.07))
          
          Text("Are you sure you want to delete this note?")
            .font(.SFProRounded(.bold, size: 14))
            .multilineTextAlignment(.center)
          
          HStack(spacing: 5) {
            Button {
              withAnimation {
                cardShown = false
              }
              aprove(true)
            } label: {
              Text("Yes")
                .font(.SFProRounded(.heavy, size: 12))
            }
            .tint(.red)
            
            Button {
              withAnimation {
                cardShown = false
              }
              aprove(false)
            } label: {
              Text("No")
                .font(.SFProRounded(.heavy, size: 12))
            }
          }
        }
        .padding(.horizontal, 6)
        .padding(.bottom, 8)
        .padding(.top, 4)
        .background(Color("292929"))
        .cornerRadius(24)
        .offset(y: cardShown ? 0 : 200)
      }
      .padding(.bottom)
      .ignoresSafeArea()
    }
  }
}

#Preview {
  DeleteView(cardShown: .constant(true), aprove: { _ in })
}
