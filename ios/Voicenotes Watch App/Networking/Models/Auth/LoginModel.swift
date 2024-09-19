//
//  LoginModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import Foundation

struct LoginModel: Codable {
    let status: String
    let message: String
    let authorisation: Authorisation
}

struct Authorisation: Codable {
    let token: String
    let type: String
}
