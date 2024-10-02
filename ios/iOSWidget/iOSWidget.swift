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
        .containerBackground(.windowBackground, for: .widget)
    }
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
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
    case .accessoryCircular:
      accessoryCircular
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
            .resizable()
            .frame(width: 20, height: 20)
          Text("Ask")
            .font(.custom("SF Pro Rounded Semibold", size: 16))
            .multilineTextAlignment(.center)
            .foregroundStyle(Color("askAIText"))
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
            .foregroundStyle(Color.white)
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
    Link(destination: URL(string: "voicenotes://searchDeeplink")!) {
      VStack(spacing: .zero) {
        Spacer(minLength: .zero)
        HStack(spacing: 5) {
          Spacer(minLength: .zero)
          Image("search")
          Text("Search notes")
            .font(.custom("SF Pro Rounded Medium", size: 18))
            .multilineTextAlignment(.center)
            .foregroundStyle(Color("searchText"))
          Spacer(minLength: .zero)
        }
        Spacer(minLength: .zero)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .background(Color("askAIButton"))
    .cornerRadius(20)
  }
  
  // MARK: Accessory Circular
  
  var accessoryCircular: some View {
    ZStack {
      AccessoryWidgetBackground()
      
      GeometryReader { geometry in
        let width = geometry.size.width
        let height = geometry.size.height
        
        Group {
          LogoLine(start: CGPoint(x: 0.48*width, y: 0.05*height),
                   end: CGPoint(x: 0.52*width, y: 0.05*height))
          LogoLine(start: CGPoint(x: 0.405*width, y: 0.15*height),
                   end: CGPoint(x: 0.585*width, y: 0.15*height))
          LogoLine(start: CGPoint(x: 0.29*width, y: 0.25*height),
                   end: CGPoint(x: 0.74*width, y: 0.25*height))
          LogoLine(start: CGPoint(x: 0.275*width, y: 0.35*height),
                   end: CGPoint(x: 0.725*width, y: 0.35*height))
          LogoLine(start: CGPoint(x: 0.09*width, y: 0.45*height),
                   end: CGPoint(x: 0.89*width, y: 0.45*height))
          LogoLine(start: CGPoint(x: 0.125*width, y: 0.55*height),
                   end: CGPoint(x: 0.875*width, y: 0.55*height))
          LogoLine(start: CGPoint(x: 0.05*width, y: 0.65*height),
                   end: CGPoint(x: 1.09*width, y: 0.65*height))
          LogoLine(start: CGPoint(x: 0.0*width, y: 0.75*height),
                   end: CGPoint(x: 1.0*width, y: 0.75*height))
        }
        .rotationEffect(.degrees(-63))
      }
      .frame(width: 38, height: 38)
    }
    .widgetURL(URL(string: "voicenotes://record"))
    .widgetAccentable()
  }
}

#Preview(as: .systemMedium) {
    iOSWidget()
} timeline: {
    SimpleEntry(date: .now)
}

struct LogoLine: View {
    var start: CGPoint
    var end: CGPoint
    
    var body: some View {
        Path { path in
            path.move(to: start)
            path.addLine(to: end)
        }
        .stroke(.white, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
    }
}
