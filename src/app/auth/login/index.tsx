/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from "react"
import { InteractionManager, Keyboard, View, Text, TextInput, Pressable } from "react-native"
import { validateEmail } from "utils/api-queries/auth/signin-mutations"
import { useMutation } from "react-query"
import axiosApi from "services/api/axios-api"
// import Recaptcha from "react-native-recaptcha-that-works"
import { useRouter } from "expo-router"
import { TextField } from "components/common/text-field"
import { useDispatch } from "react-redux"
import { setEmail } from "redux/reducers/userDetails"
import Colors from "assets/Colors"

function usecheckEmailMutation() {
  return useMutation("check_email", ({ email, captcheToken }:{email:string,captcheToken:string}) =>
    axiosApi.post("/email/login", {
      email: email,
      client_response: captcheToken,
      captcha_version: "v3",
    }),
  )
}

export default ()=> {
  const router=useRouter()
  const [emailText, setEmailText]:any = useState('')
  const [emailError, setEmailError]:any = useState('')
  const [captchaError, setCaptchaError]:any = useState('')
  const [validationError, setValidationError]:any = useState(false)
  const checkEmailMutation:any = usecheckEmailMutation()

  const dispatch = useDispatch()

  const recaptcha:any = useRef()

  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Must run after animations for keyboard to automatically open
    InteractionManager.runAfterInteractions(() => {
      if (inputRef?.current) {
        inputRef.current.focus()
      }
    })
  }, [inputRef])

  const send = () => {
    // if(__DEV__) {
    //   continueClicked("")
    // }
    // else {
    Keyboard.dismiss()
    recaptcha.current.open()
    // }
  }

  const onVerify = (token:any) => {
    // continueClicked(token)
  }

  const onExpire = () => {
    setCaptchaError("Captcha Expired")
    recaptcha.current.close()
  }

  const continueClicked = () => {
    setEmailError(null)
    setCaptchaError(null)
    if (!validateEmail(emailText) || emailText === "") {
      setValidationError(true)
    } else {
      setValidationError(false)
      dispatch(setEmail(emailText))
      checkEmailMutation.mutate(
        { email: emailText,
          // captcheToken: token
        },
        {
          onSuccess: async (response:any) => {
            if (response.data?.has_password) {
              router.push({pathname:"/auth/login/loginPassword"})
            } 
            // else if (response.data?.otp_login) {
            //   router.push("/auth/login/")
            // }
          },
          onError: (error:any) => {
            for (const er in error.response.data.errors) {
              if (er == "email") {
                setEmailError(error.response.data.errors[er][0])
              } 
              // else if (er == "client_response") {
              //   setCaptchaError(error.response.data.errors[er][0])
              // }
              return
            }
          },
        },
      )
    }
  }

  return (
    <View style={{flex:1,paddingHorizontal:24,backgroundColor:'white',justifyContent:'center',paddingVertical:200}}>
      <View style={{marginTop:24}}>
        <Text style={{alignSelf:'center',fontWeight:'bold',color:'#222',fontFamily:'Primary-Bold',fontSize:24}}>Welcome back</Text>
        <TextField
          forwardedRef={inputRef}
          style={{marginTop:36,flexDirection:'column'}}
          inputStyle={{flexWrap:'wrap',height:48,color:'#222'}}
          value={emailText}
          label={"Enter your email"}
          returnKeyType="go"
          textContentType="emailAddress"
          onSubmitEditing={continueClicked}
          onChangeText={(text) => setEmailText(text)}
          placeholder="john@doe.com"
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {validationError && (
          <Text style={{color:'red',fontFamily:'Primary',fontSize:14,marginTop:8}}>Invalid email address.</Text>
        )}
        {emailError && (
          <Text style={{marginTop:4}}>
            <Text style={{color:'red',fontFamily:'Primary',fontSize:14}}>{emailError}</Text>
            {/* <Text
              onPress={() => navigation.navigate("signup_password")}
              style={st("text-red-600 text-sm font-extrabold underline")}
              text=" Sign up "
            /> */}
          </Text>
        )}
        {captchaError && (
          <Text style={{color:'red',fontFamily:'Primary',fontSize:14,marginTop:4}}>{captchaError}</Text>
        )}
      </View>

      {/* <View style={{flex:1}} /> */}
      <Pressable
        testID="SignInEmailBtn"
        style={{backgroundColor:Colors.primary,marginTop:24,width:'100%',alignItems:'center',marginBottom:32,paddingHorizontal:32,paddingVertical:16,borderRadius:50}}
        onPress={continueClicked}
      >
        <Text style={{fontFamily:'Primary-Bold',fontSize:16,fontWeight:'bold'}}>Continue</Text>
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
    </View>
  )
}
