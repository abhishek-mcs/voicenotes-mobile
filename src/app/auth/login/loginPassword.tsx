import React, { useRef, useState } from "react";
import { TextField } from "components/common/text-field";
import {
  Pressable,
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { setAuthToken } from "services/api/axios-api";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setEmail, setToken, setUserDetail } from "redux/reducers/userDetails";
import Colors from "assets/Colors";
import { SvgXml } from "react-native-svg";
import { useLogin } from "queries/auth";
import { useQueryClient } from "react-query";
import { isIOS } from "utils/common";
import { home } from "assets/svg/home";

export default () => {
  const router = useRouter();
  const refPassword = useRef<TextInput>();

  const userEmail = useSelector((state: RootState) => state.userDetails.email);
  const dispatch = useDispatch();

  const [emailText, setEmailText] = useState(userEmail);
  const [errorText, setErrorText] = useState(null);

  const [passwordText, setPasswordText] = useState("");

  const signInMutation: any = useLogin();
  const queryClient = useQueryClient();

  const inputRef = useRef<TextInput>(null);

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
            setAuthToken(token,false);
            dispatch(setToken(token));
            dispatch(setUserDetail(userData))
            queryClient.resetQueries('all-recording')
            queryClient.resetQueries('user-data')
            router.replace("/home/");
          }
        },
        onError: (error: any) => {
          console.log(error)
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
    behavior="padding"
      style={{
        paddingHorizontal: 32,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
        {/* <Touchable>
          <SvgXml xml={}/>
          <Text>Back</Text>
        </Touchable> */}
        <View style={{alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <SvgXml xml={home.logo} /> 
        </View>
      <Text
        style={{
          alignSelf: "center",
          color: "#222",
          fontFamily: "Primary-Bold",
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 24,
        }}
      >
        Welcome back
      </Text>
      <TextField
        forwardedRef={inputRef}
        style={{ marginTop: isIOS? 36: 24 }}
        inputStyle={{ height: 48, borderRadius: 8,marginTop:isIOS? 8: 0}}
        value={emailText || ""}
        textContentType="emailAddress"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setEmailText(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={"rgba(34,34,34,0.25)"}
        autoCorrect={false}
      />
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.email && (
          <Text style={{ marginTop: 4, color: "red" }}>
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
        placeholderTextColor={"rgba(34,34,34,0.25)"}
        style={{ marginTop: 0, backgroundColor: "white" }}
        inputStyle={{ height: 48, borderRadius: 8,marginTop:isIOS? 8: 0 }}
        autoCapitalize="none"
      />
      {signInMutation.isError &&
        signInMutation.error.response.data.errors?.password && (
          <Text style={{ marginTop: 4, color: "red" }}>
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
        onPress={continueClicked}
      >
        {signInMutation.isLoading?
        <ActivityIndicator size={"small"} color={"#fff"}/>
        :<Text
          style={{
            fontFamily: "Primary-Bold",
            fontSize: 14,
            fontWeight: "bold",
            color: "#fff",
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
            color: "#222",
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
    </KeyboardAvoidingView>
  );
};
