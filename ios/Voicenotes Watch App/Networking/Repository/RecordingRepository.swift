//
//  RecordingRepository.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import Combine

final class RecordingRepository {
    
    // MARK: - Properties(private)

    private let networkService: NetworkService

    // MARK: - Init

    init(networkService: NetworkService) {
        self.networkService = networkService
    }
        
    // MARK: - Public methods

    func getAudio(recordingId: String) -> AnyPublisher<AudioUrlModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .getAudio(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<AudioUrlModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func storeAudio(model: StoreAudioModel) -> AnyPublisher<StoreAudioResponseModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .storeAudio(model: model)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<StoreAudioResponseModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func addTranscript(recordingId: String) -> AnyPublisher<StoreAudioResponseModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .addTranscript(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<StoreAudioResponseModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func addTitle(recordingId: String) -> AnyPublisher<StoreAudioResponseModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .addTitle(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<StoreAudioResponseModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
  func getAllRecordings(page: Int) -> AnyPublisher<RecordingsModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .getAllRecordings(page: page)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<RecordingsModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func getRecordingSuggestion() -> AnyPublisher<RecordingSuggestionModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .getRecordingSuggestion))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<RecordingSuggestionModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func getIndividualRecording(recordingId: String) -> AnyPublisher<RecordModel, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .getIndividualRecording(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<RecordModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func deleteRecording(recordingId: String) -> AnyPublisher<EmptyResponse, Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .deleteRecording(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<EmptyResponse, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func getRelatedRecordings(recordingId: String) -> AnyPublisher<[RelatedRecordingModel], Error> {
        networkService.performRequest(route: RecordingRequest(endpoint: .getRelatedRecordings(recordingId: recordingId)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<[RelatedRecordingModel], Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
}
