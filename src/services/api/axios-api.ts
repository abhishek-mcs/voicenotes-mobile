import axios from "axios"
import { API_URL } from "./api-constants"
import * as Device from "expo-device"
import * as Application from "expo-application"
import { getReachability, getIsPaired, getIsWatchAppInstalled, sendMessage, watchEvents } from 'react-native-watch-connectivity';
import { isIOS } from "utils/common";
import { NativeModules } from "react-native";

const axiosApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "User-Agent": `Voicenotes-${Device.osName}-${Application.nativeApplicationVersion}`,
  },
})

function checkWatchStatus(token: string | void) {
  getIsWatchAppInstalled().then(installed => {
    console.log('Watch app installed:', installed);
    if (installed) {
      getIsPaired().then(paired => {
        console.log('Watch is paired:', paired);
        if (paired) {
          checkReachability(token);
        }
      });
    }
  });
}

function checkReachability(token: string | void) {
  getReachability().then(reachable => {
    console.log('Watch is reachable:', reachable);
    if (reachable) {
      sendTokenToWatch(token);
    } else {
      retryReachability(3, token);
    }
  });
}

function retryReachability(retries: number, token: string | void, delay = 1000) {
  getReachability().then(reachable => {
    console.log('Watch is reachable:', reachable);
    if (reachable) {
      sendTokenToWatch(token);
    } else if (retries > 0) {
      setTimeout(() => retryReachability(retries - 1, token, delay * 2), delay);
    }
  });
}

function sendTokenToWatch(token: string | void) {
  sendMessage(
    {tokenFromApp: token}, 
    reply => {console.log('Token sent successfully:', reply)},
    error => {console.log("Error sending token:", error)}
  );
}

export function setAuthToken(token: string | void, isGuest: boolean, netInfo: any) {
  // Використовуємо watchEvents з react-native-watch-connectivity
  watchEvents.addListener('reachability', (reachable: boolean) => {
    console.log('Watch is reachable:', reachable);
    if (reachable && !isGuest && token) {
      sendTokenToWatch(token);
    }
  });

  if (!isGuest && token) {
    axiosApi.defaults.baseURL = `${API_URL}/api`;
    axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("setAuthToken", token);
    
    if (isIOS) {
      checkWatchStatus(token);
    } else {
      NativeModules.TokenBridge.sendTokenToWatch(token);
    }
  } else {
    delete axiosApi.defaults.headers.common["Authorization"];
    axiosApi.defaults.params = { token };
    axiosApi.defaults.baseURL = `${API_URL}/api/guest`;
  }
}

export default axiosApi