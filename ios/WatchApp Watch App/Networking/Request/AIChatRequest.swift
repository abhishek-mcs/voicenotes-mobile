//
//  AIChatRequest.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import KeychainSwift

enum AIChatRequestEndpoint {
    case createAIChat(audio: StoreAudioModel)
    case getAnswer(messageId: String)
    case addNewMessage(threadId: String, audio: StoreAudioModel)
    case getAllChat
    case deleteChat(threadId: String)
}

final class AIChatRequest: BaseRouter {

    private let endpoint: AIChatRequestEndpoint
    private let keychain = KeychainSwift()

    init(endpoint: AIChatRequestEndpoint) {
        self.endpoint = endpoint
    }
    
    override var path: String {
        switch endpoint {
        case .createAIChat:
            return "/api/ai-chat-thread/audio"
        case .getAnswer(let messageId):
            return "/api/ai-chat-thread/\(messageId)/audio-answer"
        case .addNewMessage(let threadId, _):
            return "/api/ai-chat-thread/\(threadId)/audio"
        case .getAllChat:
            return "/api/ai-chat-thread"
        case .deleteChat(let threadId):
            return "/api/ai-chat-thread/\(threadId)"
        }
    }

    override var headers: [String: String]? {
        switch endpoint {
        case .getAnswer, .getAllChat, .deleteChat:
            [
                "Authorization": "Bearer \(keychain.get(KeychainKeys.accessToken) ?? "")",
                "accept": "application/json",
                "Content-Type": "application/json"
            ]
        case .createAIChat(let model), .addNewMessage(_, let model):
            [
                "Authorization": "Bearer \(keychain.get(KeychainKeys.accessToken) ?? "")",
                "accept": "application/json",
                "Content-Type": "multipart/form-data; boundary=\(model.boundary)"
            ]
        }
    }
    
    override var method: HTTPMethod {
        switch endpoint {
        case .createAIChat, .addNewMessage:
            return .post
        case .getAnswer, .getAllChat:
            return .get
        case .deleteChat:
            return .delete
        }
    }
    
    override var body: Data? {
        switch endpoint {
        case .getAnswer, .getAllChat, .deleteChat:
            return nil
        case .createAIChat(let model), .addNewMessage(_, let model):
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
        case .createAIChat, .getAnswer, .addNewMessage, .getAllChat, .deleteChat:
            nil
        }
    }
}
