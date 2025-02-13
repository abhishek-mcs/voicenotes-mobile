import { AIModalSVG } from "assets/svg/AIModalSvg"
import { commonSvg } from "assets/svg/commonSvg"
import Touchable from "components/common/Touchable"
import { useTheme } from "context"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Text } from "react-native"
import { StyleSheet, View } from "react-native"
import { SvgXml } from "react-native-svg"
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { isIOS } from "utils/common"

export default ({type="ask",title="Ask AI",chatStarted=false,selectedIndex=0,onNewChat=()=>{},onDrawer=()=>{},handleSegmentChange=(v:any)=>{}})=>{
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
                <SvgXml xml={AIModalSVG.newChat?.replace('black',Colors.askClose)} />
              </Touchable>
            )}
            <Touchable onPress={onClose} style={{ padding: 4, marginLeft: 12 }}>
              <SvgXml xml={AIModalSVG.close?.replace("#1C1B1F",Colors.askClose)} />
            </Touchable>
          </View>
          {/* <Text style={styles.headerText}>{title}</Text> */}
          <SegmentedControl
            tintColor={Colors.bgColor8}
            activeFontStyle={{color:Colors.text}}
            fontStyle={{color:Colors.text}}
            values={["Ask", "Create"]}
            selectedIndex={selectedIndex}
            style={{width:132,height:32,...(isIOS?{}:{backgroundColor:Colors.bgColor9})}}
            onChange={(event) => handleSegmentChange(event.nativeEvent.selectedSegmentIndex)}
          />
          {(type=="ask"&&selectedIndex==0)?<Touchable
            onPress={onDrawer}
            style={styles.rightContainer}
          >
            <SvgXml xml={AIModalSVG.history?.replace('#1C1B1F',Colors.askClose)} />
            {/* <Text style={{fontFamily:'Primary',color:'#222',fontSize:14,marginLeft:8}}>History</Text> */}
          </Touchable>:type=="notes"?<Touchable
            onPress={onNewChat}
            style={styles.rightContainer}
          >
            <SvgXml xml={commonSvg.back1?.replace('black',Colors.askClose)} />
            {/* <Text style={{fontFamily:'Primary',color:'#222',fontSize:14,marginLeft:8}}>History</Text> */}
          </Touchable>:
          <View style={{width: "25%"}}/>}
          
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
  borderBottomColor: Colors.border,
  backgroundColor: Colors.bgColor8,
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