//
//  AudioUrlModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/12/24.
//

import Foundation

struct AudioUrlModel: Codable {
    let url: String
    let expiryTime: String
  
    enum CodingKeys: String, CodingKey {
        case url
        case expiryTime = "expiry_time"
    }
}
