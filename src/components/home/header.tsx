import { useNavigation } from "@react-navigation/native";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Animated, Image, Keyboard, LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import {router as route} from "expo-router"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import { useGetUserData } from "queries/home";
import formatBigNumber from "utils/formatBigNumber";
import { useEffect, useMemo } from "react";
import * as Haptics from 'expo-haptics';
import { iapSvg } from "assets/svg/iapSvg";
import { commonSvg } from "assets/svg/commonSvg";
import { setCanRecord, setLang, setUserDetail } from "redux/reducers/userDetails";
import { languages } from "utils/constants/languages";
import { useTheme } from "context";
import { setSelectedScreen } from "redux/reducers/onboardingData";

const Header = ({isLogged=true,isOffline,streaksRef,streaks,scrollY,hideBgColor=false,scale=1}:any) => {
  const router:any=useNavigation()
  const {token,userDetails}:any=useSelector((state:RootState)=>state?.userDetails)
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()

  const dispatch=useDispatch()
  const data=useGetUserData(token);
  const photo_url=data?.data?.data?.photo_url||null;

  useEffect(() => {
    dispatch(setSelectedScreen(18))
  },[])

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
  const openSettings=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    route.navigate("/settings/")
  }

  const isBeliever=(userDetails?.subscription_status||isTempIAPPurchased)
  const headerHeight=90
  const minHeaderHeight=40
  const titleFontSize=36
  const titleMinFontSize=24
  const translateY=isBeliever?48:52
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
    outputRange: [isBeliever?-16:-20, -translateY],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View style={{height:headerHeightAnimate,transform:[{scaleY:scale}],opacity:scale}}>
    <View style={{marginTop:isBeliever?0:6,marginBottom:8}} onTouchStart={()=>Keyboard.dismiss()}>
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
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
        {/* upgrade button */}
        {!isBeliever&&
        <Touchable onPress={()=>route.navigate(userDetails.is_new_user ? "/premium/" : "/onboarding/")} style={{flexDirection:'row',alignItems:'center',height:32,backgroundColor:Colors.upgradeBtn,paddingHorizontal:12,justifyContent:'center',marginRight:2,borderRadius:8}}>
          <SvgXml xml={iapSvg.thunder?.replace(/#0E3934/g,Colors.primaryDark)} />
          <Text style={{color:Colors.primaryDark,fontFamily:'Primary-Semibold',fontSize:14,marginLeft:6,lineHeight:16}}>Upgrade</Text>
        </Touchable>}
        {/* streak indicator */}
        <Touchable onPress={toggleStreaks} style={styles.streak} activeOpacity={1}>
          <SvgXml xml={home.streak?.replace('>0<',`>${formatBigNumber(streaks?.data?.data?.current_streak)??0}<`)?.replace(/#717171/g,Colors.refresh)}/>
        </Touchable>
        <Touchable style={{padding:8,width:38,height:38,justifyContent:'center'}} onPress={openSettings}>
          {!!photo_url?
          <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:30,backgroundColor:Colors.bgColor3(0.1)}}/>
          :<SvgXml xml={commonSvg.profileIcon?.replace(/#274F47/g,Colors.primaryDark)}/>}
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
            style={{ alignSelf: "flex-end",backgroundColor:Colors.darkWithOpacity(1),borderRadius:16,padding:12,paddingVertical:8,height:35 }}
          ><Text style={{ color: Colors.whiteWithOpacity(1),fontFamily:'Primary-Semibold',fontSize:14 }}>Log in</Text>
          </Touchable>
          </View>}
        </View>
      </View>
    </View>
    <Animated.Text style={{alignSelf:'flex-start',fontFamily:'Primary-Semibold',fontSize:fontSizeAnimate,color:Colors.black2,transform:[{translateY:titleTranslateY}]}}>
      Voicenotes
    </Animated.Text>
    </Animated.View>
  );
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: isIOS ? 0 : 10,
    marginBottom:8,height:40
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
  streak:{padding:12,alignItems:'center',width:38,height:38,justifyContent:'center'}
}), [Colors]); // Recreate styles when Colors change
};

export default Header;