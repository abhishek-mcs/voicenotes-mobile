//
//  AppGroupModule.swift
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 7/5/24.
//

// AppGroupModule.swift
import Foundation
import React

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

@objc(ActionModule)
class ActionModule: RCTEventEmitter {

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func supportedEvents() -> [String]! {
    return ["onStartRecord", "askAI", "searchNote"]
  }

  @objc func startRecord() {
    sendEvent(withName: "onStartRecord", body: nil)
  }

  @objc func askAI() {
    sendEvent(withName: "askAI", body: nil)
  }

  @objc func searchNote() {
    sendEvent(withName: "searchNote", body: nil)
  }
}
