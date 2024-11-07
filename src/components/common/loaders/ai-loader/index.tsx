import LottieView from "lottie-react-native"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import loader from "assets/lottie/loader.json"
import { useTheme } from "context"
import { useMemo } from "react"
import { screenWidth } from "utils/common"

export default ({text="Creating transcript from your voice",size=16,style={}}:{text?:string,style?:ViewStyle,size?:number})=>{
  const styles = useStyles()
  return (
  <View style={[styles.row,style]}>
    <LottieView source={loader} autoPlay loop style={styles.lottie}/>
    <Text style={[styles.text,{fontSize:size}]}>{text}</Text>
    <View></View>
  </View>
)}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',position:'relative',width:screenWidth/1.2},
    text:{color:Colors.green,fontFamily:'Primary',fontSize:16,marginLeft:0,lineHeight:24},
    lottie:{width:40,height:35,bottom:-2,right:0}
}), [Colors]);
};