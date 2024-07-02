import axios from "axios"
import { API_URL } from "./api-constants"
import * as Device from "expo-device"
import * as Application from "expo-application"
import { sendMessage, watchEvents } from 'react-native-watch-connectivity';
import { isIOS } from "utils/common";
import { NativeModules } from "react-native";

const axiosApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "User-Agent": `Voicenotes-${Device.osName}-${Application.nativeApplicationVersion}`,
  },
})

export function setAuthToken(token: string | void,isGuest:boolean,netInfo:any) {
  if (!isGuest) {
    axiosApi.defaults.baseURL=`${API_URL}/api`
    axiosApi.defaults.params={}
    axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`
    isIOS?
    sendMessage(
      {tokenFromApp: token,
        internetType: netInfo.type
      }, 
      reply => {console.log(reply)},
      error => { 
          if (error) { 
            console.log("error", error)
          }
      }
    )
    :NativeModules.TokenBridge.sendTokenToWatch(token);
  } else {
    delete axiosApi.defaults.headers.common["Authorization"]
    axiosApi.defaults.params={token}
    axiosApi.defaults.baseURL=`${API_URL}/api/guest`
  }
}

export default axiosApi
