//
//  StoreAudioResponseModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/7/24.
//

import Foundation

struct StoreAudioResponseModel: Codable {
    let message: String
    let recording: RecordModel
}
