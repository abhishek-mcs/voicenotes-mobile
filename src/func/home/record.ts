import { Audio } from "expo-av";
import { openSettings } from "expo-linking";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
const alertPermission=()=>{
  const txt = "Please enable permissions to continue";
        Alert.alert(
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
          ]
        );
}
export const onRecord = async (
  setRec = (v: Audio.Recording) => {},
  setRecEnabled = (v: boolean) => {}
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
        });

        const recordingObject = new Audio.Recording();
        await recordingObject.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        await recordingObject.setProgressUpdateInterval(500);
        await recordingObject.startAsync();
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

              const recordingObject = new Audio.Recording();
              await recordingObject.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
              );
              await recordingObject.startAsync();
              setRec(recordingObject);
              setRecEnabled(true);
            } else if (!canAskAgain && status == "denied") {
              alertPermission()
          }
        }
        );
      } else if (!status.canAskAgain && status.status == "denied") {
        alertPermission()
      }
    });
  } catch (err:any) {
    console.error("Failed to start recording", err);
    //getting error here
  }
};

export const stopRecording = async (recording: Audio.Recording | null) => {
  try {
    await recording?.stopAndUnloadAsync();
  } catch (error) {
    console.error("Failed to stop recording", error);
  }
};

export const cancelRecording = async (recording: Audio.Recording | null) => {
  try {
    await recording?.stopAndUnloadAsync();
    await recording?._cleanupForUnloadedRecorder()
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
