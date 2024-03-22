import Colors from "assets/Colors";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ReactNativeModal from "react-native-modal";
import Touchable from "components/common/Touchable";
import { AIModalSVG } from "assets/svg/AIModalSvg";
import { Skeleton } from "@rneui/themed";
import { Animated } from "react-native";
// const w=Dimensions.get("screen").width-16
export default forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [isConvo, setConvo] = useState(false);
  // const slide = [
  //   new Animated.Value(0),
  //   new Animated.Value(w)
  // ];

  // const handleSlide = (index=0) => {
  //   Animated.timing(slide[0], {
  //     toValue: index==0?400:-400,
  //     duration: 200,
  //     useNativeDriver: false,
  //   }).start(() => {
  //     slide[index==0?1:0].setValue(0); // Reset the animation value
  //   });
  // };

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
      style={{ justifyContent: "flex-end", bottom: 130 }}
      backdropOpacity={0.1}
    >
      <View style={styles.modal}>
            {!isConvo?
            <View style={{ padding: 16 }}>
              <Text style={styles.title}>Ask your notes anything</Text>
              <Text style={styles.desc}>
                We’ll show personalised prompts when you have a few recordings.
              </Text>
              <Btns
                onPress={() => setConvo(true)}
                txt="What is a summary of my recent notes?"
              />
              <Btns
                onPress={() => setConvo(true)}
                txt="Did I make any plans that are still pending?"
              />
              <Touchable onPress={() => setVisible(false)} style={styles.close}>
                <SvgXml xml={AIModalSVG.close} />
              </Touchable>
              <Skeleton animation="wave" style={styles.skeleton} />
              <Skeleton animation="wave" style={styles.skeleton} />
              {/* <View>
              <Text style={styles.subTitle}>Based on previous notes</Text>
              <Btns
                txt="Why am I feeling conflicted about my choices?"
                onPress={() => {setConvo(true)}}
              />
            </View> */}
            </View>
            : (
          <View>
            <View style={[styles.row, styles.btw, styles.convoBar]}>
              <Touchable style={styles.row} onPress={()=>setConvo(false)}>
                <SvgXml xml={AIModalSVG.back} />
                <Text style={styles.back}>Back</Text>
              </Touchable>
              <Touchable onPress={() => setVisible(false)}>
                <SvgXml xml={AIModalSVG.close} />
              </Touchable>
            </View>
            <View style={styles.convoContentContainer}>
              <View style={styles.row}>
                <SvgXml xml={AIModalSVG.ai} />
                <View>
                  <Text style={styles.you}>You</Text>
                </View>
                <Text style={[styles.text,{marginLeft:42}]}>What is a summary of my recent notes?</Text>
              </View>
              <Text style={[styles.text,{marginTop:16}]}>The notes contain a mix of Tamil and emoji characters.</Text>
            </View>
          </View>)}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                scrollEnabled={false}
                placeholder="Ask anything about your notes..."
                placeholderTextColor={Colors.grey}
                multiline
              />
              <Touchable>
                <SvgXml xml={AIModalSVG.send} />
              </Touchable>
            </View>
      </View>
    </ReactNativeModal>
  );
});

const Btns = ({ txt = "", onPress = () => {} }) => (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={Colors.darkWithOpacity(0.05)}
    style={styles.btn}
  >
    <Text style={styles.btnTxt}>{txt}</Text>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontSize: 24,
    fontFamily: "Primary-Medium",
  },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  btw: { justifyContent: "space-between" },
  close: { marginTop: 12, position: "absolute", right: 16, top: 2 },
  desc: {
    marginBottom: 16,
    marginTop: 10,
    color: Colors.darkWithOpacity(0.5),
    fontSize: 14,
    fontFamily: "Primary",
    lineHeight: 20,
  },
  btn: {
    borderWidth: 1,
    borderColor: Colors.darkWithOpacity(0.1),
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnTxt: { fontSize: 14, fontFamily: "Primary", lineHeight: 20 },
  subTitle: {
    fontSize: 12,
    fontFamily: "Primary",
    color: Colors.grey,
    marginTop: 8,
    marginBottom: 12,
  },
  skeleton: { height: 34, borderRadius: 8, opacity: 0.2, marginTop: 12 },
  input: {
    marginRight: 8,
    fontSize: 16,
    fontFamily: "Primary",
    color: Colors.darkWithOpacity(0.9),
  },
  inputContainer: {
    minHeight: 60,
    borderTopWidth: 1,
    borderTopColor: Colors.darkWithOpacity(0.1),
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  convoBar: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    borderBottomColor: Colors.darkWithOpacity(0.1),width:'100%',
    borderBottomWidth:1
  },
  back:{fontSize:16,color:Colors.darkWithOpacity(1),fontFamily:'Primary'},
  convoContentContainer:{paddingVertical:20,paddingHorizontal:24},
  you:{fontSize:14,color:Colors.grey,fontFamily:'Primary',marginLeft:12,marginBottom:2},
  text:{fontSize:14,color:Colors.darkWithOpacity(1),fontFamily:'Primary',lineHeight:24}
});
