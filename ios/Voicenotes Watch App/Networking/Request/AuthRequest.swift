//
//  AuthRequest.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation
import KeychainSwift

enum AuthRequestEndpoint {
    case login(email: String, password: String)
    case refreshToken
    case getUserData
}

final class AuthRequest: BaseRouter {

    private let endpoint: AuthRequestEndpoint
    private let keychain = KeychainSwift()

    init(endpoint: AuthRequestEndpoint) {
        self.endpoint = endpoint
    }
    
    override var path: String {
        switch endpoint {
        case .login:
            return "/api/auth/login"
        case .refreshToken:
            return "/api/auth/refresh"
        case .getUserData:
            return "/api/auth/me"
        }
    }

    override var headers: [String: String]? {
        switch endpoint {
        case .login:
            nil
        case .refreshToken, .getUserData:
            [
                "Authorization": "Bearer \(keychain.get(KeychainKeys.accessToken) ?? "")",
                "accept": "application/json",
                "Content-Type": "application/json"
            ]
        }
    }
    
    override var method: HTTPMethod {
        switch endpoint {
        case .login, .refreshToken:
            return .post
        case .getUserData:
            return .get
        }
    }
    
    override var body: Data? {
        switch endpoint {
        case .refreshToken, .getUserData:
            return nil
        case .login(let email, let password):
            return ["email": email, "password": password].data
        }
    }
    
    func queryString(_ value: String, params: [String: String]) -> String? {
        var components = URLComponents(string: value)
        components?.queryItems = params.map { element in URLQueryItem(name: element.key, value: element.value) }
        return components?.url?.absoluteString
    }

    override var queryItems: [URLQueryItem]? {
        switch endpoint {
        case .login, .refreshToken, .getUserData:
            nil
        }
    }
}
