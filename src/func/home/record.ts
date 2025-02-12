import { Audio } from "expo-av";
import { openSettings } from "expo-linking";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as Sentry from '@sentry/react-native';
import * as FileSystem from 'expo-file-system';

const alertPermission=(isLightMode=true,showDialog=(p0?: string, p1?: string, p2?: ({ text: string; style: string; onPress?: undefined; } | { text: string; onPress: () => Promise<void>; style?: undefined; })[], p3?: { userInterfaceStyle: string; })=>{})=>{
  const txt = "Please enable microphone permission to continue";
        showDialog(
          Platform.OS == "ios" ? txt : "",
          Platform.OS == "ios" ? "" : txt,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open settings",
              onPress: () => openSettings(),
            },
          ],{userInterfaceStyle:isLightMode?"light":"dark"}
        );
}

export const checkRecordPermission = async () => {
  await Audio.getPermissionsAsync().then(async status => {
    if (status.status != "granted") {
      await Audio.requestPermissionsAsync();
  }})
}

export const onRecord = async (
  setRec = (v: Audio.Recording) => {},
  setRecEnabled = (v: boolean) => {},
  isLightMode=true,
  showDialog=(p0?: string, p1?: string, p2?: ({ text: string; style: string; onPress?: undefined; } | { text: string; onPress: () => Promise<void>; style?: undefined; })[], p3?: { userInterfaceStyle: string; })=>{}
) => {
  try {
    await Audio.getPermissionsAsync().then(async status => {
      if (status.status == "granted") {
        // Set audio mode to allow recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: 0,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: true,
          staysActiveInBackground:true,
        });

        const { recording: recordingObject, status } = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          // isMeteringEnabled: true,
          // android:{
          //   extension: '.m4a',
          //   outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          //   audioEncoder: Audio.AndroidAudioEncoder.AAC,
          //   sampleRate: 16000, // Lower sample rate for low quality
          //   numberOfChannels: 1, // Mono
          //   bitRate: 64000, // Lower bit rate
          // },
          // ios: {
          //   extension: '.m4a',
          //   audioQuality: Audio.IOSAudioQuality.LOW,
          //   sampleRate: 16000, // Lower sample rate
          //   numberOfChannels: 1, // Mono
          //   bitRate: 64000, // Lower bit rate
          //   linearPCMBitDepth: 16,
          //   linearPCMIsBigEndian: false,
          //   linearPCMIsFloat: false,
          // },
        });
        setRec(recordingObject);
        setRecEnabled(true);
      } else if (status.canAskAgain && status.status == "undetermined") {
        await Audio.requestPermissionsAsync().then(
          async ({ canAskAgain, status }) => {
            if (status == "granted") {
              // Set audio mode to allow recording
              await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: 0,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: 1,
                playThroughEarpieceAndroid: true,
                staysActiveInBackground:true,
              });

              const { recording: recordingObject, status } = await Audio.Recording.createAsync({
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
              },()=>{},10);
              setRec(recordingObject);
              setRecEnabled(true);
            } else if (!canAskAgain && status == "denied") {
              alertPermission(isLightMode,showDialog)
          }
        }
        );
      } else if (!status.canAskAgain && status.status == "denied") {
        alertPermission(isLightMode,showDialog)
      }
    });
  } catch (err:any) {
    console.log("Failed to start recording", err);
    //getting error here
    Sentry.captureMessage("Failed to start recording: " + err, "error")
  }
};

export const stopRecording = async (recording: Audio.Recording|any ) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const newLoc = await saveRecording(uri)?? uri;
    return newLoc;

  } catch (error) {
    console.log("Failed to stop recording", error);
    Sentry.captureMessage("Failed to stop recording: " + error, "error")
  }
};

export const cancelRecording = async (recording: Audio.Recording | null,soundRef:Audio.Sound|null) => {
  try {
    await recording?.stopAndUnloadAsync();
    await soundRef?.unloadAsync();
  } catch (error) {
    console.error("Failed to stop recording", error);
  }
};

export const setupAudioRec = (recording: Audio.Recording | null) => {
  return useEffect(() => {
    // Set up audio mode to enable recording
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Failed to set audio mode", error);
      }
    };

    setupAudio();

    return () => {
     recording&& stopRecording(recording); // Cleanup: stop recording when component unmounts
    };
  }, []);
};

const DOCUMENT_FOLDER = `${FileSystem.documentDirectory}`;

const saveRecording = async (uri: string = "") => {  // Recording.getURI()
  // Get just the name and extension of the recording file created from the URI path. eg) ephisa-wjfwanjdn.m4a 
  const fileName = uri?.split('/')?.pop();
  const moveTo = `${DOCUMENT_FOLDER}${fileName}`;

  // Move the file that were in the old URI to the Documents folder.
  await FileSystem.copyAsync({ from: uri, to:  moveTo, }); // /Documents/ephisa-wjfwanjdn.m4a 
  return moveTo;
}