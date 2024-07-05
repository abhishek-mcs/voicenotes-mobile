//
//  AppGroupModule.m
//  Voicenotes
//
//  Created by Andriy Hrytsyshyn on 7/5/24.
//

// AppGroupModule.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppGroupModule, NSObject)

RCT_EXTERN_METHOD(setValueInAppGroup:(NSString *)key value:(NSString *)value)

@end
