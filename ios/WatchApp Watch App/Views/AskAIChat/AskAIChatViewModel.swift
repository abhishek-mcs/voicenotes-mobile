//
//  AskAIChatViewModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/26/24.
//

import SwiftUI
import SDWebImageLottieCoder

final class AskAIChatViewModel: ObservableObject {
  
  @Published var loadAnimation = Image("")

  
  
  // MARK: - Animation
  private var coder: SDImageLottieCoder?
  private var loadingFrame: UInt = 0
  private var loadAnimationTimer: Timer?
  private var speed: Double = 1.0
  
  init() {
  
    setupLoadAnimation()
  }
  
  
  // MARK: - Animation Methods
  
  private func setupLoadAnimation() {
    guard let jsonData = loadJSONData(filename: "loadAnimationGray") else { return }
    loadingFrame = 0
    guard let coder = SDImageLottieCoder(animatedImageData: jsonData, options: [SDImageCoderOption.decodeLottieResourcePath: Bundle.main.resourcePath!]),
          let uiImage = coder.animatedImageFrame(at: loadingFrame) else { return }
    self.loadAnimation = Image(uiImage: uiImage)
    
    loadAnimationTimer?.invalidate()
    loadAnimationTimer = Timer.scheduledTimer(withTimeInterval: 0.05/speed, repeats: true, block: { (timer) in
      self.loadingFrame += 1
      if self.loadingFrame >= coder.animatedImageFrameCount {
        self.loadingFrame = 0
      }
      guard let uiImage = coder.animatedImageFrame(at: self.loadingFrame) else { return }
      self.loadAnimation = Image(uiImage: uiImage)
    })
  }
  
  private func loadJSONData(filename: String) -> Data? {
    if let url = Bundle.main.url(forResource: filename, withExtension: "json") {
      do {
        let data = try Data(contentsOf: url)
        return data
      } catch {
        print("Error reading JSON file:", error.localizedDescription)
      }
    }
    return nil
  }
}
