import { Audio } from "expo-av";
import { openSettings } from "expo-linking";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
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
          playThroughEarpieceAndroid: false,
          staysActiveInBackground:true,
        });

        const { recording: recordingObject, status } = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        },()=>{},30);
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
    console.error("Failed to start recording", err);
    //getting error here
  }
};

export const stopRecording = async (recording: Audio.Recording|any ) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri

  } catch (error) {
    console.error("Failed to stop recording", error);
  }
};

export const cancelRecording = async (recording: Audio.Recording | null,soundRef:Audio.Sound|null) => {
  try {
    await recording?.stopAndUnloadAsync();
    await recording?._cleanupForUnloadedRecorder()
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
