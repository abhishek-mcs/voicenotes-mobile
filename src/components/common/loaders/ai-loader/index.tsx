import { home } from "assets/svg/home"
import LottieView from "lottie-react-native"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { SvgXml } from "react-native-svg"
import loader from "assets/lottie/loader.json"

export default ({text="Creating transcript from your voice",size=16,style={}}:{text?:string,style?:ViewStyle,size?:number})=>(
  <View style={[styles.row,style]}>
    <SvgXml xml={home.bliss} />
    <Text style={[styles.text,{fontSize:size}]}>{text}</Text>
    <View><LottieView source={loader} autoPlay loop style={styles.lottie}/></View>
  </View>
)

const styles = StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',position:'relative',width:'92%'},
    text:{color:'#58a942',fontFamily:'Primary',fontSize:16,marginLeft:6,lineHeight:24},
    lottie:{width:40,height:35,bottom:-2,right:4}
})