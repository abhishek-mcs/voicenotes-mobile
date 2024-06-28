//
//  RecordingsModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import Foundation

struct RecordingsModel: Codable {
    let data: [RecordModel]
    let meta: MetaModel
}

struct RecordModel: Codable, Equatable, Identifiable, Hashable {
    var id: String
    var recordingId: String
    var createdAt: String
    var updatedAt: String
    var title: String?
    var transcript: String?
    var duration: Int
    var isPublished: Int?
    var audioData: Data?
    var isCheckInternet = false
    var isUploadingAudio = false
    var isCreatingTranscript = false
    
    enum CodingKeys: String, CodingKey {
        case id
        case recordingId = "recording_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case title
        case transcript
        case duration
        case isPublished = "is_published"
    }
}

struct MetaModel: Codable {
    let currentPage: Int
    let from: Int
    let path: String
    let perPage: Int
    let to: Int
    
    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case from
        case path
        case perPage = "per_page"
        case to
    }
}
