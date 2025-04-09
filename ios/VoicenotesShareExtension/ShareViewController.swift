import UIKit
// Removed import Social as SLComposeServiceViewController is no longer used
import MobileCoreServices
import UniformTypeIdentifiers
import Foundation

// IMPORTANT: Replace with your actual App Group ID
private let AppGroupId = "group.app.voicenotes"
// Use a distinct key for the data structure
private let SharedItemsUserDefaultsKey = "SharedItemsKey_v2" // Keep the same key

// Data structure for shared items (must match the one in ShareReceiverModule.swift)
// (Keep the SharedItemInfo struct definition as provided in the previous step)
struct SharedItemInfo: Codable {
    let type: String // "file", "text", "url"
    // File properties (Optional)
    var fileName: String?
    var path: String? // Path *within* the shared container
    var mimeType: String?
    // Text/URL properties (Optional)
    var content: String?
    // Unique ID for React Native key stability
    let id: String // e.g., UUID().uuidString

     // Initializer for File
     init(type: String = "file", fileName: String, path: String, mimeType: String) {
         self.type = type
         self.fileName = fileName
         self.path = path
         self.mimeType = mimeType
         self.content = nil
         self.id = UUID().uuidString
     }

     // Initializer for Text/URL
     init(type: String, content: String) {
         self.type = type
         self.content = content
         self.fileName = nil
         self.path = nil
         self.mimeType = (type == "url") ? "text/url" : "text/plain" // Assign basic mime type
         self.id = UUID().uuidString
     }
}


// --- Inherit from UIViewController instead ---
class ShareViewController: UIViewController {

    // This method is called when the extension's view is loaded into memory.
    override func viewDidLoad() {
        super.viewDidLoad()

      // Make the view background clear or dim effect if desired,
        // otherwise it might show a brief white screen.
        self.view.backgroundColor = .clear // Or UIColor.black.withAlphaComponent(0.6)

        // Start processing shared items immediately when the extension loads.
        processSharedItems()
    }

