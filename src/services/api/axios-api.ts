import axios from "axios"
import { API_URL } from "./api-constants"
import * as Device from "expo-device"
import * as Application from "expo-application"
import { getReachability, getIsPaired, getIsWatchAppInstalled , sendMessage, watchEvents } from 'react-native-watch-connectivity';

import { isIOS } from "utils/common";
import { NativeModules } from "react-native";

const axiosApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "User-Agent": `Voicenotes-${Device.osName}-${Application.nativeApplicationVersion}`,
  },
})

function checkWatchStatus(retries: number, token: string | void) {
  getIsWatchAppInstalled().then(installed => {
    console.log('Watch app installed:', installed);
    if (installed) {
      getIsPaired().then(paired => {
        console.log('Watch is paired:', paired);
        if (paired) {
          retryReachability(retries, token);
        }
      });
    }
  });
}

function retryReachability(retries: number, token: string | void) {
  getReachability().then(reachable => {
    console.log('Watch is reachable:', reachable);
    sendMessage(
      {tokenFromApp: token}, 
      reply => {console.log(reply)},
      error => { 
        if (error) { 
          console.log("error", error)
        }
      }
    );
    if (!reachable && retries > 0) {
      setTimeout(() => retryReachability(retries - 1, token), 1000);
    }
  });
}

export function setAuthToken(token: string | void,isGuest:boolean,netInfo:any) {
  if (!isGuest) {

    getIsWatchAppInstalled().then(installed => {
      console.log('Watch app installed:', installed);
    });

    getIsPaired().then(paired => {
      console.log('Watch is paired:', paired);
    });

    // getReachability().then(reachable => {
    //   console.log('Watch is reachable:', reachable);
    // });

    axiosApi.defaults.baseURL=`${API_URL}/api`
    axiosApi.defaults.params={}
    axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`
    console.log("setAuthToken", token)
    isIOS?
    checkWatchStatus(3, token)
    
    // setTimeout(() => {
    //   sendMessage(
    //     {tokenFromApp: token}, 
    //     reply => {console.log(reply)},
    //     error => { 
    //       if (error) { 
    //         console.log("error", error)
    //       }
    //     }
    //   );
    // }, 1000)

    // sendMessage(
    //   {tokenFromApp: token}, 
    //   reply => {console.log(reply)},
    //   error => { 
    //       if (error) { 
    //         console.log("error sendMessage", error)
    //       }
    //   }
    // )
    :NativeModules.TokenBridge.sendTokenToWatch(token);
  } else {
    delete axiosApi.defaults.headers.common["Authorization"]
    axiosApi.defaults.params={token}
    axiosApi.defaults.baseURL=`${API_URL}/api/guest`
  }
}

export default axiosApi
