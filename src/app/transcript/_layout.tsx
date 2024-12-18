import { AIModalSVG } from "assets/svg/AIModalSvg";
import { useTheme } from "context";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { SvgXml } from "react-native-svg";

export default function Layout() {
  const {Colors} = useTheme()
  const styles = useStyles()
  const CloseIcon = () =>
    <Pressable onPress={()=>router?.back()} style={styles.rightContainer}>
      <SvgXml xml={AIModalSVG.close?.replace("#1C1B1F",Colors.askClose)} />
    </Pressable>

  return (
    <Stack screenOptions={{
      headerStyle:styles.header1,
      contentStyle:styles.borderStyle,
      headerTitleStyle:styles.headerText,
      headerBackTitleVisible:false,
      headerTintColor:Colors.text,
    }}>
      {/* First Modal Screen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Transcript",
          headerRight:()=><CloseIcon/>
        }}
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
borderStyle:{borderTopWidth:0.3,borderTopColor:Colors.border},
  headerText: { fontFamily: "Primary-Semibold", fontSize: 16, color:Colors.blackWithOpacity(1),width:'50%',textAlign:'center' },
  rightContainer:{ padding:4 }
}), [Colors]); // Recreate styles when Colors change
};