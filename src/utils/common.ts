import { Dimensions } from "react-native";
import { Platform } from "react-native";
import axiosApi from "services/api/axios-api";

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isIOS = Platform.OS=="ios"
export const isAndroid = Platform.OS=="android"
export const screenHeight=Dimensions.get('window').height
export const screenWidth=Dimensions.get('window').width
export const isIOSSmall = isIOS && screenHeight<690


export  const fetchSingleRecording = async (id: any) => {
    console.log("refetching single recording: ", id);
    const resp = await axiosApi.get(`/recordings/${id}`);
    return resp;
  };