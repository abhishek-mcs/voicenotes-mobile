//
//  ContentView.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/6/24.
//

import UIKit
import SwiftUI
import NerdzInject
import Combine
import SwiftData

struct ContentView: View {
    
  @StateObject var viewModel = ContentViewModel()
  @Environment(\.modelContext) private var context
  @Query private var recordings: [RecordingDataModel]
  
  var body: some View {
    ZStack {
      NavigationStack(path: Binding(
          get: { viewModel.navigationPath },
          set: { newValue in
              withAnimation {
                  viewModel.navigationPath = newValue
              }
          }
      )) {
        VStack {
          if viewModel.isAccessTokenValid {
            if viewModel.noInternet {
              HStack(spacing: 2) {
                Image("book")
                  .renderingMode(.template)
                  .foregroundColor(Color("AEAEB2"))
                
                Text("️Offline mode")
                  .font(.SFProRounded(.demibold, size: 12))
                  .foregroundColor(Color("AEAEB2"))
              }
            }
            List {
              ForEach(viewModel.recordings) { recording in
                NavigationLink(value: ScreenType.recordingDetails(recording)) {
                  listItemView(model: recording)
                    .onAppear {
                      if recording == viewModel.recordings.last {
                        viewModel.getAllRecordings(page: viewModel.listPage)
                      }
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                      Button(role: .destructive) {
                        viewModel.recordingForDelete = recording
                        withAnimation {
                          viewModel.showDeleteView = true
                        }
                      } label: {
                        Image(systemName: "trash")
                      }
                    }
                }
              }
            }
            .animation(.default, value: viewModel.recordings)
          } else {
            VStack(spacing: 12) {
              Image("phone")
              
              Text("Please log in from the mobile app to continue.")
                .font(.SFProRounded(.bold, size: 14))
                .multilineTextAlignment(.center)
              
              Text("REFRESH")
                .font(.SFProRounded(.bold, size: 14))
                .multilineTextAlignment(.center)
                .foregroundStyle(.white)
                .frame(width: 100, height: 40)
                .background(Color.white.opacity(0.3))
                .cornerRadius(.infinity)
                .onTapGesture {
                  viewModel.updateTokenValidation()
                }
            }
          }
        }
        .navigationDestination(for: ScreenType.self) { screenType in
            switch screenType {
            case .recordingDetails(let recording):
              RecordingDetailView(viewModel: RecordingDetailViewModel(recording: recording))
            case .askAI:
              AskAIChatView(viewModel: AskAIChatViewModel())
            }
        }
        .toolbar {
          ToolbarItemGroup(placement: .topBarLeading) {
            VStack(spacing: .zero) {
              HStack(spacing: 4) {
                Image("appIcon")
                Text("️Voicenotes")
                  .font(.SFProRounded(.bold, size: 16))
              }
              Spacer()
            }
          }
        }
      }
      
      if viewModel.isAccessTokenValid {
        HStack(spacing: 5) {
          if !viewModel.navigationPath.contains(.askAI) {
            recordButton
          }
          askAIButton
        }
      }
      
      RecordAudioView(viewModel: viewModel.initRecordAudioViewModel(), cardShown: $viewModel.showRecordView)
      AIRecordingView(viewModel: viewModel.initAIRecordingViewModel(), cardShown: $viewModel.showAIRecordView)
      
      CancelView(cardShown: $viewModel.showCancelView, aprove: { success in
        if success {
          viewModel.recordAudioViewModel.cancelRecording()
          viewModel.aiRecordingViewModel.cancelRecording()
          withAnimation {
            viewModel.showRecordView = false
            viewModel.showAIRecordView = false
          }
        }
      })
      DeleteView(cardShown: $viewModel.showDeleteView, aprove: { success in
        if success {
          viewModel.deleteNote()
        }
      })
      
      GotItView(cardShown: $viewModel.showGotItView)
    }
    .onAppear() {
      viewModel.update(context: context, recordings: recordings)
      viewModel.deleteRecording = { recording in
        guard let index = recordings.firstIndex(where: { $0.id == recording.id}) else { return }
        context.delete(recordings[index])
      }
    }
  }
  
  // MARK: List Item View
  
