import { StyleSheet, Text, View } from "react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import ReactNativeModal from "react-native-modal";
import AiLoader from "components/common/loaders/ai-loader";
import { useCreate } from "queries/home";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

export default forwardRef(({data=[]}:Props, ref) => {
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
        toggle() {
          setVisible(!visible)
        }
      };
    },
    [visible]
  );
  
  
  const onClose=()=>{
    
  }

  return (
    <ReactNativeModal
      isVisible={true}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      onBackdropPress={onClose}
      style={{justifyContent:'flex-end',bottom:64}}
      backdropOpacity={0.005}
      hasBackdrop={false}
      coverScreen={false}
      onTouchStart={(e)=>e?.stopPropagation()}
    > 
      <View style={[styles.modal]}>
        
      </View>
    </ReactNativeModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    // justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingBottom:24,
    paddingTop:24,
    paddingHorizontal:24,
    shadowColor:"#00000026",
		shadowOpacity: 0.9,
		shadowOffset: { width: 0, height:0.5 },
		shadowRadius: 1.5,
    zIndex:10,
		elevation: 2,
    height:'45%'
  },
  heading:{
      fontSize:20,
      fontFamily:"Primary-Medium",
      marginBottom:8,
      paddingHorizontal:0
  },
  suggestions:{height:'auto',paddingTop:16},
  records:{},
  note:{paddingHorizontal:0,paddingTop:16},
  loader:{justifyContent:'flex-start',paddingTop:36,paddingLeft:28}
});

interface Props{
    data:any[]
}