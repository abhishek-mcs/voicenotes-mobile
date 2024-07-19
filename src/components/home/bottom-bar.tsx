import React, { Dispatch, SetStateAction, useEffect, useState,useRef } from "react";
import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import NoteRecorder from "components/common/recording/note-recorder";
import RecButton from "components/common/recording/rec-button";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import Touchable from "components/common/Touchable";
import { SvgXml } from "react-native-svg";
import { commonSvg } from "assets/svg/commonSvg";

interface Props {
  onRecord: () => void;
  onStopRecord: (d: number, r?: boolean) => void;
  onAsk: () => void;
  onCreate: () => void;
  recEnabled: boolean;
  onCancel: () => void;
  showAskMe: boolean;
  setShowAskMe: (v:boolean)=>void;
  onPause?:(v:any)=>void;
  rec: any;
  recordingParentNoteName: string | null;
  setRecordingParentId: Dispatch<SetStateAction<string | null>>;
}

export default ({
  recordingParentNoteName,
  setRecordingParentId,
  onRecord,
  onAsk,
  onCreate,
  recEnabled = false,
  onStopRecord,
  onCancel,
  setShowAskMe,
  showAskMe,
  onPause=(v:any)=>{},rec=null
}: Props) => {
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const timerId = useRef<NodeJS.Timeout>();
  const { token, userDetails }: any = useSelector(
    (state: RootState) => state.userDetails
  );
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375; // For small screend devices

  useEffect(() => {
    if (recEnabled&&!paused) {
      timerId.current&&clearInterval(timerId.current);
      timerId.current = setInterval(() => {
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
        });
      }, 1000);

    }
  }, [recEnabled, onStopRecord, token, userDetails?.subscription_status,paused]);

  const onPauseClick = () => {
    onPause(!paused);
    setPaused((p)=>{
      !p&&timerId.current&&clearInterval(timerId.current);
      return !p;
    });
  }

  const onDoneClick = async() => {
    onStopRecord(duration);
    setDuration(0);
    timerId.current&&clearInterval(timerId.current);
    // setPaused(true);
  }

  const onCancelClick = async() => {
    onCancel();
    setDuration(0);
    timerId.current&&clearInterval(timerId.current);
    // setPaused(true);
  }
  return (
    <View style={styles.container}>
      {recordingParentNoteName &&!isCanceling&& (
        <View style={[styles.addingContainer]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ width: "90%" }}>
              <Text style={styles.heading}>
                Adding to Note "{recordingParentNoteName}"
              </Text>
            </View>
            <Touchable
              onPress={() => setRecordingParentId(null)}
              style={{
                width: 20,
                height: 20,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingRight: 0,
              }}
            >
              <SvgXml xml={commonSvg.smallClose} />
            </Touchable>
          </View>
        </View>
      )}
      <View style={styles.tab}>
        {!recEnabled ? (
          <>
            <RecButton
              onPress={onRecord}
              title="Record"
              icon={home.record}
              underlayColor={Colors.blackWithOpacity(0.7)}
              bgColor="#000"
              color="#fff"
              style={styles.button}
            />
            <RecButton
              onPress={onAsk}
              title={isSmallScreen ? "Ask AI" : "Ask my AI"}
              icon={home.ask}
              style={{...styles.button, marginHorizontal: 8}}
            />
            <RecButton
              onPress={onCreate}
              title="Create"
              icon={home.create}
              style={styles.button}
            />
          </>
        ) : (
<NoteRecorder
        totalDuration={(!!token&&userDetails?.subscription_status)?'':'/01:00'}
        duration={duration}
        onCancel={onCancelClick}
        onStopRecord={onDoneClick}
        setShowAskMe={setShowAskMe}
        onPause={onPauseClick}
        showAskMe={showAskMe}
        paused={paused}
        setPaused={setPaused}
        isCanceling={isCanceling}
        setIsCanceling={setIsCanceling}
        rec={rec}/>
        )}
      </View>
    </View>
);
};


const styles = StyleSheet.create({
  addingContainer: {
    backgroundColor: "#fff",
    minHeight: 56,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 85,
    shadowColor: isIOS ? "#00000026" : "rgba(0,0,0,0.7)",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    textAlign: "left",
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
  },
  parentNoteIndicator: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 40,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: isIOS ? "#00000026" : "rgba(0,0,0,0.7)",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.9,
    shadowRadius: 1.5,
    elevation: 3,
    zIndex: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  parentNoteText: {
    fontSize: 14,
    color: "#333",
  },
  tab: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: isIOS ? "#00000026" : "rgba(0,0,0,0.7)",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    elevation: 3,
    paddingHorizontal: "3%",
    paddingVertical: "2%",
  },
  button: {
    flex: 1,
  },
});
