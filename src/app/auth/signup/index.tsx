import React, { useRef, useState } from "react";
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
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setEmail } from "redux/reducers/userDetails";
import { useSignup } from "queries/auth";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import { isIOS } from "utils/common";
import Touchable from "components/common/Touchable";
import { commonSvg } from "assets/svg/commonSvg";
import { analytics } from "../../../../firebaseConfig";
import appsFlyer from "react-native-appsflyer";
import { useTheme } from "context";

const Signup = () => {
  const router = useRouter();
  const refPassword = useRef<TextInput>();

  const userEmail = useSelector((state: RootState) => state.userDetails.email);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [emailText, setEmailText] = useState(userEmail);
  const [errorText, setErrorText] = useState(null);

  const [passwordText, setPasswordText] = useState("");

  const signInMutation: any = useSignup()

  const inputRef = useRef<TextInput>(null);
  const { Colors } = useTheme()

  const continueClicked = () => {
    dispatch(setEmail(emailText));
    signInMutation.mutate(
      {
        email: emailText,
        password: passwordText,
        name: name,
        source:isIOS?'ios':'android',
      },
      {
        onSuccess: async (response: any, _variables: any, _context: any) => {
          analytics().logEvent('sign_up_initiated').catch(e=>{})
            router.push({pathname:"/auth/signup/otp-screen",params:{email:emailText,password:passwordText,name:name}});
            appsFlyer?.logEvent('signup_initiated',{value:'success'})
        },
        onError: (error: any) => {
          console.log(error)
        },
      }
    );
    }

  return (
    <SafeAreaView style={{backgroundColor: Colors.bgColor9,flex:1}}>
    <KeyboardAvoidingView
    behavior="padding"
      style={{
        paddingHorizontal: 32,
        flex: 1,
        justifyContent: "center",
        backgroundColor: Colors.bgColor9,
      }}
    >
        <Touchable onPress={()=>{router.back()}} style={{position:'absolute',flexDirection:'row',alignItems:'center',top:isIOS?10:54,padding:16}}>
          <SvgXml xml={commonSvg.back1?.replace('#1C1B1F',Colors.back)}/>
        </Touchable>

      {/* <View style={{alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <SvgXml xml={home.logo} /> 
        </View> */}
        <ScrollView contentContainerStyle={{flex:1,justifyContent:'center'}}>
      <Text
        style={{
          alignSelf: "center",
          color: Colors.text5,
          fontFamily: "Primary-Bold",
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 48,
        }}
      >
        Create an account
      </Text>
      <TextField
        // forwardedRef={inputref}
        style={{ marginTop: isIOS?36:24 }}
        inputStyle={{ height: 48, color:Colors.text, borderRadius: 8,marginTop:isIOS? 8: 0 , backgroundColor: Colors.inputBg3  }}
        value={name|| ""}
        textContentType="familyName"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setName(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="Name"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={Colors.grey6}
      />
      <TextField
        forwardedRef={inputRef}
        inputStyle={{ height: 48, color:Colors.text, borderRadius: 8,marginTop:8 , backgroundColor: Colors.inputBg3  }}
        value={emailText || ""}
        textContentType="emailAddress"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setEmailText(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={Colors.grey6}
      />
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
        style={{ marginTop: 0}}
        inputStyle={{ height: 48, color:Colors.text, borderRadius: 8,marginTop:8, backgroundColor: Colors.inputBg3  }}
        autoCapitalize="none"
        placeholderTextColor={Colors.grey6}
      />
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.password && (
          <Text style={{ marginTop: 4, color: "red" }}>
            {signInMutation.error.response.data.errors.password[0]}
          </Text>
        )}
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.email && (
          <Text style={{ marginTop: 4, color: "red" }}>
            {signInMutation.error.response.data.errors.email[0]}
          </Text>
        )}
      {/* <View style={st("flex-1")} /> */}
      <Pressable
        testID="signInPasswordBtn"
        style={{
          alignSelf: "center",
          backgroundColor: Colors.primaryDark,
          marginBottom: 12,
          marginTop: 24,
          paddingVertical: 16,
          borderRadius: 8,
          width: "100%",
          alignItems: "center",
        }}
        onPress={continueClicked}
      >{signInMutation.isLoading?
        <ActivityIndicator size={"small"} color={Colors.text12}/>
        :
        <Text
          style={{
            fontFamily: "Primary-Bold",
            fontSize: 14,
            fontWeight: "bold",
            color: Colors.text12,
          }}
        >
          Continue
        </Text>}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems:'center', justifyContent: "center",marginBottom:32,marginTop:24 }}>
        <Text
          style={{
            fontFamily: "Primary",
            fontSize: 14,
            textAlign: "center",
            color: Colors.text1,
          }}
        >
          Already have an account?
        </Text>
        <Pressable
          onPress={() => {
            router.replace("/auth/login/loginPassword");
          }}
        >
          <Text
            style={{
              fontFamily: "Primary-Semibold",
              fontSize: 14,
              textAlign: "center",
              fontWeight: "600",
              color: Colors.primaryDark,
            }}
          >
            {" Log In"}
          </Text>
        </Pressable>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;