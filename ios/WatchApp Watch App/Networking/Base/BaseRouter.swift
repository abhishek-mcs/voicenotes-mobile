//
//  BaseRouter.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/3/24.
//

import Foundation


struct Server {
    static let stageBaseURL = ""
    static let appStoreBaseURL = "https://itunes.apple.com"
}

class BaseRouter {
    
    var baseUrl: String {
        return "https://stagingapi.voicenotes.com"
    }

    var method: HTTPMethod {
        fatalError("You have to override method property")
    }

    var path: String {
        return ""
    }

    var headers: [String: String]? {
        ["Content-Type": "application/json"]
    }

    var queryItems: [URLQueryItem]? {
        return nil
    }

    var body: Data? {
        return nil
    }

    func asURLRequest() throws -> URLRequest {
        var components = URLComponents(string: baseUrl)!

        components.path = path
        components.queryItems = queryItems

        var request = URLRequest(url: components.url!)

        request.httpMethod = method.rawValue
        request.httpBody = body
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        headers?.forEach {
            request.setValue($0.value, forHTTPHeaderField: $0.key)
        }

        return request
    }
}
