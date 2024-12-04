//
//  RelatedRecordingModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import Foundation

struct RelatedRecordingModel: Codable {
    let id: Int
    let recordingId: Int
    let createdAt: String
    let title: String
    let transcript: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case recordingId = "recording_id"
        case createdAt = "created_at"
        case title
        case transcript
    }
}
