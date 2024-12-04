//
//  StoreAudioModel.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/7/24.
//

import SwiftUI

struct StoreAudioModel {
    let boundary = "Boundary-\(UUID().uuidString)"
    let parameters: [String: String]
    let audioData: Data
    
    var multipartBody: Data {
        let body = NSMutableData()
        let lineBreak = "\r\n"

        for(key, value) in parameters {
            body.append(string: "--\(boundary + lineBreak)")
            body.append(string: "Content-Disposition:form-data; name=\"\(key)\"\(lineBreak + lineBreak)")
            body.append(string: "\(value + lineBreak)")
        }
        
            body.append(string: "--\(boundary + lineBreak)")
            body.append(string: "Content-Disposition: form-data; name=\"audio\"; filename=\"\(UUID().uuidString+".jpg")\"\(lineBreak)")
            body.append(string: "Content-Type: image/jpeg\(lineBreak + lineBreak)")
            body.append(audioData)
            body.append(string: lineBreak)
        body.append(string: "--\(boundary)--\(lineBreak)")

        print(body)
    
        return body as Data
    }

    init(parameters: [String: String], audioData: Data) {
        self.parameters = parameters
        self.audioData = audioData
    }
}

extension NSMutableData {
    func append(string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
