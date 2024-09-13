//
//  MessageBarView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/30/24.
//

import SwiftUI

struct MessageBarView: View {
    let value: CGFloat
    var color = Color("808080")
  
    var body: some View {
        ZStack {
            Rectangle()
                .fill(color)
                .cornerRadius(10)
                .frame(width: 2, height: value)
        }
    }
}
