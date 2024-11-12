//
//  AppGroupModule.swift
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 7/5/24.
//

// AppGroupModule.swift
import Foundation

@objc(AppGroupModule)
class AppGroupModule: NSObject {
  
  @objc func setValueInAppGroup(_ key: String, value: String) {
    let sharedUserDefaults = UserDefaults(suiteName: "group.watchOS.storage")
    sharedUserDefaults?.set(value, forKey: key)
    print("successfully save to user defaulr")
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
