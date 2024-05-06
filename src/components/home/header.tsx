import { useNavigation } from "@react-navigation/native";
import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Keyboard, LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import {router as route} from "expo-router"
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS, isIOSSmall } from "utils/common";
import { useStreak } from "queries/home";
import Streaks from "components/streaks";
import formatBigNumber from "utils/formatBigNumber";
import { useMemo, useState } from "react";
import * as Haptics from 'expo-haptics';

export default ({isLogged=true,}:any) => {
  const router:any=useNavigation()
  const {token}=useSelector((state:RootState)=>state?.userDetails)
  const [streakVisible,setStreakVisible]=useState(false)

  const streaks=useStreak(token)

  const toggleStreaks = async() => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStreakVisible(!streakVisible);
  };
  const openDrawer=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    router?.openDrawer()
  }
  return (
    <View style={{height: streakVisible?'auto':30}} onTouchStart={()=>Keyboard.dismiss()}>
      <View style={styles.container}>
       <View style={{flexDirection:'row',alignSelf:'center'}}>
       {token&&
       <Touchable style={styles.drawer} onPress={openDrawer} >
          <SvgXml xml={home.drawer} />
        </Touchable>}
        </View>
        {/* <SvgXml xml={home.logo} style={{ flex: 1 }} /> */}
        <View style={{  justifyContent: "flex-start" }}>

     {isLogged? 
         !!token&&streaks?.data?.data?.current_streak&&
        <View onTouchStart={(e)=>e?.stopPropagation()}>
        <Touchable onPress={toggleStreaks} style={styles.streak} activeOpacity={0.6}>
          <SvgXml xml={home.streak?.replace('>0<',`>${formatBigNumber(streaks?.data?.data?.current_streak)??0}<`)}/>
          {/* <Text style={{fontSize:9.6,fontFamily:'Primary-Bold',color:'#222'}}>{formatBigNumber(streaks?.data?.data?.current_streak)}</Text> */}
        </Touchable>
        </View>
        :<View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-end'}}>
         <Touchable
            onPress={() => {
              route.navigate("/auth/signup");
            }}
            style={{marginRight:16}}
            activeOpacity={0.6}
          ><Text style={{ color: Colors.grey, fontFamily:'Primary-Semibold',fontSize:12,paddingLeft:12,paddingVertical:8 }}>Sign up</Text>
          </Touchable>
         <Touchable
            activeOpacity={0.6}
            onPress={() => {
              route.navigate("/auth/login/loginPassword");
            }}
            style={{ alignSelf: "flex-end",backgroundColor:'#222',borderRadius:16,padding:12,paddingVertical:8,height:35 }}
          ><Text style={{ color: '#fff',fontFamily:'Primary-Semibold',fontSize:14 }}>Log in</Text>
          </Touchable>
          </View>}
        </View>
      </View>
      <Streaks data={streaks?.data?.data||[]} visible={streakVisible}/>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: isIOS ? 0 : 10,
    marginBottom:8
  },
  drawer: {
    alignSelf: "flex-start",
    padding: 16,
    paddingRight: 10,
    paddingBottom: 0,
    marginRight: 6,
    marginLeft: -16,
    marginTop: -24,
  },
  streak:{padding:12,marginTop:-12,marginRight:-12}
});
