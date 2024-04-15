import React, { useEffect, useRef, useState } from "react"
import { View,  Platform, Animated,Text, StyleSheet, TouchableHighlight } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import { SvgXml } from "react-native-svg"
import { SafeAreaView } from "react-native"
import { LandingSvg } from "assets/svg/LandingSvg"
import Colors from "assets/Colors"
import { MAIN_URL } from "services/api/api-constants"
import * as AuthSession from 'expo-auth-session';
import { API_URL } from 'services/api/api-constants';
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession()

export default () => {
  const router=useRouter()
  const [loginError, setLoginError] = useState()

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
const clientId= '364915655162-e0bq980v7askj6mu61pqp1soiv3utm5s.apps.googleusercontent.com'
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'voicenotes',
        path: '/home',
      }),
      responseType:'code',
      prompt:AuthSession.Prompt.SelectAccount,
      extraParams:{
        device:"mobile_app"
      },
    },
    {
      authorizationEndpoint: `${API_URL}/api/auth/redirect/google?device=mobile_app`,
    }
  );

  useEffect(()=>{
    console.warn(response?.type)
  },[response])
  
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
            onPress={()=>{router.push('/auth/signup/')}}
            text="Sign up"
            color="#fff"
            // logo={LandingSvg.apple}
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
            onPress={async()=>await promptAsync().catch(e=>{console.log(e)})}
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
          {`\nYou must be at least 18 years old to start a page.`}
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