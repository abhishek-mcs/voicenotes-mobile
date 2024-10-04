import axiosApi from "services/api/axios-api";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import {Buffer} from "buffer"

export const saveVoiceNote = async (data: {
  audio: any;
  duration: number;
  parent_id: string | null;
  recorded_at: number| undefined;
  temp_id:any
}) => {
  const { audio, duration, parent_id, recorded_at=Date.now(),temp_id } = data;
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
    // const signedURLCall = await axiosApi.get("recordings/signed-url")
    // const signedURL=signedURLCall?.data?.url
    // const upload_id=signedURLCall?.data?.upload_id
    const formData:any = new FormData();
    formData.append("audio", {
      uri: uri,
      name: filename,
      type: `audio/${filetype}`,
    });

    // const base64 = await FileSystem.readAsStringAsync(uri, {
    //   encoding: FileSystem.EncodingType.Base64,
    // });

    // const buffer = Buffer.from(base64, "base64");
    // // Make the POST request using axios
    // await axios.put(signedURL, buffer, {
    //   headers: {
    //     'Content-Type': `audio/${filetype}`,   // Ensure to set the correct MIME type
    //   },
    // });
    // const formData1:any = new FormData();
    // formData1.append("upload_id", upload_id);
    // formData1.append("recording_identifier", temp_id);
    if (parent_id) {
      console.log("appending parent id: ", parent_id);
      formData.append("parent_id", parent_id);
    }
    formData.append("duration", duration.toString());
    formData.append("device_info", JSON.stringify(deviceInfo));
    formData.append("recorded_at", recorded_at.toString());

    // Make the POST request using axios
    const response = await axiosApi.post("recordings/new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload successful:");
    return response.data;
  } catch (error) {
    console.warn("Error uploading file:", error);
    throw error;
  }
};
