import React, { useEffect, useRef, useState } from "react";
import { TextField } from "components/common/text-field";
import {
  Pressable,
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { setAuthToken } from "services/api/axios-api";
import { Redirect, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setEmail, setToken, setUserDetail } from "redux/reducers/userDetails";
import { SvgXml } from "react-native-svg";
import { useLogin } from "queries/auth";
import { useQueryClient } from "react-query";
import { isIOS } from "utils/common";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { commonSvg } from "assets/svg/commonSvg";
import GoogleAuthButton from "components/auth/google-auth-button";
import { analytics } from "../../../../firebaseConfig";
import { useNetInfo } from "@react-native-community/netinfo";
import { setRecordingList } from "redux/reducers/recordingStates";
import appsFlyer from "react-native-appsflyer";
import { useTheme } from "context";

export default () => {
  const router = useRouter();
  const refPassword = useRef<TextInput>();

  const userEmail = useSelector((state: RootState) => state.userDetails.email);
  const {token} = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();

  const [emailText, setEmailText] = useState(userEmail);
  const [errorText, setErrorText] = useState(null);

  const [passwordText, setPasswordText] = useState("");

  const signInMutation: any = useLogin();
  const queryClient = useQueryClient();
  const netInfo=useNetInfo()

  const inputRef = useRef<TextInput>(null);
  const { Colors } = useTheme()

  // useEffect(() => {
  //   // Must run after animations for keyboard to automatically open
  //   InteractionManager.runAfterInteractions(() => {
  //     if (refPassword?.current) {
  //       refPassword.current.focus()
  //     }
  //   })
  // }, [refPassword])
 

  const continueClicked = () => {
    dispatch(setEmail(emailText));
    signInMutation.mutate(
      {
        email: emailText,
        password: passwordText
      },
      {
        onSuccess: async (response: any, _variables: any, _context: any) => {
          const token = response.data?.authorisation?.token;
          const userData = response.data?.user
          if (token) {
            dispatch(setRecordingList([]))
            setAuthToken(response.data?.authorisation?.token,false,netInfo);
            dispatch(setToken(token));
            dispatch(setUserDetail(userData))
            queryClient.resetQueries('all-recording')
            queryClient.resetQueries('user-data')
            router.dismissAll();
            router.replace("/home/");
            analytics().logEvent('sign_in_success').catch(()=>{})
            appsFlyer.logEvent('af_login',{value:'af_success'})
          }
        },
        onError: (error: any) => {
          console.log(error)
        },
      }
    );
  };

  if (token){
    return <Redirect href="/home/" />;
  }
  return (
    <SafeAreaView style={{backgroundColor: Colors.white3,flex:1}}>
    <KeyboardAvoidingView
    behavior="padding"
      style={{
        paddingHorizontal: 32,
        flex: 1,
        justifyContent: "center",
        backgroundColor: Colors.white3,
      }}
    >
        <Touchable onPress={()=>{router.back()}} style={{position:'absolute',flexDirection:'row',alignItems:'center',top:isIOS?10:54,padding:16}}>
          <SvgXml xml={commonSvg.back1}/>
        </Touchable>
        {/* <View style={{alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <SvgXml xml={home.logo} /> 
        </View> */}
        <ScrollView contentContainerStyle={{flex:1,justifyContent:'center'}}>
      <Text
        style={{
          alignSelf: "center",
          color: Colors.darkWithOpacity(1),
          fontFamily: "Primary-Bold",
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 0,
        }}
      >
        Welcome back
      </Text>
      <TextField
        forwardedRef={inputRef}
        style={{ marginTop: isIOS? 36: 24 }}
        inputStyle={{ height: 48, borderRadius: 8,marginTop:isIOS? 8: 0,backgroundColor:Colors.whiteWithOpacity(1)}}
        value={emailText || ""}
        textContentType="emailAddress"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setEmailText(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.darkWithOpacity(0.25)}
        autoCorrect={false}
      />
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.email && (
          <Text style={{ marginTop: 4, color:Colors.redWithOpacity(1) }}>
            {signInMutation.error.response.data.errors.email[0]}
          </Text>
        )}
      <TextField
        forwardedRef={refPassword}
        onChangeText={(text) => setPasswordText(text)}
        value={passwordText}
        textContentType={"password"}
        // label={"Password"}
        secureTextEntry={true}
        returnKeyType={"next"}
        onSubmitEditing={continueClicked}
        placeholder="Password"
        placeholderTextColor={Colors.darkWithOpacity(0.25)}
        style={{ marginTop: 0}}
        inputStyle={{ height: 48, borderRadius: 8,marginTop:isIOS? 16: 16,backgroundColor:Colors.whiteWithOpacity(1) }}
        autoCapitalize="none"
      />
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.password && (
          <Text style={{ marginTop: 4, color: Colors.redWithOpacity(1) }}>
            {signInMutation.error.response.data.errors.password[0]}
          </Text>
        )}
      {/* <View style={st("flex-1")} /> */}
      <Pressable
        testID="signInPasswordBtn"
        style={{
          alignSelf: "center",
          backgroundColor: Colors.primary,
          marginBottom: 12,
          marginTop: 24,
          paddingVertical: 16,
          borderRadius: 8,
          width: "100%",
          alignItems: "center",
        }}
        disabled={signInMutation.isLoading}
        onPress={continueClicked}
      >
        {signInMutation.isLoading?
        <ActivityIndicator size={"small"} color={Colors.whiteWithOpacity(1)}/>
        :<Text
          style={{
            fontFamily: "Primary-Bold",
            fontSize: 14,
            fontWeight: "bold",
            color: Colors.whiteWithOpacity(1),
          }}
        >
          Continue
        </Text>}
      </Pressable>

      <View style={{ flexDirection: "row", justifyContent: "center",marginBottom:32 }}>
        <Text
          style={{
            marginTop: 24,
            fontFamily: "Primary",
            fontSize: 14,
            textAlign: "center",
            color: Colors.darkWithOpacity(1),
          }}
        >
          Don't have an account?
        </Text>
        <Pressable
          onPress={() => {
            router.push("/auth/signup/");
          }}
        >
          <Text
            style={{
              marginTop: 24,
              fontFamily: "Primary-Semibold",
              fontSize: 14,
              textAlign: "center",
              fontWeight: "600",
              color: Colors.primary,
            }}
          >
            {" Sign Up"}
          </Text>
        </Pressable>
      </View>
    {/* <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <View style={{flex:1,height:1,backgroundColor:Colors.primaryWithOpacity(0.1),width:'45%'}}/>
      <Text style={{color:Colors.primary,fontSize:14,fontFamily:'Primary',marginHorizontal:8}}>OR</Text>
      <View style={{flex:1,height:1,backgroundColor:Colors.primaryWithOpacity(0.1),width:'45%'}}/>
    </View>
    <GoogleAuthButton/> */}
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
