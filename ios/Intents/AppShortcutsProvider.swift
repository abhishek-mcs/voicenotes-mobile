//
//  AppShortcutsProvider.swift
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 9/12/24.
//

import AppIntents

@available(iOS 16, *)
struct SiriAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    
    AppShortcut(intent: RecordIntent(), phrases: [
      "Record \(.applicationName)",
      "Record Voicenote"
    ],
                shortTitle: "Record note",
                systemImageName: "waveform.badge.plus")
    
    AppShortcut(intent: AskAIIntent(), phrases: [
      "Ask AI \(.applicationName)",
      "Ask AI"
    ],
                shortTitle: "Ask AI",
                systemImageName: "message.badge.waveform.fill")
    
    AppShortcut(intent: SearchIntent(), phrases: [
      "Search \(.applicationName)"
    ],
                shortTitle: "Search note",
                systemImageName: "waveform.badge.magnifyingglass")
    
    AppShortcut(intent: TextNoteIntent(), phrases: [
      "Add to \(.applicationName)",
      "Add to voice notes",
      "Add to voice note",
      "Add a text note to voice notes",
    ],
                shortTitle: "Create Text Note",
                systemImageName: "note.text")
  }
}
