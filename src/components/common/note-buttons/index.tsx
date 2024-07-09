import Colors from "assets/Colors"
import { home } from "assets/svg/home"
import { Text } from "react-native"
import { View } from "react-native"
import { StyleSheet } from "react-native"
import { TouchableHighlight } from "react-native"
import { SvgXml } from "react-native-svg"
import { isIOS } from "utils/common"
import Touchable from "../Touchable"
import LottieView from "lottie-react-native"
import loader from "assets/lottie/threeDotLoader2.json"

export default ({hashFilter='',onPress=()=>{},icon=home.more,text='',disabled=false,style={},isLoading=false})=>{
    return (
        <Touchable style={[styles.main,style]} onPress={onPress} activeOpacity={0.6}  disabled={disabled||isLoading}>
            {!isLoading?
            <View style={styles.row}>
                <SvgXml xml={icon} />
                <Text style={styles.text}>{text}</Text>
            </View>
            :<LottieView source={loader} style={{width:40,height:20}} autoPlay loop />}
        </Touchable>
    )
}

const styles = StyleSheet.create({
    main:{
        height:32,justifyContent:'center',
        paddingHorizontal:10,
        borderRadius:12,
        backgroundColor:Colors.whiteWithOpacity(1),
        marginHorizontal:4,
        shadowColor:isIOS?'rgba(0,0,0,1)':'rgba(0,0,0,1)',
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.15,
        shadowRadius:1.3,
        zIndex:10,
        elevation:2,
    },
    row:{flexDirection:'row',alignItems:'center',justifyContent:'center'},
    text:{marginLeft:6,fontSize:14,color:'#0D0D0D',fontFamily:'Primary-Medium'}
})