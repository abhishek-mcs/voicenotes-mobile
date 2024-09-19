//
//  RecordingModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/10/24.
//

import Foundation
import SwiftData

@Model
class RecordingDataModel {
    var id = UUID().uuidString
    var duration: Int
    var audioData: Data
    var createdAt: Date

  init(duration: Int, audioData: Data, createdAt: Date) {
        self.duration = duration
        self.audioData = audioData
        self.createdAt = createdAt
    }
}
