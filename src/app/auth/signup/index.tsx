import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { TextField } from "components/common/text-field";
import {
  Pressable,
  View,
  TextInput,
  InteractionManager,
  Text,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import axiosApi, { setAuthToken } from "services/api/axios-api";
import uuid from "react-native-uuid";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setEmail, setToken } from "redux/reducers/userDetails";
import { signInWithPassword } from "utils/api-queries/auth/signin-mutations";
import Colors from "assets/Colors";

const logo = require("assets/images/logo.png");

export default () => {
  const router = useRouter();
  const refPassword = useRef<TextInput>();

  const userEmail = useSelector((state: RootState) => state.userDetails.email);
  const dispatch = useDispatch();

  const [emailText, setEmailText] = useState(userEmail);
  const [errorText, setErrorText] = useState(null);

  const [passwordText, setPasswordText] = useState("");

  const signInMutation: any = signInWithPassword();

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
    const uu_id = uuid.v4().toLocaleString();
    dispatch(setEmail(emailText));
    signInMutation.mutate(
      {
        email: emailText || null,
        password: passwordText,
        fcmToken: "",
        uuid: uu_id,
      },
      {
        onSuccess: async (response: any, _variables: any, _context: any) => {
          const token = response.data.token;
          if (token) {
            dispatch(setToken(token));
            setAuthToken(token);
            // userStore.setProjectID(response.data.data.project.project_id)

            // await saveToken("257177|1pUSWADswSojIYu3tJ4S4NodykZicy7BByIDyPKr")
            // setAuthToken("257177|1pUSWADswSojIYu3tJ4S4NodykZicy7BByIDyPKr")
            // userStore.setProjectID(3338105)
            if (response.data.data.user_role == 0) {
              // router.push({pathname:"/auth/signup",params:{slug : response.data.data?.project?.project_slug ?? null}})
            } else {
              router.replace("/home/");
            }
          }
          // if (response.data.otp_login) {
          //   router.push("signup_otp")
          // }
        },
        onError: (error: any) => {
          for (const er in error.response.data.errors) {
            setErrorText(error.response.data.errors[er][0]);
            return;
          }
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
      {/* <Image src={} /> */}
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
        Create an account
      </Text>
      <TextField
        forwardedRef={inputRef}
        style={{ marginTop: 36 }}
        inputStyle={{ height: 48, borderRadius: 8 }}
        value={emailText || ""}
        textContentType="familyName"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setEmailText(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="Name"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        forwardedRef={inputRef}
        inputStyle={{ height: 48, borderRadius: 8 }}
        value={emailText || ""}
        textContentType="emailAddress"
        // label={"Enter your email"}
        returnKeyType="next"
        onChangeText={(text: string) => setEmailText(text)}
        onSubmitEditing={() => refPassword?.current?.focus()}
        placeholder="john@doe.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
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
        style={{ marginTop: 0, backgroundColor: "white" }}
        inputStyle={{ height: 48, borderRadius: 8 }}
        autoCapitalize="none"
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
      </Pressable>
      <View style={{ flexDirection: "row", justifyContent: "center",marginBottom:32 }}>
        <Text
          style={{
            marginTop: 16,
            fontFamily: "Primary",
            fontSize: 14,
            textAlign: "center",
            color: "#222",
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
              marginTop: 24,
              fontFamily: "Primary-Semibold",
              fontSize: 14,
              textAlign: "center",
              fontWeight: "600",
              color: Colors.primary,
            }}
          >
            {" Log In"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};
