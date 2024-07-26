import axiosApi from "services/api/axios-api";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";

export const saveVoiceNote = async (data: { audio: any; duration: number, parent_id: string| null , recorded_at: number}) => {
  const {audio, duration, parent_id, recorded_at} = data
  const deviceInfo = {
    platform: Platform.OS,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    deviceType:
      Device.deviceType === null ? null : Device.DeviceType[Device.deviceType],
    osVersion: Device.osVersion,
    appVersion: Application.nativeApplicationVersion,
  };

  const uri = audio;
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error("File does not exist");
  }

  const filetype = uri.split(".").pop();
  const filename = uri.split("/").pop();

  try {
    const formData = new FormData();
    formData.append("audio", {
      uri: uri,
      name: filename,
      type: `audio/${filetype}`,
    });
    if(parent_id){
      console.log('appending parent id: ', parent_id);
      formData.append("parent_id", parent_id);
    }
    formData.append("duration", duration.toString());
    formData.append("device_info", JSON.stringify(deviceInfo));
    formData.append("recorded_at", recorded_at);

    // Make the POST request using axios
    const response = await axiosApi.post("recordings/new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.warn("Error uploading file:", error);
    throw error;
  }
};
