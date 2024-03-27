import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { Modalize } from "react-native-modalize";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ReactNativeModal from "react-native-modal";
import Touchable from "components/common/Touchable";
import { AIModalSVG } from "assets/svg/AIModalSvg";

export default forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  useImperativeHandle(
    ref,
    () => {
      return {
        open() {
          setVisible(true);
        },
        close() {
          setVisible(false);
        },
      };
    },
    []
  );
  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      onBackdropPress={() => setVisible(false)}
      style={{justifyContent:'flex-end',bottom:130}}
      backdropOpacity={0.1}
    >
      <View style={styles.modal}>
        <View style={[styles.row,styles.btw]}>
            <Text style={styles.title}>What do you want to create?</Text>
            <Touchable onPress={()=>setVisible(false)} style={{marginTop:12,marginRight:8}}>
                <SvgXml xml={AIModalSVG.close}/>
            </Touchable>
        </View>
        <View style={styles.row}>
            <Btns title="Summary" icon={home.create} />
            <Btns title="List main points" icon={home.create} />
            <Btns title="To-do list" icon={home.create} />
            <Btns title="Blog post" icon={home.create} />
            <Btns title="Tweet" icon={home.create} />
            <Btns title="Email" icon={home.create} />
        </View>
      </View>
    </ReactNativeModal>
  );
});

const Btns = ({ onPress = () => {}, title = "", icon = "" }) => (
  <TouchableHighlight style={styles.btn} onPress={onPress} underlayColor={Colors.darkWithOpacity(0.1)}>
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
    paddingLeft:16,
    paddingBottom:20,paddingRight:8,
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
    marginLeft:4,
    fontSize:14,
    fontFamily:'Primary'
  },
  title:{
    fontSize:16,
    fontFamily:"Primary",
    marginBottom:9,
    marginTop:17
  },
  row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap'},
  btw:{justifyContent:'space-between'}
});
