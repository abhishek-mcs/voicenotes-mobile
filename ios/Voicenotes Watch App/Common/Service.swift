//
//  Service.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 7/1/24.
//

import SwiftUI
import Foundation
import Combine
import AVFoundation

protocol ServiceProtocol {
    func buffer(url: URL, samplesCount: Int, completion: @escaping([AudioPreviewModel]) -> ())
}

class Service {
    static let shared: ServiceProtocol = Service()
    private init() {}
}

extension Service: ServiceProtocol {
    func buffer(url: URL, samplesCount: Int, completion: @escaping([AudioPreviewModel]) -> ()) {
        let session = URLSession.shared
        let task = session.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion([])
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    completion([])
                }
                return
            }
            
            do {
                let audioBuffer = try self.decodeAudioData(data: data)
                let result = self.processAudioBuffer(buffer: audioBuffer, samplesCount: samplesCount)
                
                DispatchQueue.main.async {
                    completion(result)
                }
            } catch {
                print("Audio Error: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion([])
                }
            }
        }
        
        task.resume()
    }
    
    private func decodeAudioData(data: Data) throws -> AVAudioPCMBuffer {
        let audioFile = try AVAudioFile(forReading: data.audioFileURL)
        guard let format = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                         sampleRate: audioFile.fileFormat.sampleRate,
                                         channels: audioFile.fileFormat.channelCount,
                                         interleaved: false) else {
            throw NSError(domain: "AudioProcessing", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unable to create audio format"])
        }
        
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(audioFile.length)) else {
            throw NSError(domain: "AudioProcessing", code: 2, userInfo: [NSLocalizedDescriptionKey: "Unable to create audio buffer"])
        }
        
        try audioFile.read(into: buffer)
        return buffer
    }
    
    private func processAudioBuffer(buffer: AVAudioPCMBuffer, samplesCount: Int) -> [AudioPreviewModel] {
        guard let floatChannelData = buffer.floatChannelData else {
            return []
        }
        
        let frameLength = Int(buffer.frameLength)
        let samples = Array(UnsafeBufferPointer(start: floatChannelData[0], count: frameLength))
        var result = [AudioPreviewModel]()
        
        let chunked = samples.chunked(into: max(1, samples.count / samplesCount))
        for row in chunked {
            let accumulator = row.map { $0 * $0 }.reduce(0, +)
            let power: Float = accumulator / Float(row.count)
            let decibels = 10 * log10f(max(power, 1e-6))
            
            result.append(AudioPreviewModel(magnitude: decibels, color: Color("808080")))
        }
        
        return result
    }
}

extension Data {
    var audioFileURL: URL {
        let tmpFile = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try? self.write(to: tmpFile)
        return tmpFile
    }
}
