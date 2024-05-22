import Colors from "assets/Colors";
import { bottomSvg } from "assets/svg/bottomSvg";
import { home } from "assets/svg/home";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableHighlight, View, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";

interface Props {
  onRecord: () => void;
  onStopRecord: (d:number) => void;
  onAsk: () => void;
  onCreate: () => void;
  recEnabled: boolean;
  onCancel: ()=> void;
}

export default ({ onRecord, onAsk, onCreate, recEnabled = false,onStopRecord,onCancel }: Props) => {
    const [duration, setDuration] = useState(0);
    const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
    useEffect(() => {
        if (recEnabled) {
          const timerId = setInterval(() => {
            setDuration(prevDuration => {
              const newDuration = prevDuration + 1000;
              if (newDuration >= 60000&&(!token||!userDetails?.subscription_status)) {
                onStopRecord(newDuration);
                return 0;
              }else if(newDuration>=1800000&&!!token){
                onStopRecord(newDuration);
                return 0
              }
              return newDuration;
            }); // Update duration every second
          }, 1000);

          return () => {
            clearInterval(timerId);
            setDuration(0);
          }; // Cleanup the interval on component unmount
        }
      }, [recEnabled]);
    const formattedDuration = new Date(duration).toISOString().substring(14, 19);
  return (
    <View style={styles.tab}>
      {!recEnabled ? (
        <>
          <Button
            onPress={onRecord}
            title="Record"
            icon={home.record}
            underlayColor={Colors.blackWithOpacity(0.7)}
            bgColor={"#000"}
            color="#fff"
            style={{flex:2}}
          />
          <Button onPress={onAsk} title="Ask" icon={home.ask} style={{paddingHorizontal:20,marginHorizontal:8}}/>
          <Button onPress={onCreate} title="Create" icon={home.create} style={{flex:2}} />
        </>
      ) : (
        <View style={{justifyContent:'space-between',flexDirection:'row',flex:1}}>
        <Button title="Cancel" onPress={onCancel} style={{paddingHorizontal:20}}/>
          <View style={styles.row}>
            <View style={{backgroundColor:'red',height:6,width:6,borderRadius:10,marginRight:8}}/>
            <Text style={styles.tabItemText}>{`${formattedDuration}${(!!token&&userDetails?.subscription_status)?'':'/01:00'}`}</Text>
          </View>
          <Button
            title="Done"
            icon={bottomSvg.done}
            color={Colors.green}
            bgColor={Colors.greenWithOpacity(0.2)}
            underlayColor={Colors.greenWithOpacity(0.3)}
            onPress={()=>onStopRecord(duration)}
            style={{paddingHorizontal:20}}
          />
        </View>
      )}
    </View>
  );
};

interface BtnProps{
    onPress: () => void,
    icon?: string,
    title: string,
    bgColor?: string,
    color?: string,
    underlayColor?: string,
    style?:ViewStyle
}

const Button = ({
  onPress = () => {},
  icon,
  title = "Ask",
  bgColor = "#2222220D",
  color = "#000",
  underlayColor = "rgba(0,0,0,0.1)",
  style={},
}:BtnProps) => (
  <TouchableHighlight
    onPress={onPress}
    style={[styles.tabItem, { backgroundColor: bgColor },style]}
    underlayColor={underlayColor}
  >
    <>
      {icon&&<SvgXml xml={icon} style={{marginRight:isIOS?4:6}}/>}
      <Text style={[styles.tabItemText, { color }]}>{title}</Text>
    </>
  </TouchableHighlight>
);

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
    shadowColor:isIOS?"#00000026":"rgba(0,0,0,0.7)",
		shadowOpacity: 0.9,
		shadowOffset: { width: 0, height:0.5 },
		shadowRadius: 1.5,
    zIndex:10,
		elevation: 3,
    paddingHorizontal: 12,
    paddingVertical:8,
    // justifyContent: "space-between",
  },
  tabItem: {
    height: 40,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center',
    backgroundColor: "#2222220D",
    overflow: "hidden",
  },
  tabItemText: {
    fontFamily: "Primary-Semibold",
    fontSize: 14,
    color: "#000",
    fontWeight: "700",
    lineHeight:17
  },
  row:{flexDirection:'row',alignItems:"center"},
});