    // Renamed from saveSharedItems to better reflect its role here
    private func processSharedItems() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            cancelRequest(withError: "No input items found.")
            return
        }

        let fileManager = FileManager.default
        guard let containerURL = fileManager.containerURL(forSecurityApplicationGroupIdentifier: AppGroupId) else {
             NSLog("[ShareExtension] Error: Could not get App Group container URL for ID: \(AppGroupId)")
             cancelRequest(withError: "Cannot access shared container.")
             return
        }
        let sharedFolderUrl = containerURL.appendingPathComponent("SharedFiles")

         // Ensure the shared directory exists
         do {
             try fileManager.createDirectory(at: sharedFolderUrl, withIntermediateDirectories: true, attributes: nil)
         } catch {
             NSLog("[ShareExtension] Error: Could not create shared directory: \(error)")
             cancelRequest(withError: "Cannot create shared directory.")
             return
         }

        var processedItems: [SharedItemInfo] = []
        let dispatchGroup = DispatchGroup()

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }

            for provider in attachments {
                 dispatchGroup.enter()

                 // --- Item Type Handling Logic (Identical to previous version) ---
              // 1. Prioritize specific file types & generic file representations
              if provider.hasItemConformingToTypeIdentifier(UTType.audio.identifier) ||
                 provider.hasItemConformingToTypeIdentifier(UTType.movie.identifier) ||
                 provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) ||
                 provider.hasItemConformingToTypeIdentifier(UTType.pdf.identifier) ||
                 // Add other specific file UTIs if needed (e.g., UTType.zip)
                 provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) || // Generic file URL
                 provider.hasItemConformingToTypeIdentifier(UTType.data.identifier)       // Generic file data
              {
                  NSLog("Attachment conforms to a FILE type. Calling saveAttachmentAsFile.") // Use logger
                  saveAttachmentAsFile(provider: provider, sharedFolderUrl: sharedFolderUrl) { itemInfo in
                      if let info = itemInfo { processedItems.append(info) }
                      dispatchGroup.leave()
                  }
              }
              // 2. Check for URL *after* files
              else if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                NSLog("Attachment conforms to URL type. Calling loadUrlItem.") // Use logger
                  loadUrlItem(provider: provider) { itemInfo in
                      if let info = itemInfo { processedItems.append(info) }
                      dispatchGroup.leave()
                  }
              }
              // 3. Check for Plain Text *last* among common types
              else if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                NSLog("Attachment conforms to Plain Text type. Calling loadTextItem.") // Use logger
                   loadTextItem(provider: provider) { itemInfo in
                      if let info = itemInfo { processedItems.append(info) }
                      dispatchGroup.leave()
                  }
              }
              // 4. Handle unsupported types
              else {
                NSLog("Attachment has unsupported item types: \(provider.registeredTypeIdentifiers)") // Use logger
                  dispatchGroup.leave() // Leave group if unsupported
              }
                 // --- End of Item Type Handling ---
            }
        }

        // This block executes only after all async operations (dispatchGroup.leave()) are done
        dispatchGroup.notify(queue: .main) {
             // Save the processed items from this session (overwriting previous)
             self.saveCurrentItemsToUserDefaults(currentItems: processedItems)
             // Complete the request and dismiss the extension
             self.openMainAppAndComplete()
        }
    }

    // Helper to load URL items
     private func loadUrlItem(provider: NSItemProvider, completion: @escaping (SharedItemInfo?) -> Void) {
        provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (item, error) in
             DispatchQueue.main.async {
                  guard let url = item as? URL, error == nil else {
                      NSLog("[ShareExtension] Error loading URL: \(error?.localizedDescription ?? "Unknown")")
                      completion(nil)
                      return
                  }
                  NSLog("[ShareExtension] Loaded URL: \(url.absoluteString)")
                  completion(SharedItemInfo(type: "url", content: url.absoluteString))
             }
        }
    }

    // Helper to load Text items
    private func loadTextItem(provider: NSItemProvider, completion: @escaping (SharedItemInfo?) -> Void) {
        provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { (item, error) in
             DispatchQueue.main.async {
                  var textContent: String? = nil
                  if let text = item as? String {
                      textContent = text
                  } else if let attributedText = item as? NSAttributedString {
                      textContent = attributedText.string
                  }

                 guard let finalContent = textContent, error == nil else {
                     NSLog("[ShareExtension] Error loading Text: \(error?.localizedDescription ?? "Unknown")")
                     completion(nil)
                     return
                 }
                 NSLog("[ShareExtension] Loaded Text: \(finalContent.prefix(100))...")
                 completion(SharedItemInfo(type: "text", content: finalContent))
             }
        }
    }

    // Helper to save attachments as files
    private func saveAttachmentAsFile(provider: NSItemProvider, sharedFolderUrl: URL, completion: @escaping (SharedItemInfo?) -> Void) {
         let fileManager = FileManager.default
         if provider.hasItemConformingToTypeIdentifier(kUTTypeFileURL as String) {
               provider.loadItem(forTypeIdentifier: kUTTypeFileURL as String, options: nil) { (itemUrl, error) in
                  DispatchQueue.main.async {
                      guard let url = itemUrl as? URL, error == nil else {
                          NSLog("[ShareExtension] Error loading file URL: \(error?.localizedDescription ?? "Unknown error")")
                          completion(nil)
                          return
                      }
                      let fileName = self.sanitizeFileName(url.lastPathComponent)
                      let destinationUrl = sharedFolderUrl.appendingPathComponent(fileName)
                      do {
                          if fileManager.fileExists(atPath: destinationUrl.path) { try fileManager.removeItem(at: destinationUrl) }
                          try fileManager.copyItem(at: url, to: destinationUrl)
                          let mimeType = self.mimeTypeForPath(path: destinationUrl)
                          NSLog("[ShareExtension] Copied file URL: \(fileName)")
                          completion(SharedItemInfo(fileName: fileName, path: destinationUrl.path, mimeType: mimeType))
                      } catch { NSLog("[ShareExtension] Error copying file URL \(fileName): \(error)"); completion(nil) }
                  }
               }
         } else {
             var preferredType = UTType.data.identifier
              if #available(iOS 14.0, *) {
                  let availableTypes = provider.registeredTypeIdentifiers.compactMap { UTType($0) }
                  if let type = availableTypes.first(where: { $0.conforms(to: .image) }) { preferredType = type.identifier }
                  else if let type = availableTypes.first(where: { $0.conforms(to: .audio) }) { preferredType = type.identifier }
                  else if let type = availableTypes.first(where: { $0.conforms(to: .movie) }) { preferredType = type.identifier }
                  else if let type = availableTypes.first(where: { $0.conforms(to: .pdf) }) { preferredType = type.identifier }
                  else if let firstType = provider.registeredTypeIdentifiers.first { preferredType = firstType }
              } else { if let firstType = provider.registeredTypeIdentifiers.first { preferredType = firstType } }

              NSLog("[ShareExtension] Loading data representation for type: \(preferredType)")
              provider.loadDataRepresentation(forTypeIdentifier: preferredType) { (data, error) in
                   DispatchQueue.main.async {
                       guard let fileData = data, error == nil else {
                           NSLog("[ShareExtension] Error loading data representation: \(error?.localizedDescription ?? "Unknown error")")
                           completion(nil)
                           return
                       }
                       var fileName = "shared_item_\(UUID().uuidString)"
                        if #available(iOS 15.0, *) { fileName = provider.suggestedName ?? fileName }
                        else if let nsItem = provider as? NSItemProvider, let suggestedName = nsItem.suggestedName { fileName = suggestedName }

                       var finalFileName = self.sanitizeFileName(fileName)
                        if let uti = UTType(preferredType), let ext = uti.preferredFilenameExtension {
                            let currentExt = (finalFileName as NSString).pathExtension
                            if currentExt.isEmpty || !finalFileName.lowercased().hasSuffix(".\(ext.lowercased())") {
                                finalFileName = "\((finalFileName as NSString).deletingPathExtension).\(ext)"
                            }
                        } else if let mime = UTType(preferredType)?.preferredMIMEType, let ext = self.fileExtensionForMimeType(mimeType: mime) {
                              let currentExt = (finalFileName as NSString).pathExtension
                               if currentExt.isEmpty || !finalFileName.lowercased().hasSuffix(".\(ext.lowercased())") {
                                  finalFileName = "\((finalFileName as NSString).deletingPathExtension).\(ext)"
                               }
                        }

                       let destinationUrl = sharedFolderUrl.appendingPathComponent(finalFileName)
                       do {
                           if fileManager.fileExists(atPath: destinationUrl.path) { try fileManager.removeItem(at: destinationUrl) }
                           try fileData.write(to: destinationUrl)
                           let mimeType = self.mimeTypeForPath(path: destinationUrl)
                           NSLog("[ShareExtension] Saved data: \(finalFileName)")
                           completion(SharedItemInfo(fileName: finalFileName, path: destinationUrl.path, mimeType: mimeType))
                       } catch { NSLog("[ShareExtension] Error writing data \(finalFileName): \(error)"); completion(nil) }
                  }
              }
         }
     }

     // Helper to save current items (overwrites previous)
    private func saveCurrentItemsToUserDefaults(currentItems: [SharedItemInfo]) {
        guard let sharedDefaults = UserDefaults(suiteName: AppGroupId) else {
             NSLog("[ShareExtension] Error: Could not access shared UserDefaults.")
             return
        }
        do {
            let encoder = JSONEncoder()
            let dataToSave = try encoder.encode(currentItems)
            sharedDefaults.set(dataToSave, forKey: SharedItemsUserDefaultsKey) // Overwrite
            if currentItems.isEmpty { NSLog("[ShareExtension] Cleared UserDefaults (empty share).") }
            else { NSLog("[ShareExtension] Saved \(currentItems.count) items to UserDefaults.") }
        } catch { NSLog("[ShareExtension] Error encoding/saving item info: \(error)") }
    }

     // Helper to get MIME type
      private func mimeTypeForPath(path: URL) -> String {
          if #available(iOS 14.0, *) {
              if let type = UTType(filenameExtension: path.pathExtension) { return type.preferredMIMEType ?? "application/octet-stream" }
          }
          let pathExtension = path.pathExtension as CFString
          guard let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension, nil)?.takeRetainedValue() else { return "application/octet-stream" }
          guard let mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() as String? else { return "application/octet-stream" }
          return mimeType
      }

     // Helper to get extension from MIME
      private func fileExtensionForMimeType(mimeType: String) -> String? {
          if #available(iOS 14.0, *) { return UTType(mimeType: mimeType)?.preferredFilenameExtension }
          else {
              guard let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassMIMEType, mimeType as CFString, nil)?.takeRetainedValue() else { return nil }
              guard let ext = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassFilenameExtension)?.takeRetainedValue() as String? else { return nil }
              return ext
          }
      }

     // Helper to sanitize filenames
     private func sanitizeFileName(_ fileName: String) -> String {
         let invalidChars = CharacterSet(charactersIn: "\\/:*?\"<>|").union(.controlCharacters)
         let sanitized = fileName.components(separatedBy: invalidChars).joined(separator: "_")
         let trimmed = sanitized.trimmingCharacters(in: .whitespacesAndNewlines.union(CharacterSet(charactersIn: ".")))
         let maxLength = 200
         let finalName = String(trimmed.prefix(maxLength))
         return finalName.isEmpty || finalName.allSatisfy({ $0 == "." }) ? "shared_file_\(UUID().uuidString.prefix(6))" : finalName // Ensure non-empty
     }

  // Helper function to open URL using responder chain
  @objc @discardableResult private func openURL(_ url: URL) -> Bool {
    var responder: UIResponder? = self
    while responder != nil {
      if let application = responder as? UIApplication {
        if #available(iOS 18.0, *) {
          application.open(url, options: [:], completionHandler: nil)
          return true
        } else {
          return application.perform(#selector(UIApplication.open(_:options:completionHandler:)), with: url, with: [:]) != nil
        }
      }
      responder = responder?.next
    }
    return false
  }

  // Opens Main App via URL Scheme ---
  private func openMainAppAndComplete() {
      // Replace "sharereceiverapp" with the actual URL scheme you registered!
      let urlScheme = "voicenotes://"
      guard let url = URL(string: urlScheme) else {
          NSLog("[ShareExtension] Error: Invalid custom URL scheme string: \(urlScheme)")
          completeRequest() // Complete anyway
          return
      }

      NSLog("[ShareExtension] Attempting to open main app with URL: \(url.absoluteString)")
      openURL(url)

      // Add a small delay before completing the request
      // This gives the system time to handle the app transition properly
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          self.completeRequest()
      }
  }

  // Call this to dismiss the extension immediately after processing
    private func completeRequest() {
        NSLog("[ShareExtension] Processing complete. Closing extension.")
        // Inform the host application that the request is done and dismiss the view
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    // Call this if an unrecoverable error occurs early on
    private func cancelRequest(withError errorString: String) {
        NSLog("[ShareExtension] Cancelling request with error: \(errorString)")
        let error = NSError(domain: "ShareExtensionError", code: 0, userInfo: [NSLocalizedDescriptionKey: errorString])
        self.extensionContext?.cancelRequest(withError: error)
    }
}
