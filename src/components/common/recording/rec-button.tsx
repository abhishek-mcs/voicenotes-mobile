import { Text } from "react-native";
import { StyleSheet, TouchableHighlight, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

 export default ({
    onPress = (v:any) => {},
    icon,
    title = "Ask",
    bgColor = "#2222220D",
    color = "#000",
    underlayColor = "rgba(0,0,0,0.1)",
    style={},
  }:BtnProps) => (
    <TouchableHighlight
      onPress={onPress}
      style={[tabItem, { backgroundColor: bgColor },style]}
      underlayColor={underlayColor}
    >
      <>
        {!!icon&&<SvgXml xml={icon} style={[!!title?{marginRight:isIOS?4:6,marginBottom:2}:{}]}/>}
        {!!title&&<Text style={[tabItemText, { color }]}>{title}</Text>}
      </>
    </TouchableHighlight>
  );

interface BtnProps{
    onPress: (v:any) => void,
    icon?: string,
    title: string,
    bgColor?: string,
    color?: string,
    underlayColor?: string,
    style?:ViewStyle
}



const {tabItem,tabItemText} = StyleSheet.create({
    tabItem: {
      height: 50,
      borderRadius: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      backgroundColor: "#2222220D",
      overflow: "hidden",
    },
    tabItemText: {
      fontFamily: "Primary-Semibold",
      fontSize: 16,
      color: "#000",
      fontWeight: "700",
      lineHeight:17
    },
  });