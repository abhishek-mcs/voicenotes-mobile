import React, { useEffect, useRef, useState } from "react"
import { View, Pressable, Platform, Animated,Text, TouchableOpacity,StyleSheet } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { useRouter } from "expo-router"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { decrement, increment, incrementByAmount } from "redux/reducers/hashSlice"

const bmclogo = require("assets/images/bmclogo.png")
WebBrowser.maybeCompleteAuthSession()


export default () => {
  const router=useRouter()
  const [loginError, setLoginError] = useState()

  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()

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

  return (
    <View
      style={{paddingBottom:32,paddingHorizontal:24,backgroundColor:'#fff',flex:1}}
    >
      <View style={{flex:1}} />

      <Animated.Image
        style={[
          {alignSelf:'center'},
          {
            // Bind opacity to animated value
            opacity: fadeAnim,
          },
        ]}
        source={bmclogo}
      />
      <Animated.View
        style={[
          {
            // Bind opacity to animated value
            opacity: fadeAnim,
          },
          { transform: [{ translateY: bounceValue }] },
        ]}
      >
        <View style={{marginTop:48,flexDirection:'row',alignItems:'center',paddingHorizontal:24}} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {dispatch(increment())}}
        ><Text style={styles.text}>Sign up {count}</Text></TouchableOpacity>
        <TouchableOpacity
          style={styles.button2}
          onPress={()=>{dispatch(decrement())}}
          ><Text style={styles.text}>Continue with Twitter</Text></TouchableOpacity>
        <TouchableOpacity
        style={styles.button2}
          onPress={()=>{dispatch(incrementByAmount(5))}}
        ><Text style={styles.text}>Continue with Google</Text></TouchableOpacity>
        <TouchableOpacity
        style={styles.button2}
          onPress={()=>{}}>
            <Text style={styles.text}>Continue with Facebook</Text></TouchableOpacity>
        {(Platform.OS === "ios" || Platform.OS === "macos") && (
          <TouchableOpacity
            style={styles.button2}
            onPress={()=>{}}>
                <Text style={styles.text}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        {loginError && <Text style={{marginTop:8,color:'red'}}>{loginError}</Text>}

        <View style={{flexDirection:'row',marginTop:24,marginBottom:16,justifyContent:'center'}}>
          <Pressable
            // onPress={() => router.push('/auth/login')}
          >
            <Text style={{fontWeight:'bold',fontFamily:'Primary-Bold',fontSize:16,height:32,color:'#222'}}>
              <Text style={{color:'#222'}}>Already have an account?</Text>

              <Text style={{color : "#1A0FAB"}}> Log in</Text>
              </Text>
          </Pressable>
        </View>
        <Text style={{fontFamily:'Primary',fontSize:12,color:'#222',textAlign:'center'}}>
          {`By signing up, you agree to our `}
          <Text onPress={()=>WebBrowser.openBrowserAsync("https://www.buymeacoffee.com/terms")} style={[{fontFamily:'Primary',fontSize:12,color : "#1A0FAB"}]} >terms</Text>
          {` and `}
          <Text onPress={()=>WebBrowser.openBrowserAsync("https://www.buymeacoffee.com/privacy-policy")} style={[{fontFamily:'Primary',fontSize:12,color : "#1A0FAB"}]}>privacy policy</Text>
          {`.`}
          {`\nYou must be at least 18 years old to start a page.`}
        </Text>
      </Animated.View>
    </View>
  )
}
const styles=StyleSheet.create({
    text:{fontFamily:'Primary-Bold',fontSize:14,fontWeight:'bold'},
    button:{backgroundColor:'#ffdd00',paddingVertical:12,alignItems:'center',borderRadius:50},
    button2:{marginTop:12,borderWidth:1,borderColor:'rgba(34,34,34,0.1)',borderRadius:50,paddingVertical:16,alignItems:'center'}
})