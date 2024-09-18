import { Dimensions } from "react-native";
import { Platform } from "react-native";
import { Language } from "types";
import { languages } from "./constants/languages";

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getLanguageCode = (languageName: string): Language | undefined =>
    Object.entries(languages).find(([_, value]) => value === languageName)?.[0] as Language | undefined;

export const isIOS = Platform.OS=="ios"
export const isAndroid = Platform.OS=="android"
export const screenHeight=Dimensions.get('window').height
export const screenWidth=Dimensions.get('window').width
export const isIOSSmall = isIOS && screenHeight<690