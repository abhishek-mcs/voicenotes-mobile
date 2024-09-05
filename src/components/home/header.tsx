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
import { iapSvg } from "assets/svg/iapSvg";

export default ({isLogged=true,isOffline}:any) => {
  const router:any=useNavigation()
  const {token,userDetails}:any=useSelector((state:RootState)=>state?.userDetails)
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
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
  const isBeliever=(userDetails?.subscription_status||isTempIAPPurchased)
  return (
    <View style={{height: streakVisible?'auto':30,marginBottom:isBeliever?0:8}} onTouchStart={()=>Keyboard.dismiss()}>
      <View style={styles.container}>
       <View style={{flexDirection:'row',alignSelf:'center'}}>
       {token&&
       <Touchable style={styles.drawer} onPress={openDrawer} >
          <SvgXml xml={home.drawer} />
        </Touchable>}
        </View>
        {isOffline&&<View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginLeft:-10,marginTop:-10}}>
          <SvgXml xml={home.offline} style={{marginRight:8}}/>
          <Text style={{color:Colors.primary,fontFamily:'Primary-Medium',fontSize:12}}>️Offline mode</Text>
        </View>}
        <View style={{  justifyContent: "flex-start" }}>
     {isLogged?
        <View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'center'}} onTouchStart={(e)=>e?.stopPropagation()}>

        {!isBeliever&&
        <Touchable onPress={()=>route.navigate("/premium/")} style={{flexDirection:'row',alignItems:'center',height:32,backgroundColor:Colors.green3WithOpacity(0.1),paddingHorizontal:12,justifyContent:'center',marginRight:2,borderRadius:8,marginTop:-6}}>
          <SvgXml xml={iapSvg.thunder} />
          <Text style={{color:Colors.green3WithOpacity(1),fontFamily:'Primary-Semibold',fontSize:14,marginLeft:6,lineHeight:16}}>Upgrade</Text>
        </Touchable>}
        <Touchable onPress={toggleStreaks} style={styles.streak} activeOpacity={0.6}>
          <SvgXml xml={home.streak?.replace('>0<',`>${formatBigNumber(streaks?.data?.data?.current_streak)??0}<`)}/>
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
