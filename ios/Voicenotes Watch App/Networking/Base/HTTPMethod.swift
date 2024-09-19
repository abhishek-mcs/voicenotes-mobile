//
//  HTTPMethod.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import Foundation

public struct HTTPMethod: RawRepresentable, Equatable, Hashable {
    
    public static let delete = HTTPMethod(rawValue: "DELETE")
    public static let get = HTTPMethod(rawValue: "GET")
    public static let patch = HTTPMethod(rawValue: "PATCH")
    public static let post = HTTPMethod(rawValue: "POST")
    public static let put = HTTPMethod(rawValue: "PUT")

    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }
}
