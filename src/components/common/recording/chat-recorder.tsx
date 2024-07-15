import Colors from "assets/Colors"
import { bottomSvg } from "assets/svg/bottomSvg"
import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"
import RecButton from "./rec-button"

export default ({onPause,onStopRecord=(v:any)=>{},duration=0,totalDuration='',onCancel=()=>{}}:any)=>{
  const formattedDuration = new Date(duration).toISOString().substring(14, 19);

    return (
        <View style={[{justifyContent:'space-between',flexDirection:'row',flex:1,alignItems:'center'},onPause?{alignItems:'flex-end',height:156}:{}]}>
          <RecButton title="Cancel" bgColor="#FF45380D" underlayColor="#FF45380F" color={'#FF4538'} onPress={onCancel} style={{paddingHorizontal:20}}/>
          <View style={[styles.row]}>
            <View style={{backgroundColor:'red',height:6,width:6,borderRadius:10,marginRight:8}}/>
            <Text style={styles.tabItemText}>{`${formattedDuration}${totalDuration}`}</Text>
          </View>
          <RecButton
            title="Done"
            icon={bottomSvg.done}
            color={Colors.green}
            bgColor={Colors.greenWithOpacity(0.2)}
            underlayColor={Colors.greenWithOpacity(0.3)}
            onPress={onStopRecord}
            style={{paddingHorizontal:20}}
          />
        </View>
    )
}


const styles = StyleSheet.create({
    tabItemText: {
      fontFamily: "Primary-Semibold",
      fontSize: 14,
      color: "#000",
      fontWeight: "700",
      lineHeight:17
    },
    row:{flexDirection:'row',alignItems:"center"},
  });