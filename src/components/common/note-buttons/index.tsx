import Colors from "assets/Colors"
import { home } from "assets/svg/home"
import { Text } from "react-native"
import { View } from "react-native"
import { StyleSheet } from "react-native"
import { TouchableHighlight } from "react-native"
import { SvgXml } from "react-native-svg"
import { isIOS } from "utils/common"

export default ({hashFilter='',onPress=()=>{},icon=home.more,text='',disabled=false,style={}})=>{
    return (
        <TouchableHighlight style={[styles.main,style]} onPress={onPress} underlayColor={Colors.darkWithOpacity(0.05)} disabled={disabled}>
            <View style={styles.row}>
                <SvgXml xml={icon} />
                <Text style={styles.text}>{text}</Text>
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    main:{
        height:32,justifyContent:'center',
        paddingHorizontal:10,
        borderRadius:12,
        backgroundColor:Colors.whiteWithOpacity(1),
        marginHorizontal:5,
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