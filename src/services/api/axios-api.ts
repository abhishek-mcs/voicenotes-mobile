import axios from "axios"
import { API_URL } from "./api-constants"
import * as Device from "expo-device"
import * as Application from "expo-application"

const axiosApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "User-Agent": `Voicenotes-${Device.osName}-${Application.nativeApplicationVersion}`,
  },
})

export function setAuthToken(token: string | void,isGuest:boolean) {
  if (!isGuest) {
    axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete axiosApi.defaults.headers.common["Authorization"]
    axiosApi.defaults.params={token}
    axiosApi.defaults.baseURL=`${API_URL}/api/guest`
  }
}

export default axiosApi
