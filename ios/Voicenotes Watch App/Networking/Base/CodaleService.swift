//
//  CodaleService.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/3/24.
//

import Foundation

final class CodableService {

    private init() { }

    static let defaultDecoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(dateFormatter)
        return decoder
    }()

    static let snakeDecoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .formatted(dateFormatter)
        return decoder
    }()

    static let defaultEncoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .formatted(dateFormatter)
        return encoder
    }()

    static let snakeEncoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .formatted(dateFormatter)
        return encoder
    }()

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSSZ"

        return formatter
    }()

    static func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
        try defaultDecoder.decode(type, from: data)
    }

    static func snakeDecode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
        try snakeDecoder.decode(type, from: data)
    }

    static func encode<T: Encodable>(_ model: T) throws -> Data {
        try defaultEncoder.encode(model)
    }

    static func snakeEncode<T: Encodable>(_ model: T) throws -> Data {
        try snakeEncoder.encode(model)
    }
}
