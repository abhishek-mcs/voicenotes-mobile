//
//  EmptyResponse.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/3/24.
//

import Foundation

struct EmptyResponse: Codable { }

extension Encodable {
    var data: Data? {
        try? CodableService.defaultEncoder.encode(self)
    }
}
