import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useEffect, useRef, useState } from "react";
import { Animated, InteractionManager } from "react-native";
import appsFlyer from "react-native-appsflyer";
import { Settings } from "react-native-fbsdk-next";
import { isIOS } from "utils/common";

const useFBEventTracking = () => {
  
  const trackingPermission = async () => {
    const { status } = await requestTrackingPermissionsAsync();

    Settings.initializeSDK();
    Settings.setAppID('2337501396452912')

    if (status === "granted") {
      await Settings?.setAdvertiserTrackingEnabled(true);
      appsFlyer?.initSdk(
        {
          devKey: '6w7BzziHtFcH3bdy4Gy5dm',
          isDebug: false,
          appId: isIOS?'id6483293628':'com.app.voicenotes',
          onInstallConversionDataListener: true, //Optional
          onDeepLinkListener: true, //Optional
          timeToWaitForATTUserAuthorization: 10 //for iOS 14.5
        },
        (result) => {
          appsFlyer?.startSdk();
        },
        (error) => {
        }
      );
    }
  };

  useEffect(()=>{
    InteractionManager.runAfterInteractions(()=>{
      trackingPermission()
    })
  },[])
};

export default useFBEventTracking;
