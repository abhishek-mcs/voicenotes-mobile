import { useNavigation } from "@react-navigation/native";
import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Image, Keyboard, LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import {router as route} from "expo-router"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS, isIOSSmall } from "utils/common";
import { useGetUserData, useStreak } from "queries/home";
import Streaks from "components/streaks";
import formatBigNumber from "utils/formatBigNumber";
import { useEffect, useMemo, useState } from "react";
import * as Haptics from 'expo-haptics';
import { iapSvg } from "assets/svg/iapSvg";
import { commonSvg } from "assets/svg/commonSvg";
import { MAIN_URL } from "services/api/api-constants";
import { setCanRecord, setLang, setUserDetail } from "redux/reducers/userDetails";
import { languages } from "utils/constants/languages";

export default ({isLogged=true,isOffline}:any) => {
  const router:any=useNavigation()
  const {token,userDetails}:any=useSelector((state:RootState)=>state?.userDetails)
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
  const [streakVisible,setStreakVisible]=useState(false)

  const dispatch=useDispatch()
  const streaks=useStreak(token)
  const data=useGetUserData(token);
  const photo_url=data?.data?.data?.photo_url||null;

  useEffect(() => {
    if(!!token&&data?.data?.data){
      dispatch(setUserDetail(data?.data?.data))
      data?.data?.data?.settings?.language&& dispatch(setLang(languages[data?.data?.data?.settings?.language]))
      dispatch(setCanRecord(data?.data?.data?.can_record_more??true))
    }
  }, [data?.data?.data]);

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
    <View>
    <View style={{marginTop:isBeliever?0:12,height: streakVisible?'auto':30,marginBottom:8}} onTouchStart={()=>Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* drawer button */}
       <View style={{flexDirection:'row',alignSelf:'center'}}>
       {/* {token&&
       <Touchable style={styles.drawer} onPress={openDrawer} >
          <SvgXml xml={home.drawer} />
        </Touchable>} */}
        </View>
        {/* offline mode */}
        {/* {isOffline&&<View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginLeft:-10,marginTop:-10}}>
          <SvgXml xml={home.offline} style={{marginRight:8}}/>
          <Text style={{color:Colors.primary,fontFamily:'Primary-Medium',fontSize:12}}>️Offline mode</Text>
        </View>} */}
        <View style={{  justifyContent: "flex-start" }}>
     {isLogged?
        <View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'center',marginTop:-12,marginRight:-4}} onTouchStart={(e)=>e?.stopPropagation()}>
        {/* upgrade button */}
        {!isBeliever&&
        <Touchable onPress={()=>route.navigate("/premium/")} style={{flexDirection:'row',alignItems:'center',height:32,backgroundColor:Colors.green3WithOpacity(0.1),paddingHorizontal:12,justifyContent:'center',marginRight:2,borderRadius:8,marginTop:-6}}>
          <SvgXml xml={iapSvg.thunder} />
          <Text style={{color:Colors.green3WithOpacity(1),fontFamily:'Primary-Semibold',fontSize:14,marginLeft:6,lineHeight:16}}>Upgrade</Text>
        </Touchable>}
        {/* streak indicator */}
        <Touchable onPress={toggleStreaks} style={styles.streak} activeOpacity={0.6}>
          <SvgXml xml={home.streak?.replace('>0<',`>${formatBigNumber(streaks?.data?.data?.current_streak)??0}<`)}/>
        </Touchable>
        <Touchable style={{padding:8,marginTop:1}} onPress={()=>route.navigate("/settings/")}>
          {!!photo_url?
          <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:30}}/>
          :<SvgXml xml={commonSvg.profileIcon}/>}
        </Touchable>
        </View>
        :<View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-end'}}>
        {/* signup and login button */}
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
        {/* streak modal */}
        <Streaks data={streaks?.data?.data||[]} visible={streakVisible}/>
    </View>
    <Text style={{fontFamily:'Primary-Semibold',fontSize:36,color:'#0D0D0D',marginBottom:11}}>Voicenotes</Text>
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
  streak:{padding:12,alignItems:'center'}
});
