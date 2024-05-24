import Colors from "assets/Colors"
import { bottomSvg } from "assets/svg/bottomSvg"
import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { Button, View } from "react-native"
import RecButton from "./rec-button"
import { useState } from "react"

export default ({onPause,onStopRecord=(v:any)=>{},duration=0,totalDuration='',onCancel=()=>{},setShowAskMe=(v:any)=>{},showAskMe=true}:any)=>{
  const [isCanceling, setIsCanceling] = useState(false);
  const [paused, setPaused] = useState(false);
  const formattedDuration = new Date(duration).toISOString().substring(14, 19);

  const continueRecording = () => {
    setIsCanceling(false);
    setShowAskMe(true);
  }

  const onCancelClick = () =>{
    if(duration>=10000){
      setIsCanceling(true);
      setShowAskMe(false);
    }else
      onCancel();
  }

  const onPauseClick = () =>{
    setPaused(!paused);
    onPause();
  }

  if(!isCanceling)
    return (
        <View style={{justifyContent:'space-between',flexDirection:'row',flex:1,alignItems:'center'}}>
          <RecButton title="Cancel" bgColor="#FF45380D" underlayColor="#FF45380F" color={'#FF4538'} onPress={onCancelClick} style={{paddingHorizontal:20}}/>
          <View style={[styles.row,{width:'20%'}]}>
            <View style={{backgroundColor:'red',height:6,width:6,borderRadius:10,marginRight:8}}/>
            <Text style={styles.tabItemText}>{`${formattedDuration}${totalDuration}`}</Text>
          </View>
          {onPause&&<RecButton icon={!paused?bottomSvg.pause:bottomSvg.play} title="" underlayColor="" onPress={onPauseClick} style={{paddingHorizontal:17,marginRight:-12}}/>}
          <RecButton
            title="Done"
            icon={bottomSvg.done}
            color={Colors.green}
            bgColor={Colors.greenWithOpacity(0.2)}
            underlayColor={Colors.greenWithOpacity(0.3)}
            onPress={()=>onStopRecord(duration)}
            style={{paddingHorizontal:20}}
          />
        </View>
    )
    else
      return (
        <View style={{justifyContent:'center',flex:1,alignItems:'center',paddingVertical:16}}>
          <Text style={{fontFamily:'Primary-Semibold',color:'#000',fontSize:14}}>
            Are you sure you want to cancel this recording?
          </Text>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',width:'100%',marginTop:16}}>
            <RecButton title="Yes, cancel" bgColor="#FF45380D" underlayColor="#FF45380F" color={'#FF4538'} onPress={onCancel} style={{paddingHorizontal:20}}/>
            <RecButton title="No, continue" onPress={continueRecording} style={{paddingHorizontal:20}}/>
          </View>
        </View>)
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