import Colors from "assets/Colors";
import { CreateModalSvg } from "assets/svg/CreateModal";
import { home } from "assets/svg/home";
import { StyleSheet, Text, TouchableHighlight } from "react-native"
import { View } from "react-native"
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

export default ({onPress=(v:string)=>{}})=>{
    return (
        <View>
          <View style={[styles.row,styles.btw]}>
              <Text style={styles.title}>What do you want to create?</Text>
              {/* <Touchable onPress={()=>setVisible(false)} style={{marginTop:12,marginRight:8}}>
                  <SvgXml xml={AIModalSVG.close}/>
              </Touchable> */}
          </View>
          <View style={styles.row}>
              <Btns onPress={onPress} type="summary" title="Summary" icon={CreateModalSvg.summary} />
              <Btns onPress={onPress} type="points" title="List main points" icon={CreateModalSvg.points} />
              <Btns onPress={onPress} type="todo" title="To-do list" icon={CreateModalSvg.todo} />
              <Btns onPress={onPress} type="blog" title="Blog post" icon={CreateModalSvg.blog} />
              <Btns onPress={onPress} type="tweet" title="Tweet" icon={CreateModalSvg.tweet} />
              <Btns onPress={onPress} type="email" title="Email" icon={CreateModalSvg.email} />
          </View>
        </View>)
}


const Btns = ({ onPress = (v:string) => {}, title = "", icon = "", type="" }) => (
    <TouchableHighlight style={styles.btn} onPress={()=>onPress(type)} underlayColor={Colors.darkWithOpacity(0.1)}>
      <>
        <SvgXml xml={icon} />
        <Text style={styles.btnTxt}>{title}</Text>
      </>
    </TouchableHighlight>
  );
  

const styles = StyleSheet.create({
    modal: {
      justifyContent: "center",
      backgroundColor: "#fff",
      borderRadius: 20,
      paddingBottom:24,
      paddingTop:16,
      paddingHorizontal:24,
      zIndex:10,
      elevation:10,
      shadowColor:'#000',
      shadowRadius:10,
      shadowOffset:{width:0,height:0}
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      height: 40,
      backgroundColor: Colors.darkWithOpacity(0.05),
      borderRadius: 16,
      paddingHorizontal: 12,
      marginRight:8,
      marginTop:8
    },
    btnTxt:{
      marginLeft:isIOS?4:6,
      fontSize:14,
      fontFamily:'Primary'
    },
    title:{
      fontSize:20,
      fontFamily:"Primary-Medium",
      marginBottom:24
    },
    row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap'},
    btw:{justifyContent:'space-between'}
  });