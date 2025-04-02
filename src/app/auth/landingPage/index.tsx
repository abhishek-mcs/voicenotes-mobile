import React, { useEffect, useRef, useState } from "react"
import { View,  Platform, Animated,Text, StyleSheet, TouchableHighlight, Linking, ActivityIndicator, InteractionManager, ScrollView, Pressable } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { SplashScreen, useRouter } from "expo-router"
import { SvgXml } from "react-native-svg"
import { SafeAreaView } from "react-native"
import { LandingSvg } from "assets/svg/LandingSvg"
import { androidGoogleClientID, expoClientID, iosGoogleClientID, MAIN_URL } from "services/api/api-constants"
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuth from "expo-apple-authentication";
import { signInWithApple, signInWithGoogle } from "queries/auth"
import { setAuthToken } from "services/api/axios-api"
import { setEmail, setToken, setUserDetail } from "redux/reducers/userDetails"
import { useQueryClient } from "react-query"
import { useDispatch } from "react-redux"
import { isAndroid, isIOS } from "utils/common"
import useAnimatedSlide from "hooks/anim/useAnimatedSlide"
import { analytics } from "../../../../firebaseConfig"
import { useNetInfo } from "@react-native-community/netinfo"
import { useTheme } from "context"
import { logEvent } from "func/analytics/logEvent"
import { commonSvg } from "assets/svg/commonSvg"

WebBrowser.maybeCompleteAuthSession()

const LandingPage =() => {
  const router=useRouter()
  const [loginError, setLoginError] = useState()
  const queryClient=useQueryClient()
  const dispatch=useDispatch()
  const netInfo=useNetInfo()
  const LandingSvgIcons:any=LandingSvg

  const {bounceValue,fadeAnim} = useAnimatedSlide()
  const {Colors,isLightMode}=useTheme()

  const onLoginSuccess=(data:any)=>{
    if(!!data?.data){
      const token = data?.data?.token
      const userData = data?.data?.user
      if (token) {
        setAuthToken(data?.data?.token,false,netInfo);
        dispatch(setToken(token));
        dispatch(setUserDetail(userData))
        queryClient.resetQueries('all-recording')
        queryClient.resetQueries('user-data')
        queryClient.resetQueries('all-tags')
        router.replace("/home/");
        analytics()?.logEvent('social_sign_in_success').catch(e=>{})
        logEvent('social_login',{value:'success'})
      }
    }
  }
//google login start
const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
  expoClientId: expoClientID,
  iosClientId: iosGoogleClientID,
  androidClientId: androidGoogleClientID,
  scopes: ["profile", "email"],
})
const loginGoogle=signInWithGoogle()
const signInGoogle=(token:any,params:any)=>{
  analytics()?.logEvent('google_sign_in_clicked').catch(e=>{})
  logEvent('google_sign_in_clicked',{value:'google_sign_in_initiate'})
  const {code,state,prompt,authuser,scope}=params
  loginGoogle.mutate({
    access_token:token,
    client_id:isIOS?iosGoogleClientID:androidGoogleClientID,
    source:isIOS?'ios':'android',
    device:'mobile_app',code,state,prompt,authuser,scope},{
    onSuccess:onLoginSuccess
  })
}
  useEffect(()=>{
    Linking.removeAllListeners('url')
    if (googleResponse?.type === "success") {
      signInGoogle(googleResponse?.params.id_token,googleResponse?.params)
    }
  },[googleResponse])

  const onGoogleLogin=async()=>{
   isAndroid&& Linking.addEventListener('url', (e) => {
      if(e?.url.includes('com.app.voicenotes:/0authredirect'))
        router.push("/onboarding/")
        // router.push("/auth/landingPage/")
    })
   const res= await googlePromptAsync().then(e=>{
    console.log(e)
   }).catch(e=>{
    console.log(e)
   })
  }
//google login end

