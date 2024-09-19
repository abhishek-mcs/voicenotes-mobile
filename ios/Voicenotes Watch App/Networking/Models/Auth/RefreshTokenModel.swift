//
//  RefreshTokenModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/7/24.
//

import Foundation

struct RefreshTokenModel: Codable {
    let status: String
    let authorisation: Authorisation
}
