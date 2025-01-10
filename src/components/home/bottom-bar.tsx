import { Dispatch, SetStateAction, useEffect, useState,useRef, useMemo } from "react";
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
import { useTheme } from "context";

interface Props {
  onRecord: (v:any) => void;
  onStopRecord: (d: number, r?: boolean) => Promise<void>;
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
  parentId?: string | null;
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
  parentId,
  onPause=(v:any)=>{},rec=null
}: Props) => {
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closeAlert, setCloseAlert] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const timerId = useRef<NodeJS.Timeout>();
  const homeIcons:any=home
  const { token, userDetails, canRecord }: any = useSelector(
    (state: RootState) => state.userDetails
  );
  const { isTempIAPPurchased }: any = useSelector(
    (state: RootState) => state.IAPStates
  );
  const isBeliever = userDetails?.subscription_status||isTempIAPPurchased
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375; // For small screend devices
  const [temporaryRecordingId, setTemporaryRecordingId] = useState<string | null>(null);
  const { Colors } = useTheme()
  const styles = useStyles()

useEffect(() => {
    timerId.current&&clearInterval(timerId.current);
    if (recEnabled&&!paused) {
      timerId.current = setInterval(() => {
        setDuration((prevDuration) => {
          const newDuration = prevDuration + 1000;
          if (
            newDuration >= 60000 &&
            (!token || !userDetails?.subscription_status)
          ) {
            onStopRecord(newDuration);
            return 0;
          } else if (newDuration >= 2400000 && !!token) {
            onStopRecord(newDuration, userDetails?.subscription_status);
            return 0;
          }
          return newDuration;
        });
      }, 1000);
    }
  }, [recEnabled, token, userDetails?.subscription_status, paused, onStopRecord, temporaryRecordingId, recordingParentNoteName]);

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
    setRecordingParentId(null)
    // setPaused(true);
  }

  const onCancelClick = async() => {
    onCancel();
    setDuration(0);
    timerId.current&&clearInterval(timerId.current);
    setIsCanceling(false);
    setRecordingParentId(null)
  }

  const onRecordStart = () => {
    !canRecord&&setCloseAlert(false)
    const newTemporaryRecordingId = Math.random().toString(36).substring(7);
    setTemporaryRecordingId(newTemporaryRecordingId);
    onRecord(newTemporaryRecordingId);
  };

  const onCloseAlert = () => {
    canRecord?
    setRecordingParentId(null)
    :setCloseAlert(true)
  }

  return (
    <View style={styles.container}>
      {((!canRecord&&!closeAlert)||recordingParentNoteName || parentId)&&!isCanceling&& (
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
                {(canRecord!=undefined&&canRecord==false)?"Your daily recording limit has been exceeded. Please try again later.":recordingParentNoteName ? `Adding to note "${recordingParentNoteName}"`: "Adding to the current note"}
              </Text>
            </View>
            <Touchable
              onPress={onCloseAlert}
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
      <View style={[styles.tab,isCanceling?styles.alert:{}]}>
        {!recEnabled ? (
          <>
            <RecButton
              onPress={onRecordStart}
              title="Record"
              icon={home.record}
              underlayColor={Colors.underlayColorBlack}
              bgColor={Colors.bottomBarButtonBg}
              color={Colors.bottomBarText}
              style={styles.button}
            />
            <RecButton
              onPress={onAsk}
              title={"Ask AI"}
              icon={homeIcons.ask?.replaceAll('#0D0D0D',Colors.black2)}
              style={{...styles.button}}
              bgColor={Colors.bottomBarButtonBg1}
              color={Colors.bottomBarText1}
            />
            <RecButton
              onPress={onCreate}
              title="Create"
              icon={homeIcons.create?.replaceAll('#0D0D0D',Colors.black2)}
              style={styles.button}
              bgColor={Colors.bottomBarButtonBg1}
              color={Colors.bottomBarText1}
            />
          </>
        ) : (
<NoteRecorder
        totalDuration={(!!token&&isBeliever)?'':'/01:00'}
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


const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  addingContainer: {
    backgroundColor:Colors.bgColor17,
    minHeight: 56,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 90,
    shadowColor: isIOS ?Colors.bgColor10(0.15) : Colors.bgColor10(0.7),
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Primary",
    fontSize: 14,
    color: Colors.text5,
    textAlign: "left",
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    zIndex:10000
  },
  parentNoteIndicator: {
    flexDirection: "row",
    backgroundColor:Colors.whiteWithOpacity(1),
    height: 40,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: isIOS ?Colors.blackWithOpacity(0.15) : Colors.blackWithOpacity(0.7),
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
    color: Colors.darkWithOpacity(1),
  },
  tab: {
    flexDirection: "row",
    backgroundColor:Colors.bgColor14,
    borderWidth:1,
    borderColor:Colors.bgColor13(0.1),
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent:'space-between',
    shadowColor:Colors.bgColor10(1),
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    elevation: 4,
    paddingHorizontal: "2%",
    paddingVertical: "2%",
    // height:74,
    gap:8
  },
  alert:{
    height:'auto',
    borderRadius:16
  },
  button: {
    flex: 1,
  },
}), [Colors]); // Recreate styles when Colors change
};
