import { View, Text, SafeAreaView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import { androidGoogleClientID, expoClientID, iosGoogleClientID, MAIN_URL } from "services/api/api-constants"
import { setEmail, setToken, setUserDetail } from "redux/reducers/userDetails"
import { validateEmail } from 'utils/api-queries/auth/signin-mutations'
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuth from "expo-apple-authentication";
import { useCheckEmail, useGetPreferences } from 'queries/auth'
import * as Haptics from "expo-haptics";
import { LandingSvg } from 'assets/svg/LandingSvg'
import { TextField } from 'components/common/text-field'
import { setSelectedScreen, setUserEmail } from 'redux/reducers/onboardingData'
import { signInWithApple, signInWithGoogle } from "queries/auth"
import { useDispatch, useSelector } from 'react-redux'
import { setAuthToken } from 'services/api/axios-api'
import { useNetInfo } from '@react-native-community/netinfo'
import { useQueryClient } from 'react-query'
import { getNotification } from 'utils/cache'
// import { saveNotificationSettings } from 'queries/settings'
// import { formatTime } from 'utils/format-date'
import { RootState } from 'redux/store/store'


const Email = () => {
    const styles = useStyles()
    const {Colors}=useTheme()
    const dispatch = useDispatch();
    const netInfo=useNetInfo()
    const queryClient=useQueryClient()
    const inputRef = useRef<TextInput>(null);
    const checkEmailMutation:any = useCheckEmail()
    const getPreferencesMutation:any = useGetPreferences()
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError]:any = useState('')
    const [morningTime, setMorningTime] = useState<Date | null>(null)
    const [eveningTime, setEveningTime] = useState<Date | null>(null)
    const [active, setActive] = useState({ morning: true, evening: true })
    // const saveNotificationSettingsMutation:any = saveNotificationSettings()
    const {userEmail, referrer, language, age_group, note_taking_frequency, revisit_frequency, note_types} = useSelector((state: RootState) => state.onboardingData);
    const [validationError, setValidationError]:any = useState(false)
    const [emailText, setEmailText] = useState(userEmail ? userEmail : '')

    const checkNotification = async (type: 'morning' | 'evening') => {
        getNotification(type).then((response) => {
            if (response) {
                if (type === 'morning') {
                    setMorningTime(response.time)
                    setActive({ ...active, morning: response.active })
                } else {
                    setEveningTime(response.time)
                    setActive({ ...active, evening: response.active })
                }
            }
        })
    }

    useEffect(() => {
        checkNotification('morning')
        checkNotification('evening')
    },[])

    // const useSaveNotificationSettings = () => {
    //     saveNotificationSettingsMutation.mutate(
    //         {
    //             notifications: {
    //                 morning: {
    //                     time: formatTime(morningTime),
    //                     activated: active.morning
    //                 },
    //                 evening: {
    //                     time: formatTime(eveningTime),
    //                     activated: active.evening
    //                 }
    //             }
    //         },
    //         {
    //             onSuccess: (response: any) => {
    //                 console.log(response.data)
    //             },
    //             onError: (error: any) => {
    //                 console.log(error?.response?.data?.message);
    //             }
    //         }
    //     )
    // }

    const onLoginSuccess=(data:any)=>{
        if(!!data?.data){
          const token = data?.data?.token
          const userData = data?.data?.user
          if (token) {
            setAuthToken(data?.data?.token,false,netInfo);
            dispatch(setToken(token));
            dispatch(setUserDetail(userData))
            queryClient.resetQueries('all-recording')
            queryClient.resetQueries('user-data')
            // router.replace("/onboarding/pricing/");
            dispatch(setSelectedScreen(18))
            getPreferencesMutation.mutate(
                {
                    referrer: referrer,
                    language: language,
                    age_group: age_group,
                    note_taking_frequency: note_taking_frequency,
                    revisit_frequency: revisit_frequency,
                    note_types: note_types,
                },
                {
                    onSuccess: (response:any) => {
                        console.log(response.data,'preferences')
                        setLoading(false)
                        
                    },
                    onError: (error:any) => {
                        setLoading(false)
                        console.log(error?.response?.data,'preferences');
                    }
                }
            )
            // useSaveNotificationSettings()
            setTimeout(() => dispatch(setSelectedScreen(18)), 2000);
          }
        }
      }

    // Google Authentication
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
        iosClientId: iosGoogleClientID,
        androidClientId: androidGoogleClientID,
        scopes: ["profile", "email"],
    });
    
    const loginGoogle = signInWithGoogle();

    useEffect(() => {
        if (googleResponse?.type === "success") {
            loginGoogle.mutate({
                access_token: googleResponse?.params.id_token,
                client_id: Platform.OS === "ios" ? iosGoogleClientID : androidGoogleClientID,
                source: Platform.OS === "ios" ? 'ios' : 'android',
                device: 'mobile_app'
            }, { onSuccess: onLoginSuccess });
        }
    }, [googleResponse]);
    
    const onGoogleLogin = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        await googlePromptAsync();
    };

    // Apple Authentication
    const loginApple = signInWithApple();

    const signInAppleAsync = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        try {
            const credential = await AppleAuth.signInAsync({
                requestedScopes: [
                    AppleAuth.AppleAuthenticationScope.FULL_NAME,
                    AppleAuth.AppleAuthenticationScope.EMAIL,
                ],
            });
            if (credential.email) {
                dispatch(setEmail(credential.email));
            }
            loginApple.mutate({
                access_token: credential.identityToken,
                source: Platform.OS === "ios" ? 'ios' : 'android'
            }, { onSuccess: onLoginSuccess });
        } catch (e) {
            console.error(e);
        }
    };

    const onContinueEmail = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        setLoading(true)
        if (!validateEmail(emailText) || emailText === "") {
            setValidationError(true)
            setLoading(false)
        } else {
            setValidationError(false)
            dispatch(setEmail(emailText))
            dispatch(setUserEmail(emailText))
            console.log('Email Api called');
            
            checkEmailMutation.mutate(
                { email: emailText },
                { 
                    onSuccess: async (response:any) => {
                        setLoading(false)
                        if (response.data?.exists) {
                            setLoading(false)
                            console.log("Email exists")
                            setEmailError("Account with this email already exists.")
                        } else {
                            setLoading(false)
                            console.log("Email doesn't exist")
                            dispatch(setSelectedScreen(16))
                            // router?.push("/onboarding/name/")
                        }
                    },
                    onError: (error:any) => {
                        setLoading(false)
                        console.log("Email error")
                        console.warn(error?.response?.data,'s')
                        for (const er in error.response.data.errors) {
                          if (er == "email") {
                            setEmailError(error.response.data.errors[er][0])
                          } 
                          return
                        }
                    }
                }
            )
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.mainTextContainer}>
                        <Text style={styles.mainText}>Enter your email</Text>
                    </View>

                    <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                        <TextField
                          forwardedRef={inputRef}
                          style={{marginTop:0,flexDirection:'column'}}
                          inputStyle={{ height: 48, color:Colors.text, borderRadius: 16, borderWidth: 0, backgroundColor:Colors.bgColor7 }}
                          value={emailText}
                          returnKeyType="go"
                          textContentType="emailAddress"
                          onSubmitEditing={onContinueEmail}
                          onChangeText={(text) => {
                            setEmailText(text)
                            setEmailError(null)
                            setValidationError(false)
                          }}
                          placeholder="Your email"
                          placeholderTextColor={Colors.grey3}
                          autoComplete="email"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoFocus={true}
                        />
                        {validationError && (
                            <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8}}>Invalid email address.</Text>
                        )}
                        {emailError && (
                            <Text style={{marginTop:8}}>
                                <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14}}>{emailError}</Text>
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={Colors.settingsBtnBg}
                            style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                            onPress={onContinueEmail}
                            text="Continue"
                            isLoading={loading}
                            color={Colors.text4}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        <View style={styles.footerContainer}>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.bgColor}
                    style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                    onPress={signInAppleAsync}
                    text="Continue with Apple"
                    isLoading={false}
                    color={Colors.black2}
                    centerIcon={LandingSvg.apple?.replace('white', Colors.text)}
                />
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.bgColor}
                    style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                    onPress={onGoogleLogin}
                    text="Continue with Google"
                    isLoading={false}
                    color={Colors.black2}
                    centerIcon={LandingSvg.google}
                />
            </View>
        </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
        const { Colors } = useTheme();
        return useMemo(() => StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: Colors.whiteWithOpacity(1),
            // marginTop: Platform.OS === 'ios' ? 0 : 40
        },
        mainTextContainer: {
            marginTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 48,
            textAlign: 'center',
            color: Colors.black2
        },
        text: { 
            fontFamily:'Primary-Semibold', 
            fontSize:16
        },
        buttonContainer1: {
            padding: 16,
            paddingBottom: 0,
            paddingTop: 12,
        },
        button: {
            height:48,
            justifyContent:'center',
            alignItems:'center',
            borderRadius:16,
            flexDirection:'row',
        },
        footerContainer: {
            position: 'absolute',
            bottom: 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Email