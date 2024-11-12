//
//  WatchAppApp.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/6/24.
//

import SwiftUI
import NerdzInject
import SwiftData

@main
struct WatchApp_Watch_AppApp: App {
  
    init() {
        configureDependencyInjection()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: RecordingDataModel.self)
    }
  
    private func configureDependencyInjection() {
        let networkService = NetworkService()
      
        NerdzInject.shared.registerObject(AuthRepository(networkService: networkService))
        NerdzInject.shared.registerObject(RecordingRepository(networkService: networkService))
        NerdzInject.shared.registerObject(AIChatRepository(networkService: networkService))
    }
}
