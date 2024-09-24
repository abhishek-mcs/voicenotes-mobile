import { useNavigation } from "@react-navigation/native";
import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Animated, Image, Keyboard, LayoutAnimation, StyleSheet, Text, View } from "react-native";
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

export default ({isLogged=true,isOffline,streaksRef,streaks,scrollY,hideBgColor=false}:any) => {
  const router:any=useNavigation()
  const {token,userDetails}:any=useSelector((state:RootState)=>state?.userDetails)
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);

  const dispatch=useDispatch()
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
    streaksRef.current?.toggle()
  };
  const openDrawer=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    router?.openDrawer()
  }

  const headerHeight=105
  const minHeaderHeight=40
  const titleFontSize=36
  const titleMinFontSize=16
  const translateY=32
  const headerHeightAnimate = scrollY?.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [headerHeight, minHeaderHeight],
    extrapolate: 'clamp',
  });
  const fontSizeAnimate = scrollY?.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [titleFontSize, titleMinFontSize],
    extrapolate: 'clamp',
  });
  const titleTranslateY = scrollY?.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [-16, -translateY],
    extrapolate: 'clamp',
  });
  
  const isBeliever=(userDetails?.subscription_status||isTempIAPPurchased)
  return (
    <Animated.View style={{height:headerHeightAnimate}}>
    <View style={{marginTop:isBeliever?0:12,marginBottom:8}} onTouchStart={()=>Keyboard.dismiss()}>
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
        <View style={{  justifyContent: "center" }}>
     {isLogged?
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}} onTouchStart={(e)=>e?.stopPropagation()}>
        {/* upgrade button */}
        {!isBeliever&&
        <Touchable onPress={()=>route.navigate("/premium/")} style={{flexDirection:'row',alignItems:'center',height:32,backgroundColor:Colors.green3WithOpacity(0.1),paddingHorizontal:12,justifyContent:'center',marginRight:2,borderRadius:8}}>
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
    </View>
    <Animated.Text style={{fontFamily:'Primary-Semibold',fontSize:fontSizeAnimate,color:hideBgColor?'transparent':'#0D0D0D',transform:[{translateY:titleTranslateY}]}}>
      Voicenotes
    </Animated.Text>
    </Animated.View>
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
  streak:{padding:12,alignItems:'center',marginTop:2}
});
