import { AIModalSVG } from "assets/svg/AIModalSvg"
import Touchable from "components/common/Touchable"
import { useTheme } from "context"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Text } from "react-native"
import { StyleSheet, View } from "react-native"
import { SvgXml } from "react-native-svg"

export default ({type="ask",title="Ask AI",chatStarted=false,selectedIndex=-1,onNewChat=()=>{},onDrawer=()=>{}})=>{
    const router=useRouter()
    const styles = useStyles()
    const { Colors } = useTheme()

    const onClose=()=>router.back()
    return (
        <View style={[styles.header1]}>
          <View style={styles.leftContainer}>
            {type=="ask"&&chatStarted &&selectedIndex==0&& (
              <Touchable
                onPress={onNewChat}
                style={{ padding: 4, marginLeft: 12 }}
              >
                <SvgXml xml={AIModalSVG.newChat?.replace('#1C1B1F',Colors.askClose)} />
              </Touchable>
            )}
            <Touchable onPress={onClose} style={{ padding: 4, marginLeft: 12 }}>
              <SvgXml xml={AIModalSVG.close?.replace("#1C1B1F",Colors.askClose)} />
            </Touchable>
          </View>
          <Text style={styles.headerText}>{title}</Text>
          {/* <SegmentedControl
            values={["Ask", "Create"]}
            selectedIndex={selectedIndex}
            style={{width:132,height:32}}
            onChange={(event) => handleSegmentChange(event.nativeEvent.selectedSegmentIndex)}
          /> */}
          {(type=="ask"&&selectedIndex==0)?<Touchable
            onPress={onDrawer}
            style={styles.rightContainer}
          >
            <SvgXml xml={AIModalSVG.history?.replace('#1C1B1F',Colors.askClose)} />
            {/* <Text style={{fontFamily:'Primary',color:'#222',fontSize:14,marginLeft:8}}>History</Text> */}
          </Touchable>:<View style={{width: "25%"}}/>}
        </View>
    )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
header1: {
  height: 53,
  paddingHorizontal: 16,
  flexDirection: "row-reverse",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  borderBottomColor: Colors.border
},
leftContainer:{
    flexDirection: "row",
    alignItems: "center",
    width: "25%",
    justifyContent: "flex-end",
  },
  headerText: { fontFamily: "Primary-Semibold", fontSize: 16, color:Colors.blackWithOpacity(1),width:'50%',textAlign:'center' },
  rightContainer:{
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    width: "25%",
  }
}), [Colors]); // Recreate styles when Colors change
};