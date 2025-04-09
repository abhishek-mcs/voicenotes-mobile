// ShareReceiverApp/ShareReceiverBridge.m
#import <React/RCTBridgeModule.h>

// Expose the Swift module (ShareReceiver) to React Native.
// The first argument is the Swift class name, the second is its superclass (usually NSObject for modules).
@interface RCT_EXTERN_MODULE(ShareReceiver, NSObject)

// Expose the checkForSharedItems method to React Native.
// Match the Swift function signature including argument labels (`:` becomes part of the name).
// Use RCTPromiseResolveBlock and RCTPromiseRejectBlock for methods returning promises.
RCT_EXTERN_METHOD(checkForSharedItems: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

// Expose the clearSharedFilesCache method.
RCT_EXTERN_METHOD(clearSharedFilesCache: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

@end
