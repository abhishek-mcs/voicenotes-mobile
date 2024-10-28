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
import loader from "assets/lottie/threeDotLoader.json"
import { useTheme } from "context"
import { useMemo } from "react"

interface NoteButtonProps {
    hashFilter?: string
    onPress?: ()=>void
    icon?: any
    text?: string
    disabled?: boolean
    style?: any
    isLoading?: boolean
}

export default ({hashFilter='',onPress=()=>{},icon=home.more,text='',disabled=false,style={},isLoading=false}:NoteButtonProps)=>{
    const styles = useStyles()
    return (
        <Touchable style={[styles.main,style]} onPress={(e)=>{e?.stopPropagation();onPress()}} activeOpacity={0.6}  disabled={disabled||isLoading}>
            {!isLoading?
            <View style={styles.row}>
                {icon&&<SvgXml xml={icon} />}
                <Text style={styles.text}>{text}</Text>
            </View>
            :<LottieView source={loader} style={{width:40,height:20}} autoPlay loop />}
        </Touchable>
    )
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    main:{
        height:34,justifyContent:'center',
        paddingHorizontal:9,
        borderRadius:8,
        backgroundColor:Colors.whiteWithOpacity(1),
        marginRight:6,
        shadowColor:Colors.blackWithOpacity(1),
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.15,
        shadowRadius:1.3,
        zIndex:10,
        elevation:2,
    },
    row:{flexDirection:'row',alignItems:'center',justifyContent:'center'},
    text:{marginLeft:4,fontSize:13,color:Colors.black2,fontFamily:'Primary-Medium'}
}), [Colors]); // Recreate styles when Colors change
};