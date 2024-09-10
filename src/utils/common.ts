import { Dimensions } from "react-native";
import { Platform } from "react-native";
import axiosApi from "services/api/axios-api";
import * as FileSystem from 'expo-file-system';


export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isIOS = Platform.OS == "ios";
export const isAndroid = Platform.OS == "android";
export const screenHeight = Dimensions.get("window").height;
export const screenWidth = Dimensions.get("window").width;
export const isIOSSmall = isIOS && screenHeight < 690;

export const fetchSingleRecording = async (id: any) => {
  console.log("refetching single recording: ", id);
  await axiosApi.get(`/recordings/${id}/related`).catch((error) => {});
  const resp = await axiosApi.get(`/recordings/${id}`);
  return resp;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const isSignedUrlValid = (url:string) => {
  try {
    const params = new URL(url).searchParams;
    const amzDate = params.get('X-Amz-Date');
    const amzExpires = params.get('X-Amz-Expires');

    if (!amzDate || !amzExpires) {
      console.warn('Missing X-Amz-Date or X-Amz-Expires in URL');
      return { expired: true, error: 'Invalid URL format' };
    }

    const issueTime = new Date(amzDate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
    if (isNaN(issueTime.getTime())) {
      console.warn('Invalid X-Amz-Date format');
      return { expired: true, error: 'Invalid date format' };
    }

    const expiresSeconds = parseInt(amzExpires);
    if (isNaN(expiresSeconds)) {
      console.warn('Invalid X-Amz-Expires format');
      return { expired: true, error: 'Invalid expiration format' };
    }

    const expirationTime = new Date(issueTime.getTime() + expiresSeconds * 1000);
    const currentTime = Date.now();
    const timeToExpire = expirationTime.getTime() - currentTime;

    return {
      valid: timeToExpire >= 5000,
      timeToExpire: Math.max(timeToExpire, 0),
      expirationTime: expirationTime.toISOString()
    };
  } catch (error: any) {
    console.error('Error checking S3 URL expiration:', error);
    return { valid: false, error: error?.message };
  }
}


export async function checkFileExists(filePath: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    console.log({fileInfo});
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}


