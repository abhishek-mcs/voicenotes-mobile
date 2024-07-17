import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import NoteRecorder from "components/common/recording/note-recorder";
import RecButton from "components/common/recording/rec-button";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableHighlight, useWindowDimensions, View, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";

interface Props {
  onRecord: () => void;
  onStopRecord: (d:number,r?:boolean) => void;
  onAsk: () => void;
  onCreate: () => void;
  recEnabled: boolean;
  onCancel: ()=> void;
  showAskMe: boolean;
  setShowAskMe: (v:boolean)=>void;
  onPause?:(v:any)=>void;
  rec: any;
}

export default ({ onRecord, onAsk, onCreate, recEnabled = false,onStopRecord,onCancel,setShowAskMe,showAskMe,onPause=(v:any)=>{},rec=null}: Props) => {
    const [duration, setDuration] = useState(0);
    const [paused, setPaused] = useState(false);
    const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
    const timerId = useRef<NodeJS.Timeout>();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 375; // Threshold for small screens like iPhone 13 mini
    useEffect(() => {
        if (recEnabled&&!paused) {
            timerId.current&&clearInterval(timerId.current);
            timerId.current = setInterval(async() => {
            setDuration(prevDuration => {
              const newDuration = prevDuration + 1000;
              if (newDuration >= 60000&&(!token||!userDetails?.subscription_status)) {
                onStopRecord(newDuration);
                return 0;
              }else if(newDuration>=1200000&&!!token){
                onStopRecord(newDuration,true);
                return 0
              }
              return newDuration;
            }); // Update duration every second
          }, 1000);
        }
      }, [recEnabled,paused]);
      
      const onPauseClick = () => {
        onPause(!paused);
        setPaused((p)=>{
          !p&&timerId.current&&clearInterval(timerId.current);
          return !p;
        });
      }

      const onDoneClick = async() => {
        await onStopRecord(duration);
        timerId.current&&clearInterval(timerId.current);
        // setPaused(true);
        setDuration(0);
      }

      const onCancelClick = async() => {
        await onCancel();
        timerId.current&&clearInterval(timerId.current);
        setDuration(0);
        // setPaused(true);
      }

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.tab}>
      {!recEnabled ? (
        <>
          <RecButton
            onPress={onRecord}
            title='Record'
            icon={home.record}
            underlayColor={Colors.blackWithOpacity(0.7)}
            bgColor={'#000'}
            color="#fff"
            style={styles.recordButton}
          />
          <RecButton
            onPress={onAsk}
            title={isSmallScreen ? 'Ask AI' : 'Ask my AI'}
            icon={home.ask}
            style={styles.askButton}
          />
          <RecButton
            onPress={onCreate}
            title='Create'
            icon={home.create}
            style={styles.createButton}
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
        rec={rec}
        />
      )}
    </View>
  </SafeAreaView>
);
};


const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tab: {
    flexDirection: "row",
    backgroundColor: "#fff",
    minHeight: 64,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: isIOS ? '#00000026' : 'rgba(0,0,0,0.7)',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    elevation: 3,
    paddingHorizontal: '3%',
    paddingVertical: '2%',
  },
  recordButton: {
    flex: 1,
  },
  askButton: {
    flex: 1,
    marginHorizontal: '2%',
  },
  createButton: {
    flex: 1,
  },
});