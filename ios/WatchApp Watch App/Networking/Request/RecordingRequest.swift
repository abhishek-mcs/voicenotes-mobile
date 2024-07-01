//
//  RecordingRequest.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import KeychainSwift

enum RecordingRequestEndpoint {
    case getAudio(recordingId: String)
    case storeAudio(model: StoreAudioModel)
    case addTranscript(recordingId: String)
    case addTitle(recordingId: String)
    case getAllRecordings(page: Int)
    case getRecordingSuggestion
    case getIndividualRecording(recordingId: String)
    case deleteRecording(recordingId: String)
    case getRelatedRecordings(recordingId: String)
}

final class RecordingRequest: BaseRouter {

    private let endpoint: RecordingRequestEndpoint
    private let keychain = KeychainSwift()

    init(endpoint: RecordingRequestEndpoint) {
        self.endpoint = endpoint
    }
    
    override var path: String {
        switch endpoint {
        case .getAudio(let recordingId):
            return "/api/recordings/\(recordingId)/signed-url"
        case .storeAudio:
            return "/api/recordings"
        case .addTranscript(let recordingId):
            return "/api/recordings/\(recordingId)/transcript"
        case .addTitle(let recordingId):
            return "/api/recordings/\(recordingId)/title"
        case .getAllRecordings:
            return "/api/recordings"
        case .getRecordingSuggestion:
            return "/api/recordings/suggestion"
        case .getIndividualRecording(let recordingId):
            return "/api/recordings/\(recordingId)"
        case .deleteRecording(let recordingId):
            return "/api/recordings/\(recordingId)"
        case .getRelatedRecordings(let recordingId):
            return "/api/recordings/\(recordingId)/related"
        }
    }

    override var headers: [String: String]? {
        switch endpoint {
        case .getAudio, .addTranscript, .addTitle, .getAllRecordings, .getRecordingSuggestion, .getIndividualRecording, .deleteRecording, .getRelatedRecordings:
            [
                "Authorization": "Bearer \(keychain.get(KeychainKeys.accessToken) ?? "")",
                "accept": "application/json",
                "Content-Type": "application/json"
            ]
        case .storeAudio(model: let model):
            [
                "Authorization": "Bearer \(keychain.get(KeychainKeys.accessToken) ?? "")",
                "accept": "application/json",
                "Content-Type": "multipart/form-data; boundary=\(model.boundary)"
            ]
        }
    }
    
    override var method: HTTPMethod {
        switch endpoint {
        case .storeAudio:
            return .post
        case .addTranscript, .addTitle:
            return .patch
        case .getAudio, .getAllRecordings, .getRecordingSuggestion, .getIndividualRecording, .getRelatedRecordings:
            return .get
        case .deleteRecording:
          return .delete
        }
    }
    
    override var body: Data? {
        switch endpoint {
        case .getAudio, .addTranscript, .addTitle, .getAllRecordings, .getRecordingSuggestion, .getIndividualRecording, .deleteRecording, .getRelatedRecordings:
            return nil
        case .storeAudio(let model):
            return model.multipartBody
        }
    }
    
    func queryString(_ value: String, params: [String: String]) -> String? {
        var components = URLComponents(string: value)
        components?.queryItems = params.map { element in URLQueryItem(name: element.key, value: element.value) }
        return components?.url?.absoluteString
    }

    override var queryItems: [URLQueryItem]? {
        switch endpoint {
        case .getAudio, .storeAudio, .addTranscript, .addTitle, .getRecordingSuggestion, .getIndividualRecording, .deleteRecording, .getRelatedRecordings:
            nil
        case .getAllRecordings(let page):
            [URLQueryItem(name: "page", value: String(page))]
        }
    }
}