  func listItemView(model: RecordModel) -> some View {
    VStack(alignment: .leading, spacing: 2) {
      HStack(spacing: 4) {
        Image(systemName: "play.circle")
          .resizable()
          .frame(width: 12, height: 12)
        Text(viewModel.formatMilliseconds(model.duration))
          .font(.SFProRounded(.demibold, size: 12))
        Spacer()
        Text(viewModel.convertDateString(model.createdAt))
          .font(.SFProRounded(.demibold, size: 12))
      }
      .foregroundStyle(.white.opacity(0.5))
      
      if model.isCheckInternet {
        viewModel.loadAnimation
          .resizable()
          .frame(width: 24, height: 12)
        Text("Checking internet connection.")
          .font(.SFProRounded(.bold, size: 14))
          .foregroundStyle(Color("58A942"))
      } else if model.isUploadingAudio {
        viewModel.loadAnimation
          .resizable()
          .frame(width: 24, height: 12)
        Text("Uploading your audio.")
          .font(.SFProRounded(.bold, size: 14))
          .foregroundStyle(Color("58A942"))
      } else if model.isCreatingTranscript {
        viewModel.loadAnimation
          .resizable()
          .frame(width: 24, height: 12)
        Text("Creating transcript from your voice.")
          .font(.SFProRounded(.bold, size: 14))
          .foregroundStyle(Color("58A942"))
      } else if model.audioData != nil {
        Text("New recording")
          .font(.SFProRounded(.bold, size: 14))
          .foregroundStyle(Color("F2F2F7"))
        ZStack(alignment: .topLeading) {
          Image(systemName: "clock")
            .font(.SFProRounded(.bold, size: 13))
            .foregroundColor(Color("0A84FF"))
            .offset(y: 1)
          Text("      Synced and transcribed when you're back online....")
            .font(.SFProRounded(.medium, size: 13))
            .foregroundStyle(Color("0A84FF"))
            .lineLimit(2)
        }
        .onTapGesture {
          viewModel.uploadLocalNote(model: model)
        }
      } else {
        Text(model.title ?? "New recording")
          .font(.SFProRounded(.bold, size: 14))
          .foregroundStyle(Color("F2F2F7"))
          .lineLimit(1)
        
        if let transcript = model.transcript {
          Text(transcript)
            .font(.SFProRounded(.medium, size: 13))
            .foregroundStyle(.white.opacity(0.7))
            .lineLimit(2)
        } else {
          Text("There was an error generating your transcript")
            .font(.SFProRounded(.medium, size: 13))
            .foregroundStyle(Color("FF3B30"))
        }
      }
    }
  }
  
  // MARK: Record Button View
  
  var recordButton: some View {
    VStack {
      Spacer()
      HStack(spacing: 5) {
        ZStack {
          Circle()
            .frame(width: 13)
            .foregroundStyle(.black.opacity(0.3))
          Circle()
            .frame(width: 5)
            .foregroundStyle(Color("FF3B30"))
        }
        Text("Record")
          .font(.SFProRounded(.bold, size: 14))
          .multilineTextAlignment(.center)
          .foregroundStyle(.white)
      }
      .frame(width: 90, height: 35)
      .background(Color("FF3B30"))
      .cornerRadius(.infinity)
      .onTapGesture {
        withAnimation {
          viewModel.showRecordView = true
          viewModel.recordAudioViewModel.recordButtonTapped()
        }
      }
    }
    .padding(.bottom, 15)
    .ignoresSafeArea()
  }
  
  // MARK: Ask AI Button View
  
  var askAIButton: some View {
    VStack {
      Spacer()
      HStack(spacing: 4) {
        Image("cloud")
        Text("Ask AI")
          .font(.SFProRounded(.bold, size: 14))
          .multilineTextAlignment(.center)
          .foregroundStyle(.black)
      }
      .frame(width: 90, height: 35)
      .background(Color.white)
      .cornerRadius(.infinity)
      .onTapGesture {
        withAnimation {
          viewModel.navigationPath.append(ScreenType.askAI)
//          viewModel.showAIRecordView = true
//          viewModel.aiRecordingViewModel.recordButtonTapped()
        }
      }
    }
    .padding(.bottom, 15)
    .ignoresSafeArea()
  }
}

#Preview {
  ContentView()
}
