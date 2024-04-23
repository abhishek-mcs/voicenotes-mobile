import Colors from "assets/Colors";
import { CreateModalSvg } from "assets/svg/CreateModal";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { StyleSheet, Text, TouchableHighlight } from "react-native"
import { View } from "react-native"
import { SvgXml } from "react-native-svg";
import { isIOS, screenHeight } from "utils/common";

export default ({onPress=(v:string)=>{},type='summary'})=>{
    return (
        <View style={{maxHeight:screenHeight/3,paddingHorizontal:28}}>
          <View style={[styles.row,styles.btw]}>
              <Text style={styles.title}><Text style={{color:Colors.grey}}>1.  </Text>What do you want to create?</Text>
              {/* <Touchable onPress={()=>setVisible(false)} style={{marginTop:12,marginRight:8}}>
                  <SvgXml xml={AIModalSVG.close}/>
              </Touchable> */}
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="summary" title="Summary" icon={CreateModalSvg.summary} selected={type=='summary'}/>
              <Btns onPress={onPress} type="points" title="List main points" icon={CreateModalSvg.points} selected={type=='points'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="todo" title="To-do list" icon={CreateModalSvg.todo} selected={type=='todo'}/>
              <Btns onPress={onPress} type="tweet" title="Tweet" icon={CreateModalSvg.tweet} selected={type=='tweet'}/>
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="email" title="Email" icon={CreateModalSvg.email} selected={type=='email'}/>
              <Btns onPress={onPress} type="blog" title="Blog post" icon={CreateModalSvg.blog} selected={type=='blog'}/>
          </View>
        </View>)
}


const Btns = ({ onPress = (v:string) => {}, title = "", icon = "", type="",selected=false }) => (
    <Touchable style={[styles.btn,selected?styles.selected:{}]} onPress={()=>onPress(type)} activeOpacity={0.8}>
        <SvgXml xml={icon?.replace(selected?/#000001/g:/#fff/g,selected?'#fff':'#000001')} />
        <Text style={[styles.btnTxt,selected?styles.selected1:{}]}>{title}</Text>
    </Touchable>
  );
  

const styles = StyleSheet.create({
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      height: 32,
      backgroundColor: Colors.darkWithOpacity(0.05),
      borderRadius: 12,
      width:'47%',
      // paddingHorizontal: 12,
      marginTop:12
    },
    btnTxt:{
      marginLeft:isIOS?8:6,
      fontSize:13,
      fontFamily:'Primary-Medium'
    },
    title:{
      fontSize:14,
      fontFamily:"Primary-Semibold",
      marginBottom:32,
      color:'#0d0d0d',
      marginLeft:-14
    },
    row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',justifyContent:'space-between'},
    btw:{justifyContent:'space-between',marginTop:20},
    selected:{backgroundColor:Colors.primary},
    selected1:{color:'#fff'}
  });