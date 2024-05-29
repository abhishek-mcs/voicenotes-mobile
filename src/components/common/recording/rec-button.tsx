import { Text } from "react-native";
import { StyleSheet, TouchableHighlight, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

 export default ({
    onPress = () => {},
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
        {icon&&<SvgXml xml={icon} style={{marginRight:isIOS?4:6}}/>}
        <Text style={[tabItemText, { color }]}>{title}</Text>
      </>
    </TouchableHighlight>
  );

interface BtnProps{
    onPress: () => void,
    icon?: string,
    title: string,
    bgColor?: string,
    color?: string,
    underlayColor?: string,
    style?:ViewStyle
}



const {tabItem,tabItemText} = StyleSheet.create({
    tabItem: {
      height: 40,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      backgroundColor: "#2222220D",
      overflow: "hidden",
    },
    tabItemText: {
      fontFamily: "Primary-Semibold",
      fontSize: 14,
      color: "#000",
      fontWeight: "700",
      lineHeight:17
    },
  });