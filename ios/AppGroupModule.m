//
//  AppGroupModule.m
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 7/5/24.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AppGroupModule, NSObject)

RCT_EXTERN_METHOD(setValueInAppGroup:(NSString *)key value:(NSString *)value)

@end

@interface RCT_EXTERN_MODULE(ActionModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startRecord)
RCT_EXTERN_METHOD(askAI)
RCT_EXTERN_METHOD(searchNote)
RCT_EXTERN_METHOD(sendToken)

@end
