import { Platform } from "react-native";

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isIOS = Platform.OS=="ios"