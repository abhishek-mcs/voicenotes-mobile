import React, { useEffect, useRef, useState } from "react"
import { View,  Platform, Animated,Text, StyleSheet, TouchableHighlight, Linking } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { useRouter } from "expo-router"
import { SvgXml } from "react-native-svg"
import { SafeAreaView } from "react-native"
import { LandingSvg } from "assets/svg/LandingSvg"
import Colors from "assets/Colors"
import { androidGoogleClientID, expoClientID, iosGoogleClientID, MAIN_URL } from "services/api/api-constants"
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuth from "expo-apple-authentication";
import { signInWithApple, signInWithGoogle } from "queries/auth"
import { setAuthToken } from "services/api/axios-api"
import { setEmail, setToken, setUserDetail } from "redux/reducers/userDetails"
import { useQueryClient } from "react-query"
import { useDispatch } from "react-redux"
import { isIOS } from "utils/common"

WebBrowser.maybeCompleteAuthSession()

export default () => {
  const router=useRouter()
  const [loginError, setLoginError] = useState()
  const queryClient=useQueryClient()
  const dispatch=useDispatch()

  //Animations
  const fadeAnim = useRef(new Animated.Value(0)).current

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  const [bounceValue, setBounceValue] = useState(new Animated.Value(50))

  //Is the animated view hidden or not?
  const [isHidden, setIsHidden] = useState(true)

  //I toggle the animated slide with this method
  const toggleSlide = () => {
    let toValue = 475 //How to get dynamic height of View to animate

    if (isHidden) {
      //Here I hide (slide down) the animated View container
      toValue = 0
    }

    Animated.spring(bounceValue, {
      toValue: toValue,
      velocity: 10,
      tension: 3,
      friction: 6,
      useNativeDriver: true,
    }).start()
    setIsHidden(!isHidden)
  }

  useEffect(() => {
    toggleSlide()
    fadeIn()
  }, [])

  const onLoginSuccess=(data:any)=>{
    if(!!data?.data){
      const token = data?.data?.token
      const userData = data?.data?.user
      if (token) {
        setAuthToken(token,false);
        dispatch(setToken(token));
        dispatch(setUserDetail(userData))
        queryClient.resetQueries('all-recording')
        queryClient.resetQueries('user-data')
        router.replace("/home/");
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
  const {code,state,prompt,authuser,scope}=params
  loginGoogle.mutate({
    access_token:token,
    client_id:isIOS?iosGoogleClientID:androidGoogleClientID,
    device:'mobile_app',code,state,prompt,authuser,scope},{
    onSuccess:onLoginSuccess
  })
}
  useEffect(()=>{
    if (googleResponse?.type === "success") {
      signInGoogle(googleResponse?.params.id_token,googleResponse?.params)
    }
  },[googleResponse])

  const onGoogleLogin=async()=>{
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
    loginApple.mutate({access_token:token},{
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
    <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
    <View
      style={{paddingVertical:32,paddingHorizontal:24,backgroundColor:'#fff',flex:1,justifyContent:'space-between'}}
    >
      <View>
      <SvgXml xml={LandingSvg.logo} />
      <Text style={{fontSize:48,fontFamily:'Primary-Medium',color:'#000',marginTop:20}}>
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
          style={styles.button}
          onPress={() => {}}
        ><Text style={styles.text}>Sign up</Text></TouchableOpacity> */}
        {(Platform.OS === "ios" || Platform.OS === "macos") && (
          <Btn
            underlayColor={Colors.grey2WithOpacity(0.8)}
            style={styles.button}
            onPress={signInAppleAsync}
            text="Continue with Apple"
            color="#fff"
            logo={LandingSvg.apple}
            />
        )}
          <Btn
            underlayColor={Colors.grey2WithOpacity(0.3)}
            style={styles.button2}
            onPress={()=>{router.push('/auth/login/loginPassword')}}
            text="Continue with Email"
            logo={LandingSvg.email}/>
          <Btn
            underlayColor={Colors.grey2WithOpacity(0.3)}
            style={styles.button2}
            onPress={onGoogleLogin}
            text="Continue with Google"
            logo={LandingSvg.google}/>
        {loginError && <Text style={{marginTop:8,color:'red'}}>{loginError}</Text>}

        {/* <View style={{flexDirection:'row',marginTop:24,marginBottom:16,justifyContent:'center'}}>
          <Pressable
            // onPress={() => router.push('/auth/login')}
          >
            <Text style={{fontWeight:'bold',fontFamily:'Primary-Bold',fontSize:16,height:32,color:'#222'}}>
              <Text style={{color:'#222'}}>Already have an account?</Text>

              <Text style={{color : "#1A0FAB"}}> Log in</Text>
              </Text>
          </Pressable>
        </View> */}
        <Text style={{fontFamily:'Primary',fontSize:12,color:'#222',textAlign:'center',marginTop:16}}>
          {`By signing up, you agree to our `}
          <Text onPress={()=>{}} style={[{fontFamily:'Primary',fontSize:12}]} >terms</Text>
          {` and `}
          <Text onPress={()=>WebBrowser.openBrowserAsync(MAIN_URL+"/privacy-policy")} style={[{fontFamily:'Primary',fontSize:12,color : "#1A0FAB"}]}>privacy policy</Text>
          {`.`}
        </Text>
      </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const Btn=({text,onPress,style,underlayColor,logo,color}:Props)=>(
  <TouchableHighlight
  underlayColor={underlayColor}
  style={style}
  onPress={onPress}>
    <>
      {logo&&<SvgXml xml={logo} style={{marginRight:8}}/>}
      <Text style={[styles.text,color?{color}:{}]}>{text}</Text>
    </>
</TouchableHighlight>
)

const styles=StyleSheet.create({
    text:{fontFamily:'Primary-Semibold',fontSize:16,color:Colors.grey2WithOpacity(1)},
    button:{backgroundColor:Colors.grey2WithOpacity(1),height:48,justifyContent:'center',alignItems:'center',borderRadius:16,flexDirection:'row'},
    button2:{marginTop:12,backgroundColor:Colors.grey2WithOpacity(0.1),borderRadius:16,height:48,justifyContent:'center',alignItems:'center',flexDirection:'row'}
})

interface Props{
  text:string
  onPress:()=>void
  style:object
  underlayColor:string
  logo?:any
  color?:string
}