//
//  AIChatRepository.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import Combine

final class AIChatRepository {
    
    // MARK: - Properties(private)

    private let networkService: NetworkService

    // MARK: - Init

    init(networkService: NetworkService) {
        self.networkService = networkService
    }
    
    // MARK: - Public methods
  
    func createAIChat(audio: StoreAudioModel) -> AnyPublisher<MessageModel, Error> {
      networkService.performRequest(route: AIChatRequest(endpoint: .createAIChat(audio: audio)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<MessageModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
  func getAnswer(messageId: String) -> AnyPublisher<MessageModel, Error> {
        networkService.performRequest(route: AIChatRequest(endpoint: .getAnswer(messageId: messageId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<MessageModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func addNewMessage(threadId: String, audio: StoreAudioModel) -> AnyPublisher<MessageModel, Error> {
        networkService.performRequest(route: AIChatRequest(endpoint: .addNewMessage(threadId: threadId, audio: audio)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<MessageModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func getAllChat() -> AnyPublisher<[MessageModel], Error> {
        networkService.performRequest(route: AIChatRequest(endpoint: .getAllChat))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<[MessageModel], Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
  func deleteChat(threadId: String) -> AnyPublisher<EmptyResponse, Error> {
        networkService.performRequest(route: AIChatRequest(endpoint: .deleteChat(threadId: threadId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<EmptyResponse, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
}
