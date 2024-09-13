//
//  Extensions.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/30/24.
//

import SwiftUI

extension Font {
    enum sfProRounded {
        case heavy
        case bold
        case demibold
        case medium
        case regular
        case light

      var value: String {
            switch self {
            case .heavy:
                return "SF Pro Rounded Heavy"
            case .bold:
                return "SF Pro Rounded Bold"
            case .demibold:
                return "SF Pro Rounded Semibold"
            case .medium:
                return "SF Pro Rounded Medium"
            case .regular:
                return "SF Pro Rounded Regular"
            case .light:
                return "SF Pro Rounded Light"
            }
        }
    }
    
    static func SFProRounded(_ type: sfProRounded, size: CGFloat) -> Font {
        return .custom(type.value, size: size)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

extension Array {
    func chunked(into size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0 ..< Swift.min($0 + size, count)])
        }
    }
}
