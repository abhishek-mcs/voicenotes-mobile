//
//  WatchConnector.swift
//  Voicenotes-Watch-App
//
//  Created by Andriy Hrytsyshyn on 6/4/24.
//

import Foundation
import WatchConnectivity
import KeychainSwift

class WatchConnector: NSObject, WCSessionDelegate, ObservableObject {
    
    @Published var noInternet = false
  
    var session: WCSession
    private let keychain = KeychainSwift()

    init(session: WCSession = .default) {
        self.session = session
        super.init()
        self.session.delegate = self
        self.session.activate()
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
    }
   
    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        print(message)

        if let internetType = message["internetType"] as? String {
            self.noInternet = internetType == "none"
        }
      
        if let token = message["tokenFromApp"] as? String {
            DispatchQueue.main.async {
                print("Token: \(token)")
                self.keychain.set(token, forKey: KeychainKeys.accessToken)
                NotificationCenter.default.post(name: NSNotification.Name(rawValue: "update_token"), object: nil)
            }
        }
    }
}
