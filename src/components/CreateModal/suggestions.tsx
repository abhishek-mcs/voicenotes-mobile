import { CreateModalSvg } from "assets/svg/CreateModal";
import { TextField } from "components/common/text-field";
import Touchable from "components/common/Touchable";
import { useTheme } from "context";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native"
import { View } from "react-native"
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

const Suggestions = ({onPress=(v:string)=>{},type='summary',customText='',setCustomText=(v:string)=>{}})=>{
  const { Colors } = useTheme()
  const styles = useStyles()
    return (
        <View style={{paddingHorizontal:28,marginBottom:13}}>
          <View style={[styles.row,styles.btw]}>
              <Text style={styles.title}><Text style={{color:Colors.grey}}>1.  </Text>What do you want to create?</Text>
              {/* <Touchable onPress={()=>setVisible(false)} style={{marginTop:12,marginRight:8}}>
                  <SvgXml xml={AIModalSVG.close}/>
              </Touchable> */}
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="summary" title="Summary" icon={CreateModalSvg.summary} selected={type=='summary'}/>
              <Btns onPress={onPress} type="meeting-report" title="Meeting report" icon={CreateModalSvg.points} selected={type=='meeting-report'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="points" title="List points" icon={CreateModalSvg.points} selected={type=='points'}/>
              <Btns onPress={onPress} type="todo" title="To-do list" icon={CreateModalSvg.todo} selected={type=='todo'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="tweet" title="Tweet" icon={CreateModalSvg.tweet} selected={type=='tweet'}/>
              <Btns onPress={onPress} type="email" title="Email" icon={CreateModalSvg.email} selected={type=='email'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="blog" title="Blog post" icon={CreateModalSvg.blog} selected={type=='blog'}/>
              <Btns onPress={onPress} type="tidy" title="Cleanup" icon={CreateModalSvg.cleanup} selected={type=='tidy'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="custom" title="+ Custom" selected={type=='custom'} />
          </View>
        {type=='custom'&&
        <TextField
          style={{marginTop:0,flexDirection:'column'}}
          inputStyle={{ height: 42, color:Colors.text, borderRadius: 16,marginTop:isIOS? 8: 0,backgroundColor:Colors.inputBg3,marginLeft:0}}
          value={customText}
          labelStyle={{color:Colors.text5,fontFamily:'Primary-Semibold',fontSize:16,marginBottom:13}}
          onChangeText={(t:string)=>setCustomText(t)}
          placeholder="Enter your instructions here..."
          placeholderTextColor={Colors.grey}
          autoCapitalize="none"
        />}
        </View>)
}


const Btns = ({ onPress = (v:string) => {}, title = "", icon = "", type="",selected=false ,style={}}) => {
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()
  const regex = `${Colors.text12}`
  return(
    <Touchable style={[styles.btn,style,selected?styles.selected:{}]} onPress={()=>onPress(type)} activeOpacity={0.8}>
        {icon&&<SvgXml xml={isLightMode?icon?.replace(/#000/g,selected?Colors.text12:Colors.text):icon?.replace(/#000/g,selected?Colors.text12:Colors.text)} />}
        <Text style={[styles.btnTxt,selected?styles.selected1:{}]}>{title}</Text>
    </Touchable>
  )}
  

  const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      height: 32,
      backgroundColor: Colors.bottomBarButtonBg1,
      borderRadius: 12,
      width:'47%',
      // paddingHorizontal: 12,
      marginTop:12
    },
    btnTxt:{
      marginLeft:isIOS?8:6,
      fontSize:13,
      fontFamily:'Primary-Medium',
      color:Colors.text
    },
    title:{
      fontSize:14,
      fontFamily:"Primary-Semibold",
      marginBottom:32,
      color:Colors.black2,
      marginLeft:-14
    },
    row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',justifyContent:'space-between'},
    btw:{justifyContent:'space-between',marginTop:20},
    selected:{backgroundColor:Colors.primaryDark},
    selected1:{color:Colors.text12}
  }), [Colors]); // Recreate styles when Colors change
};

export default Suggestions