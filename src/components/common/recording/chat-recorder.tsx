import Colors from "assets/Colors"
import { bottomSvg } from "assets/svg/bottomSvg"
import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"
import RecButton from "./rec-button"
import { AIModalSVG } from "assets/svg/AIModalSvg"
import Waveform from "./waveform"
import { screenWidth } from "utils/common"
import { memo } from "react"

const ChatRecorder = ({onPause,onStopRecord=(v:any)=>{},duration=0,totalDuration='',onCancel=()=>{},recording=null}:any)=>{
  const formattedDuration = new Date(duration).toISOString().substring(14, 19);
console.log('rec')
    return (
      <View style={{height:97,paddingTop:10}}>
        <View style={[styles.row,{alignSelf:'center'}]}>
          <View style={{backgroundColor:'red',height:6,width:6,borderRadius:10,marginRight:8}}/>
          <Text style={styles.tabItemText}>{`${formattedDuration}${totalDuration}`}</Text>
        </View>
        <View style={[{justifyContent:'space-between',flexDirection:'row',flex:1,alignItems:'center'},onPause?{alignItems:'flex-end'}:{}]}>
          <RecButton title="" bgColor="transparent" icon={AIModalSVG.cancel} underlayColor="transparent" color={'#FF4538'} onPress={onCancel} style={{paddingHorizontal:0}}/>
          
          <Waveform recording={recording}/>
          
          <RecButton
            title=""
            icon={AIModalSVG.send}
            color={Colors.green}
            bgColor={'transparent'}
            underlayColor={Colors.greenWithOpacity(0.3)}
            onPress={onStopRecord}
            style={{paddingHorizontal:0}}
          />
        </View>
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

  export default memo(ChatRecorder)