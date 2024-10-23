import Colors from "assets/Colors";
import { Text } from "react-native";
import { StyleSheet, TouchableHighlight, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

 export default ({
    onPress = (v:any) => {},
    icon,
    title = "Ask",
    bgColor = Colors.darkWithOpacity(0.05),
    color = Colors.blackWithOpacity(1),
    underlayColor = Colors.blackWithOpacity(0.1),
    style={},
  }:BtnProps) => (
    <TouchableHighlight
      onPress={onPress}
      style={[tabItem, { backgroundColor: bgColor },style]}
      underlayColor={underlayColor}
    >
      <>
        {!!icon&&<SvgXml xml={icon} style={[!!title?{marginRight:isIOS?4:6}:{}]}/>}
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
      height: 44,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      backgroundColor: Colors.darkWithOpacity(0.05),
      overflow: "hidden",
    },
    tabItemText: {
      fontFamily: "Primary-Semibold",
      fontSize: 14,
      color: Colors.blackWithOpacity(1),
      fontWeight: "700",
      lineHeight:17
    },
  });