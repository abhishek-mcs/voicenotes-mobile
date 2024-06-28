//
//  RecordingDetailView.swift
//  Watch-voicenotes Watch App
//
//  Created by Andriy Hrytsyshyn on 6/5/24.
//

import SwiftUI

struct RecordingDetailView: View {
    
  @StateObject var viewModel: RecordingDetailViewModel

  var body: some View {
    ZStack {
      ScrollView {
        
        VStack(alignment: .leading, spacing: 3) {
          Text(viewModel.recording.title ?? "New recording")
            .font(.SFProRounded(.bold, size: 18))
            .foregroundStyle(Color("F2F2F7"))
          
          HStack {
            Text(viewModel.convertDateString(viewModel.recording.createdAt))
              .font(.SFProRounded(.medium, size: 12))
              .foregroundStyle(Color("AEAEB2"))
            Spacer()
          }
          
          Text(viewModel.recording.transcript ?? "No transcript")
            .font(.SFProRounded(.bold, size: 14))
            .foregroundStyle(Color("F2F2F7"))
        }
      }
      .navigationTitle {
        HStack(spacing: 2) {
          Image(viewModel.song1 ? "pause" : "play")
            .renderingMode(.template)
            .foregroundStyle(Color("0A84FF"))
          
          Text(viewModel.audioTime)
            .font(.SFProRounded(.bold, size: 14))
            .foregroundStyle(Color("0A84FF"))
            .frame(width: 50)
        }
        .frame(height: 24)
        .padding(.horizontal, 8)
        .background(Color("0A84FF").opacity(0.2))
        .cornerRadius(12)
        .onTapGesture {
          guard viewModel.isAudioReady else { return }
          viewModel.song1.toggle()
          
          if viewModel.song1 {
            viewModel.audioPlayer?.play()
          } else {
            viewModel.audioPlayer?.pause()
          }
        }
      }
    }
  }
}

#Preview {
  RecordingDetailView(viewModel: RecordingDetailViewModel(recording: RecordModel(
    id: UUID().uuidString,
    recordingId: UUID().uuidString,
    createdAt: "2024-06-03T14:35:07.000000Z",
    updatedAt: "2024-06-04T14:18:40.000000Z",
    title: "New lyric idea",
    transcript: "In the velvet embrace of night, where shadows dance in the moon's soft light, echoes of laughter take flight.Expanding the imagery and adding a bit of lyrical depth, this version creates a richer scene for your chorus. For chords, you might consider something ethereal and expansive like Dm, Am7, G, and Em to enhance the atmospheric feel of the lyrics.",
    duration: 3410,
    isPublished: 0)))
}
