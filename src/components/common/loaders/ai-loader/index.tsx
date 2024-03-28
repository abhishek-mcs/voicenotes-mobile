import { home } from "assets/svg/home"
import LottieView from "lottie-react-native"
import { StyleSheet, Text, View } from "react-native"
import { SvgXml } from "react-native-svg"
import loader from "assets/lottie/loader.json"

export default ({text="Creating transcript from your voice"})=>(
  <View style={styles.row}>
    <SvgXml xml={home.bliss} />
    <Text style={styles.text}>{text}</Text>
    <View><LottieView source={loader} autoPlay loop style={styles.lottie}/></View>
  </View>
)

const styles = StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',position:'relative'},
    text:{color:'#58a942',fontFamily:'Primary',fontSize:16,lineHeight:26,marginLeft:6},
    lottie:{width:40,height:35,bottom:-2,right:4}
})