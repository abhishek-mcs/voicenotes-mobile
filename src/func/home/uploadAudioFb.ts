import axiosApi from "services/api/axios-api";
import * as FileSystem from "expo-file-system";
import * as Sentry from '@sentry/react-native';
import { deviceInfo } from "services/api/api-constants";

export const saveVoiceNote = async (data: {
  audio: any;
  duration: number;
  parent_id: string | null;
  recorded_at: number| undefined;
  temp_id:any
}) => {
  const { audio, duration, parent_id, recorded_at=Date.now(),temp_id } = data;

  const uri = audio;
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    Sentry.captureMessage("File does not exist", "error");
    console.log("File does not exist")
    throw new Error("File does not exist");
  }

  const filetype = uri.split(".").pop();
  const filename = uri.split("/").pop();

  try {
    const signedURLCall = await axiosApi.get("recordings/signed-url")
    const signedURL=signedURLCall?.data?.url
    const upload_id=signedURLCall?.data?.upload_id
    // const formData:any = new FormData();
    // formData.append("audio", {
    //   uri: uri,
    //   name: filename,
    //   type: `audio/${filetype}`,
    // });

    await FileSystem.uploadAsync(signedURL, uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': `audio/${filetype}`,
        'Connection': 'Keep-Alive',
      }
    });

    const formData1:any = new FormData();
    formData1.append("upload_id", upload_id);
    formData1.append("recording_identifier", temp_id);
    if (parent_id) {
      console.log("appending parent id: ", parent_id);
      formData1.append("parent_id", parent_id);
    }
    formData1.append("duration", duration.toString());
    formData1.append("device_info", JSON.stringify(deviceInfo));
    formData1.append("recorded_at", recorded_at.toString());

    // Make the POST request using axios
    const response = await axiosApi.post("recordings/new", formData1, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload successful:");
    return response.data;
  } catch (error) {
    console.warn("Error uploading file:", error);
    Sentry.captureMessage("Failed to upload file: "+ error,"error")
    throw error;
  }
};
