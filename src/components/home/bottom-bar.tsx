import Colors from "assets/Colors";
import { bottomSvg } from "assets/svg/bottomSvg";
import { home } from "assets/svg/home";
import Recording from "components/common/recording";
import RecButton from "components/common/recording/rec-button";
import { useGetSingleRecording } from "queries/home/relatedNote";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";

interface Props {
  onRecord: () => void;
  onStopRecord: (d: number, r?: boolean) => void;
  onAsk: () => void;
  onCreate: () => void;
  recEnabled: boolean;
  onCancel: () => void;
  recordingParentId: string;
  setRecordingParentId: () => void;
}

export default ({
  recordingParentId,
  setRecordingParentId,
  onRecord,
  onAsk,
  onCreate,
  recEnabled = false,
  onStopRecord,
  onCancel,
}: Props) => {

  const singleRecording =  useGetSingleRecording(recordingParentId)
  const [note, setNote] = useState(null)

  useEffect(()=>{
    setNote(singleRecording?.data?.data)
  },[singleRecording])
  // console.log({note});
  
  
  const [duration, setDuration] = useState(0);
  const { token, userDetails }: any = useSelector(
    (state: RootState) => state.userDetails
  );
  useEffect(() => {
    if (recEnabled) {
      const timerId = setInterval(async () => {
        setDuration((prevDuration) => {
          const newDuration = prevDuration + 1000;
          if (
            newDuration >= 60000 &&
            (!token || !userDetails?.subscription_status)
          ) {
            onStopRecord(newDuration);
            return 0;
          } else if (newDuration >= 1200000 && !!token) {
            onStopRecord(newDuration, true);
            return 0;
          }
          return newDuration;
        }); // Update duration every second
      }, 1000);

      return () => {
        clearInterval(timerId);
        setDuration(0);
      }; // Cleanup the interval on component unmount
    }
  }, [recEnabled, onStopRecord]);
  
  return (
    <View style={{}}>
      <View style={{


flexDirection: "row",
backgroundColor: "#fff",
height: 40,
borderRadius: 24,
position: "absolute",
left: 20,
right: 20,
bottom: 100,
alignItems: "center",
justifyContent:'center',
shadowColor: isIOS ? "#00000026" : "rgba(0,0,0,0.7)",
shadowOffset: { width: 0, height: 0.5 },
borderColor: 'black',
zIndex: 15,
paddingHorizontal: 12,
paddingVertical: 8,
      }}>
      <Text>Adding as subnote {note?.title ? `of ${note?.title}` : ''}</Text>
      </View>
      {!recEnabled ? (
        <View style={styles.tab}>
          <RecButton
            onPress={()=>onRecord()}
            title="Record"
            icon={home.record}
            underlayColor={Colors.blackWithOpacity(0.7)}
            bgColor={"#000"}
            color="#fff"
            style={{ flex: 2 }}
          />
          <RecButton
            onPress={onAsk}
            title="Ask my AI"
            icon={home.ask}
            style={{ paddingHorizontal: 12, marginHorizontal: 8 }}
          />
          <RecButton
            onPress={onCreate}
            title="Create"
            icon={home.create}
            style={{ flex: 2 }}
          />
        </View>
      ) : (
        <View style={{}}>
          <Text>Adding to Note </Text>
          <View style={styles.tab}>
            <Recording
              totalDuration={
                !!token && userDetails?.subscription_status ? "" : "/01:00"
              }
              duration={duration}
              onCancel={onCancel}
              onStopRecord={onStopRecord}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tab: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 64,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 40,
    alignItems: "center",
    shadowColor: isIOS ? "#00000026" : "rgba(0,0,0,0.7)",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // justifyContent: "space-between",
  },
});
