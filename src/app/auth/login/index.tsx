/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from "react"
import { InteractionManager, View, Text, TextInput, Pressable, KeyboardAvoidingView,ActivityIndicator } from "react-native"
import { validateEmail } from "utils/api-queries/auth/signin-mutations"
import { useRouter } from "expo-router"
import { TextField } from "components/common/text-field"
import { useDispatch } from "react-redux"
import { setEmail } from "redux/reducers/userDetails"
import Colors from "assets/Colors"
import Touchable from "components/common/Touchable"
import { SvgXml } from "react-native-svg"
import { commonSvg } from "assets/svg/commonSvg"
import { isIOS } from "utils/common"
import { useCheckEmail } from "queries/auth"
import { analytics } from "../../../../firebaseConfig"


export default ()=> {
  const router=useRouter()
  const [emailText, setEmailText]:any = useState('')
  const [emailError, setEmailError]:any = useState('')
  const [captchaError, setCaptchaError]:any = useState('')
  const [validationError, setValidationError]:any = useState(false)
  const checkEmailMutation:any = useCheckEmail()
  const dispatch = useDispatch()

  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Must run after animations for keyboard to automatically open
    InteractionManager.runAfterInteractions(() => {
      if (inputRef?.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 1500);
      }
    })
  }, [inputRef])

  const continueClicked = () => {
    setEmailError(null)
    setCaptchaError(null)
    if (!validateEmail(emailText) || emailText === "") {
      setValidationError(true)
    } else {
      setValidationError(false)
      dispatch(setEmail(emailText))
      checkEmailMutation.mutate(
        { email: emailText },
        {
          onSuccess: async (response:any) => {
            if (response.data?.exists) {
              router?.push("/auth/login/loginPassword")
            }else{
              setEmailError("There is no account with the given email address.")
            }
          },
          onError: (error:any) => {
            console.log('clicked2')
            console.warn(error?.response?.data,'s')
            for (const er in error.response.data.errors) {
              if (er == "email") {
                setEmailError(error.response.data.errors[er][0])
              } 
              return
            }
          },
        },
      )
    }
  }

  return (
    <KeyboardAvoidingView 
    behavior="padding"
    style={{flex:1,paddingHorizontal:24,backgroundColor: "#f4f6f6",paddingTop:150,justifyContent:'space-between'}}>
        <Touchable onPress={()=>{router.back()}} style={{position:'absolute',flexDirection:'row',alignItems:'center',top:isIOS?54:54,padding:16}}>
          <SvgXml xml={commonSvg.back1}/>
        </Touchable>
      <View style={{marginTop:0}}>

        <TextField
          forwardedRef={inputRef}
          style={{marginTop:0,flexDirection:'column'}}
          inputStyle={{ height: 48, borderRadius: 8,marginTop:isIOS? 8: 0,backgroundColor:'#fff'}}
          value={emailText}
          label={"Enter your email"}
          labelStyle={{color:'#222',fontFamily:'Primary-Semibold',fontSize:20,marginBottom:16}}
          returnKeyType="go"
          textContentType="emailAddress"
          onSubmitEditing={continueClicked}
          onChangeText={(text) =>{ setEmailText(text);setEmailError(null);setValidationError(false)}}
          placeholder="john@doe.com"
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />
        {validationError && (
          <Text style={{color:'red',fontFamily:'Primary',fontSize:14,marginTop:8}}>Invalid email address.</Text>
        )}
        {emailError && (
          <Text style={{marginTop:8}}>
            <Text style={{color:'red',fontFamily:'Primary',fontSize:14}}>{emailError}</Text>
            <Text
            suppressHighlighting={true}
              onPress={() => {
                analytics().logEvent('sign_up_redirected').catch(e=>{})
                router.push("/auth/signup/")
              }}
              style={{color:'red',fontSize:14,fontFamily:'Primary-Bold',textDecorationLine:'underline'}}
            >{` Sign up`}</Text>
          </Text>
        )}
        {captchaError && (
          <Text style={{color:'red',fontFamily:'Primary',fontSize:14,marginTop:4}}>{captchaError}</Text>
        )}
      </View>

      {/* <View style={{flex:1}} /> */}
      <Pressable
        testID="signInPasswordBtn"
        style={{
          alignSelf: "center",
          backgroundColor: Colors.primary,
          marginBottom: 36,
          marginTop: 24,
          paddingVertical: 16,
          borderRadius: 8,
          width: "100%",
          alignItems: "center",
        }}
        onPress={continueClicked}
      >
        {checkEmailMutation.isLoading?
        <ActivityIndicator size={17} color={"#fff"}/>
        :
        <Text
          style={{
            fontFamily: "Primary-Bold",
            fontSize: 14,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Continue
        </Text>
        }
      </Pressable>
      {/* <Recaptcha
        ref={recaptcha}
        siteKey="6LdtjRkgAAAAAB-kYeIXk8208HEcMbrvzZj83oDS"
        baseUrl="https://www.buymeacoffee.com"
        onVerify={onVerify}
        onExpire={onExpire}
        size="invisible"
        style={{ height: 0, width: 0 }}
      /> */}
    </KeyboardAvoidingView>
  )
}
