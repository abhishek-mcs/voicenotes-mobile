// ShareReceiverApp/ShareReceiverModule.swift
import Foundation
import React // Ensure React is imported

// IMPORTANT: Replace with your actual App Group ID (must match Share Extension)
private let AppGroupId = "group.app.voicenotes"
// IMPORTANT: Use the SAME UserDefaults key as in the Share Extension
private let SharedItemsUserDefaultsKey = "SharedItemsKey_v2"

// Define the SAME data structure as in the Share Extension
struct SharedItemInfo: Codable {
    let type: String // "file", "text", "url"
    var fileName: String?
    var path: String?
    var mimeType: String?
    var content: String?
    let id: String

    // Add initializers if needed for internal use, but Codable handles decoding
}

@objc(ShareReceiver)
class ShareReceiver: NSObject, RCTBridgeModule {

  // Required by RCTBridgeModule
  static func moduleName() -> String! {
    return "ShareReceiver" // Name used to access this module from React Native
  }

  // Optional: Specify true if module initialization requires the main thread.
  // Usually true if accessing UIKit or main-thread-only APIs during init.
  // Accessing UserDefaults should be safe from background threads, but main thread is safer.
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // Method exposed to React Native to check for and retrieve shared items
  @objc(checkForSharedItems:rejecter:)
  func checkForSharedItems(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    NSLog("[ShareReceiverModule] checkForSharedItems method ENTERED.")

    guard let sharedDefaults = UserDefaults(suiteName: AppGroupId) else {
        NSLog("[ShareReceiverModule] ERROR: Could not access shared UserDefaults for group.")
        reject("E_NO_USER_DEFAULTS", "Could not access shared UserDefaults.", nil)
        return
    }

    // --- ** ATOMIC READ AND REMOVE LOGIC ** ---
    // 1. Attempt to read the data
    guard let data = sharedDefaults.data(forKey: SharedItemsUserDefaultsKey) else {
        // No data found, resolve empty immediately
        NSLog("[ShareReceiverModule] No data found in UserDefaults for key. Resolving empty.")
        resolve([])
        return
    }

    // 2. Data WAS found. Immediately remove it from UserDefaults.
    NSLog("[ShareReceiverModule] Found data (\(data.count) bytes) for key. REMOVING KEY NOW...")
    sharedDefaults.removeObject(forKey: SharedItemsUserDefaultsKey)
    // Optional: Verify removal if needed sharedDefaults.synchronize() though often not necessary

    // 3. Now, process the 'data' variable we read *before* removing the key.
    NSLog("[ShareReceiverModule] Key removed. Attempting to decode the retrieved data...")
    do {
        let decoder = JSONDecoder()
        let items = try decoder.decode([SharedItemInfo].self, from: data) // Decode the data read earlier
        NSLog("[ShareReceiverModule] Successfully decoded \(items.count) items.")

        // Convert to an array of dictionaries for React Native
        let result = items.map { item -> [String: Any?] in
             var dict: [String: Any?] = [ "id": item.id, "type": item.type, "mimeType": item.mimeType ]
             if item.type == "file" {
                 dict["fileName"] = item.fileName
                 dict["path"] = (item.path != nil) ? "file://" + item.path! : nil
             } else { dict["content"] = item.content }
             return dict
        }

      NSLog("[ShareReceiverModule] Resolving promise with \(result.count) items.")
        resolve(result) // Resolve with the processed data

    } catch {
      NSLog("[ShareReceiverModule] ERROR decoding shared items (after removing key)")
        reject("E_SHARE_DECODE_ERROR", "Error decoding shared item data: \(error.localizedDescription)", error)
    }
     // --- ** END OF ATOMIC READ AND REMOVE LOGIC ** ---
  }

  // Method exposed to React Native to clear the *files* stored in the App Group container
  @objc(clearSharedFilesCache:rejecter:)
   func clearSharedFilesCache(
       _ resolve: @escaping RCTPromiseResolveBlock,
       rejecter reject: @escaping RCTPromiseRejectBlock
   ) -> Void {
       let fileManager = FileManager.default
       // Get URL for the App Group container
       guard let containerURL = fileManager.containerURL(forSecurityApplicationGroupIdentifier: AppGroupId) else {
           reject("E_NO_CONTAINER", "Could not get App Group container URL for group \(AppGroupId).", nil)
           return
       }
       // Get URL for the specific sub-directory where files were saved
       let sharedFolderUrl = containerURL.appendingPathComponent("SharedFiles")

       do {
           // Check if the directory exists
           if fileManager.fileExists(atPath: sharedFolderUrl.path) {
               NSLog("[ShareReceiverModule] Found shared files directory at: \(sharedFolderUrl.path)")
               // Get list of items inside the directory
               let fileUrls = try fileManager.contentsOfDirectory(at: sharedFolderUrl, includingPropertiesForKeys: nil, options: [])
               var deletedCount = 0
               // Iterate and remove each item (file or subdirectory)
               for fileUrl in fileUrls {
                   try fileManager.removeItem(at: fileUrl)
                   deletedCount += 1
               }
               NSLog("[ShareReceiverModule] Cleared \(deletedCount) items from shared files cache directory.")
           } else {
                NSLog("[ShareReceiverModule] Shared files cache directory does not exist, nothing to clear.")
           }
           // Resolve the promise indicating success (even if directory didn't exist)
           resolve(true)
       } catch {
           // An error occurred during directory listing or file removal
           NSLog("[ShareReceiverModule] Error clearing shared files cache: \(error)")
           reject("E_CLEAR_CACHE_ERROR", "Failed to clear shared files cache: \(error.localizedDescription)", error)
       }
   }

   // Optional: If using event emitters later, you would implement methods here
   // func supportedEvents() -> [String]! { return ["onShareReceived"] } // Example
   // func startObserving() {} // Called when first listener is added
   // func stopObserving() {} // Called when last listener is removed
}
