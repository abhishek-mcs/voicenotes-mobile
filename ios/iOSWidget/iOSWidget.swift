//
//  iOSWidget.swift
//  iOSWidget
//
//  Created by Andriy Hrytsyshyn on 9/10/24.
//

import WidgetKit
import SwiftUI

// MARK: iOS Widget

struct iOSWidget: Widget {
  let kind: String = "iOSWidget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      iOSWidgetEntryView(entry: entry)
        .containerBackground(.fill.tertiary, for: .widget)
    }
    .supportedFamilies([.systemSmall, .systemMedium])
    .configurationDisplayName("Voicenote widgets")
    .description("Voicenote widgets")
  }
}


struct SimpleEntry: TimelineEntry {
    let date: Date
}

struct Provider: TimelineProvider {
    // Placeholder view for when no data is available
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    // Static snapshot for quick rendering
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }

    // Timeline for widget, no updates needed
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let entry = SimpleEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .never) // No updates
        completion(timeline)
    }
}

struct iOSWidgetEntryView: View {
  var entry: SimpleEntry
  @Environment(\.widgetFamily) var family
  @Environment(\.openURL) var openURL
  
  var body: some View {
    switch family {
    case .systemSmall:
      VStack(spacing: 8) {
        askButton
        recordButton
      }
    case .systemMedium:
      VStack(spacing: 12) {
        searchButton
        
        HStack(spacing: 18) {
          recordButton
          askButton
        }
      }
      default: Text("Not implemented!")
    }
  }
  
  // MARK: Ask Button
  
  var askButton: some View {
    Link(destination: URL(string: "voicenotes://ask")!) {
      VStack(spacing: .zero) {
        Spacer(minLength: .zero)
        HStack(spacing: 5) {
          Spacer(minLength: .zero)
          Image("cloud")
          Text("Ask")
            .font(.custom("SF Pro Rounded Semibold", size: 16))
            .multilineTextAlignment(.center)
            .foregroundStyle(.black)
          Spacer(minLength: .zero)
        }
        Spacer(minLength: .zero)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .background(Color("askAIButton"))
    .cornerRadius(20)
  }
  
  // MARK: Record Button

  var recordButton: some View {
    Link(destination: URL(string: "voicenotes://record")!) {
      VStack(spacing: .zero) {
        Spacer(minLength: .zero)
        HStack(spacing: 5) {
          Spacer(minLength: .zero)
          ZStack {
            Circle()
              .frame(width: 20)
              .foregroundStyle(Color("FF4538"))
            Circle()
              .frame(width: 7)
              .foregroundStyle(Color.black)
          }
          Text("Record")
            .font(.custom("SF Pro Rounded Semibold", size: 16))
            .multilineTextAlignment(.center)
            .foregroundStyle(Color("recordText"))
          Spacer(minLength: .zero)
        }
        Spacer(minLength: .zero)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .background(Color("recordButton"))
    .cornerRadius(20)
  }
  
  
  // MARK: Search Button
  
  var searchButton: some View {
    Link(destination: URL(string: "voicenotes://search")!) {
      VStack(spacing: .zero) {
        Spacer(minLength: .zero)
        HStack(spacing: 5) {
          Spacer(minLength: .zero)
          Image("search")
          Text("Search notes")
            .font(.custom("SF Pro Rounded Medium", size: 18))
            .multilineTextAlignment(.center)
            .foregroundStyle(Color.black)
          Spacer(minLength: .zero)
        }
        Spacer(minLength: .zero)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .background(Color("askAIButton"))
    .cornerRadius(20)
  }
}
