//
//  sdfghjkLiveActivity.swift
//  sdfghjk
//
//  Created by Andriy Hrytsyshyn on 9/11/24.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct sdfghjkAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct sdfghjkLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: sdfghjkAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension sdfghjkAttributes {
    fileprivate static var preview: sdfghjkAttributes {
        sdfghjkAttributes(name: "World")
    }
}

extension sdfghjkAttributes.ContentState {
    fileprivate static var smiley: sdfghjkAttributes.ContentState {
        sdfghjkAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: sdfghjkAttributes.ContentState {
         sdfghjkAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: sdfghjkAttributes.preview) {
   sdfghjkLiveActivity()
} contentStates: {
    sdfghjkAttributes.ContentState.smiley
    sdfghjkAttributes.ContentState.starEyes
}
