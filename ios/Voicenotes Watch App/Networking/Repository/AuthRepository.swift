//
//  AuthRepository.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import Combine

final class AuthRepository {
    
    // MARK: - Properties(private)

    private let networkService: NetworkService

    // MARK: - Init

    init(networkService: NetworkService) {
        self.networkService = networkService
    }
    
    // MARK: - Public methods

    func login(email: String, password: String) -> AnyPublisher<LoginModel, Error> {
        networkService.performRequest(route: AuthRequest(endpoint: .login(email: email, password: password)))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<LoginModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func refreshToken() -> AnyPublisher<RefreshTokenModel, Error> {
        networkService.performRequest(route: AuthRequest(endpoint: .refreshToken))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<RefreshTokenModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    func getUserData() -> AnyPublisher<UserDataModel, Error> {
        networkService.performRequest(route: AuthRequest(endpoint: .getUserData))
            .map { value in
                return value
            }
            .catch { error -> AnyPublisher<UserDataModel, Error> in
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
}