//apple login start
  const loginApple = signInWithApple()

  const signInAppleAPI=(token:any)=>{
    loginApple.mutate({access_token:token,source:isIOS?'ios':'android'},{
      onSuccess:onLoginSuccess
    })
  }

  const signInAppleAsync = async () => {
    try {
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (credential.email) dispatch(setEmail(credential.email))
      signInAppleAPI(credential?.identityToken)
      analytics()?.logEvent('apple_sign_in_clicked').catch(e=>{})
      logEvent('apple_sign_in_clicked',{value:'apple_login_initiate'})
      // signed in
    } catch (e:any) {
      if (e?.code === "ERR_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }
//apple login end

  return (
    <SafeAreaView style={{flex:1,backgroundColor:Colors.whiteWithOpacity(1)}}>
       <Pressable onPress={() => router.back()} style={{ padding: 20, marginTop: isIOS?0:40 }}>
          <SvgXml xml={commonSvg.back2} />
        </Pressable>
    <View
      style={{paddingVertical:32,paddingHorizontal:24,backgroundColor:Colors.whiteWithOpacity(1),flex:1,justifyContent:'space-between'}}
    >
    <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1,justifyContent:'space-between'}}>
      <View style={{marginTop:isIOS?0:50}}>
        <View style={{borderRadius:8,height:55,width:55,overflow:'hidden'}}>
          <SvgXml xml={LandingSvg.logo}/>
        </View>
        <Text style={{fontSize:48,fontFamily:'Primary-Medium',color:Colors.blackWithOpacity(1),marginTop:20}}>
          A place to dump your thoughts.
        </Text>
      </View>
      <Animated.View
        style={[
          {
            // Bind opacity to animated value
            opacity: fadeAnim,
          },
          { transform: [{ translateY: bounceValue }] },
        ]}
      >
        <View style={{alignItems:'center'}} />
        {/* <TouchableOpacity
          style=[{style.button,{backgroundColor:Colors.grey2WithOpacity(1)}]
          onPress={() => {}}
        ><Text style={styles.text}>Sign up</Text></TouchableOpacity> */}
        {(Platform.OS === "ios" || Platform.OS === "macos") && (
          <Btn
            underlayColor={Colors.bgColor3(0.8)}
            style={[styles.button,{backgroundColor:Colors.bgColor3(1)}]}
            onPress={signInAppleAsync}
            text="Continue with Apple"
            isLoading={loginApple?.isLoading||false}
            color={Colors.text4}
            logo={LandingSvg.apple}
            />
        )}
          <Btn
            underlayColor={Colors.bgColor3(0.3)}
            style={[styles.button2,{backgroundColor:Colors.bgColor3(0.1)}]}
            onPress={()=>{router.push('/auth/login/')}}
            text="Continue with Email"
            logo={LandingSvgIcons.email?.replaceAll('#0D0D0D',Colors.text)}/>
          <Btn
            underlayColor={Colors.bgColor3(0.3)}
            style={[styles.button2,{backgroundColor:Colors.bgColor3(0.1),}]}
            onPress={onGoogleLogin}
            text="Continue with Google"
            isLoading={loginGoogle?.isLoading||false}
            logo={LandingSvg.google}/>
        {loginError && <Text style={{marginTop:8,color:Colors.redWithOpacity(1)}}>{loginError}</Text>}

        <Text style={{fontFamily:'Primary',fontSize:12,color:Colors.text1,textAlign:'center',marginTop:16}}>
          {`By signing up, you agree to our `}
          <Text onPress={()=>{}} style={[{fontFamily:'Primary',fontSize:12}]} >terms</Text>
          {` and `}
          <Text onPress={()=>WebBrowser.openBrowserAsync(MAIN_URL+"/privacy-policy",{toolbarColor:isLightMode?'#fff':'#000'})} style={[{fontFamily:'Primary',fontSize:12,color : Colors.blue}]}>privacy policy</Text>
          {`.`}
        </Text>
      </Animated.View>
    </ScrollView>
    </View>
    </SafeAreaView>
  )
}

const Btn=({text,onPress,style,underlayColor,logo,color,isLoading=false}:Props)=>{
  const {Colors}=useTheme()
  return (
  <TouchableHighlight
  underlayColor={underlayColor}
  style={style}
  onPress={onPress}>
    {!isLoading?<>
      {logo&&<SvgXml xml={logo} style={{marginRight:8}}/>}
      <Text style={[styles.text,color?{color}:{color:Colors.grey2WithOpacity(1)}]}>{text}</Text>
    </>:<ActivityIndicator size={"small"} color={Colors.text}/>}
</TouchableHighlight>
)}

const styles=StyleSheet.create({
    text:{fontFamily:'Primary-Semibold',fontSize:16},
    button:{height:48,justifyContent:'center',alignItems:'center',borderRadius:16,flexDirection:'row'},
    button2:{marginTop:12,borderRadius:16,height:48,justifyContent:'center',alignItems:'center',flexDirection:'row'}
})

interface Props{
  text:string
  onPress:()=>void
  style:object
  underlayColor:string
  logo?:any
  color?:string
  isLoading?:boolean
}

export default LandingPage