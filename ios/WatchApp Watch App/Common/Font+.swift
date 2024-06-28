//
//  Font+.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/25/24.
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
