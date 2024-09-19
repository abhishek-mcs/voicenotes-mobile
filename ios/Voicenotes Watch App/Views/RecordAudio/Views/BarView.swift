//
//  BarView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/11/24.
//

import SwiftUI

struct BarView: View {
    var value: CGFloat

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20)
                .frame(width: 15, height: value)
        }
    }
}

