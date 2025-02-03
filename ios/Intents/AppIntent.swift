//
//  AppIntent.swift
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 9/12/24.
//

import Foundation
import AppIntents
import React

@available(iOS 16, *)
struct AskAIIntent: AppIntent {
  static let title: LocalizedStringResource = "Ask AI"
  static var openAppWhenRun: Bool = true

  
  @MainActor
  func perform() -> some IntentResult {
    // Get the current bridge instance
    if let bridge = RCTBridge.current(),
       let actionModule = bridge.module(for: ActionModule.self) as? ActionModule {
      // Call the startRecord function on the module instance from the bridge
      actionModule.askAI()
    } else {
      print("Failed to get ActionModule")
    }
//    
//    let appGroupModule = ActionModule()
//    appGroupModule.askAI()
    return .result()
  }
}

@available(iOS 16, *)
struct RecordIntent: AppIntent {
  static let title: LocalizedStringResource = "Record"
  static var openAppWhenRun: Bool = true

  @MainActor
  func perform() -> some IntentResult {
    if let bridge = RCTBridge.current(),
       let actionModule = bridge.module(for: ActionModule.self) as? ActionModule {
      // Call the startRecord function on the module instance from the bridge
      actionModule.startRecord()
    } else {
      print("Failed to get ActionModule")
    }
    
//    let appGroupModule = ActionModule()
//    appGroupModule.startRecord()
    return .result()
  }
}

@available(iOS 16, *)
struct SearchIntent: AppIntent {
  static let title: LocalizedStringResource = "Search"
  static var openAppWhenRun: Bool = true

  @MainActor
  func perform() -> some IntentResult {
    if let bridge = RCTBridge.current(),
       let actionModule = bridge.module(for: ActionModule.self) as? ActionModule {
      // Call the startRecord function on the module instance from the bridge
      actionModule.searchNote()
    } else {
      print("Failed to get ActionModule")
    }
//    let appGroupModule = ActionModule()
//    appGroupModule.searchNote()
    return .result()
  }
}

@available(iOS 16, *)
struct TextNoteIntent: AppIntent {
  static let title: LocalizedStringResource = "Text Note"
  static var openAppWhenRun: Bool = true

  // Add a parameter to capture the text input
  @Parameter(title: "Note Content")
  var noteContent: String

  @MainActor
  func perform() -> some IntentResult {
    if let bridge = RCTBridge.current(),
       let actionModule = bridge.module(for: ActionModule.self) as? ActionModule {
      // Call the addToTextNote function on the module instance from the bridge
      actionModule.addToTextNote(content: noteContent)
    } else {
      print("Failed to get ActionModule")
    }
//    let appGroupModule = ActionModule()
//    appGroupModule.searchNote()
    return .result()
  }
}