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
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setEmail } from "redux/reducers/userDetails";
import Colors from "assets/Colors";
import { useSignup } from "queries/auth";

const logo = require("assets/images/logo.png");

export default () => {
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

  const continueClicked = () => {
    dispatch(setEmail(emailText));
    signInMutation.mutate(
      {
        email: emailText,
        password: passwordText,
        name: name
      },
      {
        onSuccess: async (response: any, _variables: any, _context: any) => {
            router.push({pathname:"/auth/signup/otp-screen",params:{email:emailText,password:passwordText,name:name}});
        },
        onError: (error: any) => {
          console.log(error)
        },
      }
    );
    }

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
        // forwardedRef={inputref}
        style={{ marginTop: 36 }}
        inputStyle={{ height: 48, borderRadius: 8 }}
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
      >{signInMutation.isLoading?
        <ActivityIndicator size={"small"} color={"#fff"}/>
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
        </Text>}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems:'center', justifyContent: "center",marginBottom:32,marginTop:24 }}>
        <Text
          style={{
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
