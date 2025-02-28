//
//  UserDataModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/11/24.
//

import Foundation

struct UserDataModel: Codable {
    let id: Int
    let name: String
    let email: String
    let photoUrl: String?
    let isPasswordSet: Bool
    let subscriptionStatus: Bool
    let canRecordMore: Bool
    let recordingsCount: Int
    let publicRecordingsCount: Int
  
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case photoUrl = "photo_url"
        case isPasswordSet = "is_password_set"
        case subscriptionStatus = "subscription_status"
        case canRecordMore = "can_record_more"
        case recordingsCount = "non_creation_recordings_count"
        case publicRecordingsCount = "public_recordings_count"
    }
}
