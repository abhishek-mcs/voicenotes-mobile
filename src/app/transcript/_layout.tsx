import { AIModalSVG } from "assets/svg/AIModalSvg";
import { useTheme } from "context";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native";
import { SvgXml } from "react-native-svg";

export default function Layout() {
  const {Colors} = useTheme()
  const styles = useStyles()

  return (
    <Stack screenOptions={{
      headerStyle:styles.header1,
      headerShown:false
    }}>
      {/* First Modal Screen */}
      <Stack.Screen
        name="index"
      />

      {/* Nested Screens in Modal */}
      <Stack.Screen
        name="TranscriptAskAI"
        options={{
          title: "Ask AI",
          animation: "slide_from_right",
        }}
      />
  </Stack>
  );
}


const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
header1: {
  backgroundColor: Colors.bgColor8,
},
  headerText: { fontFamily: "Primary-Semibold", fontSize: 16, color:Colors.blackWithOpacity(1),width:'50%',textAlign:'center' },
  rightContainer:{ padding:4 }
}), [Colors]); // Recreate styles when Colors change
};