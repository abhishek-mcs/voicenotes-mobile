import { bottomSvg } from "assets/svg/bottomSvg";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import RecButton from "./rec-button";
import { useMemo } from "react";
// import Waveform from "./waveform";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { useTheme } from "context";
import { isSmallDevice } from "utils/common";

export default ({
  onPause,
  onStopRecord = (v: any) => {},
  duration = 0,
  totalDuration = "",
  onCancel = () => {},
  setShowAskMe = (v: any) => {},
  showAskMe = true,
  paused = false,
  setPaused,
  isCanceling = false,
  setIsCanceling = (v: any) => {},
}: any) => {
  const formattedDuration = new Date(duration).toISOString().substring(14, 19);
  const { userDetails }: any = useSelector(
    (state: RootState) => state.userDetails
  );
  const { Colors } = useTheme()
  const styles = useStyles()
  const bottomSvgIcons:any = bottomSvg;

  const continueRecording = () => {
    setIsCanceling(false);
    setShowAskMe(true);
  };

  const onCancelClick = () => {
    if (duration >= 10000) {
      setIsCanceling(true);
      setShowAskMe(false);
    } else {
      setPaused(false);
      onCancel();
    }
  };

  if (!isCanceling)
    return (
      // <View style={{height:156,width:'100%',padding:16}}>
      // {/* <View style={[styles.row,{justifyContent:'space-between'}]}>
      //   <Text style={styles.tabItemText}>Recording...</Text>
      //   <View style={[styles.row,{width:'20%'}]}>
      //     <View style={{backgroundColor:'red',height:6,width:6,borderRadius:10,marginRight:8}}/>
      //     <Text style={styles.tabItemText}>{`${formattedDuration}${totalDuration}`}</Text>
      //   </View>
      // </View> */}
      // {/* <Waveform recording={rec}/> */}
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <RecButton
          title="Cancel"
          bgColor={Colors.bottomBarButtonBg}
          underlayColor={Colors.redWithOpacity(0.06)}
          color={Colors.redWithOpacity(1)}
          onPress={onCancelClick}
          style={{
            paddingHorizontal: !userDetails?.subscription_status ? 16 : 20,
          }}
        />
        <View
          style={[
            styles.row,
            { width: !userDetails?.subscription_status ? "auto" : "20%" },
          ]}
        >
          <View
            style={{
              backgroundColor: Colors.redWithOpacity(1),
              height: 6,
              width: 6,
              borderRadius: 10,
              marginRight: 8,
            }}
          />
          <Text
            style={[
              styles.tabItemText,
              !userDetails?.subscription_status ? { fontSize: 12 } : {},
            ]}
          >{`${formattedDuration}${totalDuration}`}</Text>
        </View>
        {onPause && (
          <RecButton
            icon={!paused ? bottomSvgIcons.pause?.replaceAll("black",Colors.blackWithOpacity(1)) : bottomSvgIcons.play?.replaceAll("black",Colors.blackWithOpacity(1))}
            title=""
            underlayColor=""
            onPress={onPause}
            bgColor={Colors.bottomBarButtonBg1}
            style={{ paddingHorizontal: 12, marginRight:isSmallDevice?-4: -12,borderRadius:16,height:40 }}
          />
        )}
        <RecButton
          title="Done"
          icon={bottomSvg.done}
          color={Colors.green}
          bgColor={Colors.greenWithOpacity(0.2)}
          underlayColor={Colors.greenWithOpacity(0.3)}
          onPress={onStopRecord}
          style={{
            paddingHorizontal: !userDetails?.subscription_status ? 16 : 20,
          }}
        />
      </View>
      // </View>
    );
  else
    return (
      <View
        style={{
          justifyContent: "center",
          flex: 1,
          alignItems: "center",
          paddingVertical: 16,
        }}
      >
        <Text
          style={{
            fontFamily: "Primary-Semibold",
            color: Colors.blackWithOpacity(1),
            fontSize: 14,
          }}
        >
          Are you sure you want to cancel this recording?
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            marginTop: 16,
          }}
        >
          <RecButton
            title="Yes, cancel"
            bgColor={Colors.redWithOpacity(0.05)}
            underlayColor={Colors.redWithOpacity(0.06)}
            color={Colors.redWithOpacity(1)}
            onPress={onCancel}
            style={{ paddingHorizontal: 20 }}
          />
          <RecButton
            title="No, continue"
            onPress={continueRecording}
            style={{ paddingHorizontal: 20, marginLeft: 12 }}
          />
        </View>
      </View>
    );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:Colors.whiteWithOpacity(1),
  },
  tabItemText: {
    fontFamily: "Primary-Semibold",
    fontSize: 14,
    color: Colors.black2,
    fontWeight: "600",
    lineHeight: 17,
  },
  row: { flexDirection: "row", alignItems: "center" },
  scroll: {
    maxHeight: 200,
  },
  item: {
    width: 3,
    backgroundColor: Colors.blue,
    marginHorizontal: 2,
  },
}), [Colors]); // Recreate styles when Colors change
};
