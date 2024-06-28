//
//  NetworkService.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/3/24.
//

import Foundation
import Combine
import UIKit
import KeychainSwift
import NerdzInject

final class NetworkService {
    
    // MARK: - Constant
    private enum Constant {
        static let authorizationKey = "Authorization"
        static let bearerPrefix = "Bearer "
    }
    
    // MARK: - Properties(Private)

    private var mainSession: URLSession?
    private let refreshSemaphore = DispatchSemaphore(value: 1)
    private let keychain = KeychainSwift()
    
    private let logsLevel: LogsLevel = .debug
    
    @ForceInject private var authRepository: AuthRepository
    private var subscriptions = Set<AnyCancellable>()
    
    // MARK: - Methods(Publick)

    func performRequest<T: Decodable>(session: URLSession? = nil,
                                      route: BaseRouter,
                                      isAthorizedRequired: Bool = false) -> AnyPublisher<T, Error> {
        let accessToken = keychain.get(KeychainKeys.accessToken)
        let configuration = URLSessionConfiguration.default
        configuration.waitsForConnectivity = true
        configuration.timeoutIntervalForRequest = 600
        mainSession = URLSession(configuration: configuration, delegate: self as? URLSessionDelegate, delegateQueue: OperationQueue())
        mainSession?.configuration.waitsForConnectivity = true
        mainSession?.configuration.timeoutIntervalForRequest = 600
        
        
        return performRequest(session: (session ?? mainSession) ?? URLSession(configuration: .default), route: route, token: isAthorizedRequired ? accessToken : nil, noRefresh: isAthorizedRequired)
    }
    
    // MARK: - Methods(Private)

    private func performRequest<T: Decodable>(session: URLSession, route: BaseRouter, token: String? = nil, noRefresh: Bool = false) -> AnyPublisher<T, Error> {
        do {
            var request = try route.asURLRequest()
            
            if let token {
                request.setValue(Constant.bearerPrefix + token, forHTTPHeaderField: Constant.authorizationKey)
            }
            
            logRequest(request: request)
            return session.dataTaskPublisher(for: request)
                .subscribe(on: DispatchQueue.global(qos: .utility))
                .mapError { $0 as Error }
                .flatMap { [self] in
                    handleOutput($0, for: route, session: session)
                }
                .receive(on: RunLoop.main)
                .eraseToAnyPublisher()
        } catch {
            return Fail(error: APIError.default).eraseToAnyPublisher()
        }
    }
    
    private func handleOutput<T: Decodable>(_ output: URLSession.DataTaskPublisher.Output,
                                            for route: BaseRouter,
                                            session: URLSession,
                                            noRefresh: Bool = false) -> AnyPublisher<T, Error> {
    
        logOutput(output: output)
        switch (output.response as? HTTPURLResponse)?.statusCode {
        case .some(200):
            return Just(output.data.isEmpty ? EmptyResponse().data! : output.data)
                .decode(type: T.self, decoder: CodableService.defaultDecoder)
                .eraseToAnyPublisher()
        case .some(201):
            return Just(output.data.isEmpty ? EmptyResponse().data! : output.data)
                .decode(type: T.self, decoder: CodableService.defaultDecoder)
                .eraseToAnyPublisher()
        case .some(204):
            return Just(output.data.isEmpty ? EmptyResponse().data! : output.data)
                .decode(type: T.self, decoder: CodableService.defaultDecoder)
                .eraseToAnyPublisher()
        case .some(401):
            return authRepository.refreshToken()
                .mapError { error  in
                    return error
                }
                .flatMap({ [self] (refreshTokenModel: RefreshTokenModel) -> AnyPublisher<T, Error> in
                    keychain.set(refreshTokenModel.authorisation.token,
                                 forKey: KeychainKeys.accessToken)

                    let accessToken = refreshTokenModel.authorisation.token
                    
                    return performRequest(session: session, route: route, token: accessToken)
                })
                .eraseToAnyPublisher()
        default:
            return Just(output.data)
                .decode(type: ErrorResponse.self, decoder: CodableService.snakeDecoder)
                .flatMap { Fail(error: $0.apiError) }
                .eraseToAnyPublisher()
        }
    }
}

enum APIError: LocalizedError {

    case `default`
    case unathorized

    var errorDescription: String? {
        switch self {
        case .default:
            return "Error"
        case .unathorized:
            return "Unathorized"
        }
    }
}

struct ErrorResponse: Decodable {
    let code: Int
    let message: String

    var apiError: APIError {
        .default
    }
    
    var apiMessageError: APIError {
        .default
    }
}

// MARK: - NetworkLogger

extension NetworkService {
    private func logRequest(request: URLRequest) {
        guard logsLevel != .none else {
            return
        }
        
        var log = "\(request.httpMethod!) \(request.url!)\n"
        
        if logsLevel == .debug,
           !(request.allHTTPHeaderFields?.isEmpty ?? true) {
            log += "Headers: [\n"
            request.allHTTPHeaderFields?.forEach({ log += "\($0.key): \($0.value)\n" })
            log += "]\n"
        }
        
        if logsLevel == .debug && !(request.url?.absoluteString.contains("/upload/") ?? true),
           let body = request.httpBody {
            let json = body.prettyPrintedJSONString
            log += "Body:\n\(json ?? String(decoding: body, as: UTF8.self))\n"
        }
        
        Log.networkRequest(log)
    }
    
    private func logOutput(output: URLSession.DataTaskPublisher.Output) {
        guard logsLevel != .none,
              let response = output.response as? HTTPURLResponse else {
            return
        }
        
        var log = "\(response.statusCode) \(response.url!)\n"
        
        if logsLevel == .debug {
            let json = output.data.prettyPrintedJSONString
            log += "Response:\n\(json ?? String(decoding: output.data, as: UTF8.self))\n"
        }
        
        Log.networkResponce(log)
    }
}


fileprivate extension Log {
    static func networkRequest(_ message: String) {
        Log.aprint(message, emoji: "🚀")
    }
    
    static func networkResponce(_ message: String) {
        Log.aprint(message, emoji: "🏁")
    }
}

fileprivate extension Data {
    var prettyPrintedJSONString: String? {
        
        guard let object = try? JSONSerialization.jsonObject(with: self, options: []),
              let data = try? JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted]),
              let prettyPrintedString = String(data: data, encoding: .utf8) else { return nil }
        
        return prettyPrintedString
    }
}
