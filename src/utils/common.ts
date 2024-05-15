import { Dimensions } from "react-native";
import { Platform } from "react-native";

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isIOS = Platform.OS=="ios"
export const isAndroid = Platform.OS=="android"
export const screenHeight=Dimensions.get('window').height
export const screenWidth=Dimensions.get('window').width
export const isIOSSmall = isIOS && screenHeight<690

export function formatHtmlText(txt:any){
    return txt?.replaceAll(/<br\s*\/?>/gi, '\n')?.replaceAll(/&nbsp;|&#160;/gi, ' ')
}