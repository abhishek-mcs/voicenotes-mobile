import { commonSvg } from "assets/svg/commonSvg";
import { TextField } from "components/common/text-field";
import { useTheme } from "context";
import { router } from "expo-router";
import { useResetPassword } from "queries/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const refInput = useRef<TextInput>();
  const styles = useStyles();
  const { Colors } = useTheme();
  const resetPassword: any = useResetPassword();

  const handleSubmit = async () => {
    // Here you would typically handle the password reset logic
    await resetPassword.mutateAsync({ email }).catch(() => {});
    setSubmitted(true);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleGoBack}
        style={{
          position: "absolute",
          flexDirection: "row",
          alignItems: "center",
          top: isIOS ? 10 : 54,
          padding: 16,
        }}
      >
        <SvgXml xml={commonSvg.back1?.replace("#1C1B1F", Colors.back)} />
      </Pressable>
      <Text
        style={{
          alignSelf: "flex-start",
          color: Colors.text5,
          fontFamily: "Primary-Bold",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Forgot password
      </Text>

      {!submitted ? (
        <>
          <TextField
            forwardedRef={refInput}
            onChangeText={(text) => setEmail(text)}
            value={email}
            textContentType={"emailAddress"}
            returnKeyType={"send"}
            onSubmitEditing={handleSubmit}
            placeholder="Email Address"
            placeholderTextColor={Colors.grey6}
            style={{ marginTop: 0 }}
            inputStyle={{
              height: 48,
              color: Colors.text,
              borderRadius: 8,
              marginTop: 24,
              backgroundColor: Colors.inputBg3,
            }}
            autoCapitalize="none"
          />
          {resetPassword.isError && resetPassword.error?.response?.message && (
            <Text style={{ marginTop: 4, color: Colors.redWithOpacity(1) }}>
              {resetPassword.error?.response?.message}
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.submittedText}>
          If an account with that email address exists, you will receive a link to reset your password.
        </Text>
      )}
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
        disabled={resetPassword.isLoading}
        onPress={()=>!submitted?handleSubmit():handleGoBack()}
      >
        {resetPassword.isLoading ? (
          <ActivityIndicator size={"small"} color={Colors.text12} />
        ) : (
          <Text
            style={{
              fontFamily: "Primary-Bold",
              fontSize: 14,
              fontWeight: "bold",
              color: Colors.text12,
            }}
          >
            {!submitted?'Continue':'Go back'}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "center",
          padding: 20,
          backgroundColor:Colors.bgColor
        },
        heading: {
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        },
        input: {
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          paddingHorizontal: 10,
        },
        submittedContainer: {
          alignItems: "center",
        },
        submittedText: {
          fontSize: 16,
          marginTop: 20,
          textAlign: 'left',
          color: Colors.text,
          fontFamily: 'Primary'
        },
      }),
    [Colors]
  );
};

export default ForgotPassword;
