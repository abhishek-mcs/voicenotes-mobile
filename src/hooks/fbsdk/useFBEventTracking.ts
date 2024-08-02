import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { Settings } from "react-native-fbsdk-next";

const useFBEventTracking = () => {
  
  const trackingPermission = async () => {
    const { status } = await requestTrackingPermissionsAsync();

    Settings.initializeSDK();
    Settings.setAppID('2337501396452912')

    if (status === "granted") {
      await Settings.setAdvertiserTrackingEnabled(true);
    }
  };

  useEffect(()=>{
    trackingPermission()
  },[])
};

export default useFBEventTracking;
