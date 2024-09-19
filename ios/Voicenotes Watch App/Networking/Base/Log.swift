//
//  Log.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/3/24.
//

import Foundation

final class Log {
    
    private static let isActive = true
    private static let dateFormatter: DateFormatter = {
        $0.dateFormat = "HH:mm:ss.SSS"
        return $0
    }(DateFormatter())
    
    static func error(_ message: String) {
        Log.aprint(message, emoji: "⛔")
    }
    
    static func atention(_ message: String) {
        Log.aprint(message, emoji: "⚠️")
    }
    
    static func action(_ message: String) {
        Log.aprint(message, emoji: "✅")
    }
    
    static func aprint(_ text: String, emoji: String = "") {

        guard isActive else {
            return
        }

        #if DEBUG
        print("\(emoji) [\(currentDate())]: \(text)")
        print("=============================================================\n")
        #endif
    }
    
    private static func currentDate() -> String {
        dateFormatter.string(from: Date())
    }
}


enum LogsLevel {
    /// Very detailing logs
    case debug
    /// Logs which show just method, url and success code for request
    case short
    /// Logs disabled
    case none
}
