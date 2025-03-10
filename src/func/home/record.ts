import { Audio } from "expo-av";
import { openSettings } from "expo-linking";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Sentry from '@sentry/react-native';
import * as FileSystem from 'expo-file-system';
import * as KeepAwake from 'expo-keep-awake'
import { isIOS } from "utils/common";

type ExtendedRecording = Audio.Recording & {
  _appStateSubscription?: {
    remove: () => void;
  };
  _appStateChangeSubscription?: {
    remove: () => void;
  };
  getURI: () => string | null;
  stopAndUnloadAsync: () => Promise<void>;
};

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
  setRec = (v: ExtendedRecording) => {},
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
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
          keepAudioActiveHint: true,
          android:{
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000, // Lower sample rate for low quality
            numberOfChannels: 1, // Mono
            bitRate: 64000, // Lower bit rate
          },
          ios: {
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.LOW,
            sampleRate: 16000, // Lower sample rate
            numberOfChannels: 1, // Mono
            bitRate: 64000, // Lower bit rate
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        },()=>{},30);
        
        // await startSilentBackgroundService('recording');
        const extendedRecording = recordingObject as ExtendedRecording;
        
        setRec(extendedRecording);
        setRecEnabled(true);
        
        await KeepAwake.activateKeepAwakeAsync();
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

              const { recording: recordingObject, status }:any = await Audio.Recording.createAsync({
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
                keepAudioActiveHint: true
              },()=>{},10);
              setRec(recordingObject);
              setRecEnabled(true);
            } else if (!canAskAgain && status == "denied") {
              alertPermission(isLightMode,showDialog)
          }
        }
        );
      } else if (!status.canAskAgain && status.status == "denied") {
        alertPermission(isLightMode,showDialog);
        return;
      }
    });
  } catch (err:any) {
    console.log("Failed to start recording", err);
  }
};

export const stopRecording = async (recording: ExtendedRecording|any ) => {
  try {
    await recording.stopAndUnloadAsync();
    let uri = recording.getURI();
    if(isIOS)
      uri = await saveRecording(uri)?? uri;
    return uri;

  } catch (error) {
    console.log("Failed to stop recording", error);
  }
};

export const cancelRecording = async (recording: ExtendedRecording | any,soundRef:Audio.Sound|null) => {
  try {
    if (recording) {
      if (recording._appStateSubscription) {
        recording._appStateSubscription.remove();
      }
      if (recording._appStateChangeSubscription) {
        recording._appStateChangeSubscription.remove();
      }
    }
    await recording?.stopAndUnloadAsync();
    await soundRef?.unloadAsync();
    KeepAwake.deactivateKeepAwake();
    // await stopSilentBackgroundService();
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
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
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


export const saveRecording = async (uri: string = "", isCache = false) => {  // Recording.getURI()
  try {
    const DOCUMENT_FOLDER = `${FileSystem.documentDirectory}`;
    const CACHE_FOLDER = `${FileSystem.cacheDirectory}`;
    // Get just the name and extension of the recording file created from the URI path
    const fileName = uri?.split('/')?.pop();
    const moveTo = `${isCache?CACHE_FOLDER:DOCUMENT_FOLDER}${fileName}`;
    
    // Move the file and wait for completion
    await FileSystem.copyAsync({ 
      from: uri, 
      to: moveTo 
    });
    
    return moveTo;  // Return the new location if successful
  } catch (error) {
    console.error('Error moving recording:', error);
    return null;  // Return null if move failed
  }
}