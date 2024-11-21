import { home } from "assets/svg/home"
import LottieView from "lottie-react-native"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { SvgXml } from "react-native-svg"
import loader from "assets/lottie/threeDotLoader.json"
import { useTheme } from "context"

export default ({size=40,style={}}:{style?:ViewStyle,size?:number})=>{
  const { Colors } = useTheme()
  return (
  <View style={[styles.row,style]}>
    <LottieView source={loader} autoPlay loop style={[styles.lottie,{width:size,height:size}]}
    colorFilters={[
      {keypath:'Left',color:Colors.text},
      {keypath:'Mid',color:Colors.text},
      {keypath:'Right',color:Colors.text}
    ]}
    />
  </View>
)}

const styles = StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',position:'relative'},
    lottie:{right:8}
})