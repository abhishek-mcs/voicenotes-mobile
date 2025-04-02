import { View, Text, SafeAreaView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import { androidGoogleClientID, iosGoogleClientID, expoClientID } from "services/api/api-constants"
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
import { RootState } from 'redux/store/store'
import { analytics } from '../../../../firebaseConfig'
import { AppEventsLogger } from "react-native-fbsdk-next";
import { isIOS, screenHeight } from 'utils/common'

const Email = () => {
    const styles = useStyles()
    const {Colors,isLightMode}=useTheme()
    const dispatch = useDispatch();
    const netInfo=useNetInfo()
    const queryClient=useQueryClient()
    const checkEmailMutation:any = useCheckEmail()
    const getPreferencesMutation:any = useGetPreferences()
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError]:any = useState('')
    const {userEmail, referrer, language, age_group, note_taking_frequency, revisit_frequency, note_types} = useSelector((state: RootState) => state.onboardingData);
    const [validationError, setValidationError]:any = useState(false)
    const [emailText, setEmailText] = useState(userEmail ? userEmail : '')
    const [isEmail, setIsEmail] = useState(false)
    const [googleError, setGoogleError] = useState(false)

    const isMoreThan5MinutesAgo = (createdAt: string): boolean => {
        const createdAtDate = new Date(createdAt);
        const now = new Date();
        const diffInMs = now.getTime() - createdAtDate.getTime();
        return diffInMs > 5 * 60 * 1000;
      };

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
        expoClientId: expoClientID,
        iosClientId: iosGoogleClientID,
        androidClientId: androidGoogleClientID,
        scopes: ["profile", "email"],
    });
    
    const loginGoogle = signInWithGoogle();

    useEffect(() => {
        if (googleResponse?.type === "success") {
            console.log('Google Response success', googleResponse);
            
            loginGoogle.mutate({
                access_token: googleResponse?.params.id_token,
                client_id: Platform.OS === "ios" ? iosGoogleClientID : androidGoogleClientID,
                source: Platform.OS === "ios" ? 'ios' : 'android',
                device: 'mobile_app'
            }, { onSuccess: (data: any) => {
                    console.log('Success data', data.data.user.created_at, isMoreThan5MinutesAgo(data.data.user.created_at));
                    if(isMoreThan5MinutesAgo(data.data.user.created_at) == false){
                        analytics().logEvent('onboarding_google_signup').catch(e=>{console.log(e)})
                        AppEventsLogger.logEvent('fb_onboarding_google_signup');
                        onLoginSuccess(data)
                    } else {
                        setGoogleError(true)
                    }
                },
                onError: (error: any) => {
                    console.log("Google Sign-In Error:", error?.response?.data);
                    // Set error if account exists
                    if (error?.response?.data?.message?.includes("already exists")) {
                        setGoogleError(true)
                    }
                }
            });
        } else {
            console.log('Google response not success',googleResponse, googleResponse?.type);
        }
    }, [googleResponse]);
    
    const onGoogleLogin = async () => {
        setGoogleError(false);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        const res= await googlePromptAsync().then(e=>{
            console.log('googlePromptAsync data',e)
        }).catch(e=>{
            console.log('googlePromptAsync error',e)
        })
    };

    // Apple Authentication
    const loginApple = signInWithApple();

    const signInAppleAsync = async () => {
        setGoogleError(false);
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
            }, { onSuccess: (data: any) => {
                    analytics().logEvent('onboarding_apple_signup').catch(e=>{console.log(e)})
                    AppEventsLogger.logEvent('fb_onboarding_apple_signup');
                    onLoginSuccess(data)
                }  
            });
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
                            analytics().logEvent('onboarding_email_checked').catch(e=>{console.log(e)})
                            AppEventsLogger.logEvent('fb_onboarding_email_checked');
                            dispatch(setSelectedScreen(16))
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView style={styles.mainContainer}>
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            
                <View>
                    <View style={styles.mainTextContainer}>
                        <Text style={styles.mainText}>{isEmail ? 'Enter your email' : 'Create your account'}</Text>
                    </View>

                    {isEmail && <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                        <TextField
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
                        //   autoFocus={true}
                        />
                        {validationError && (
                            <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8}}>Invalid email address.</Text>
                        )}
                        {emailError && (
                            <Text style={{marginTop:8}}>
                                <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14}}>{emailError}</Text>
                            </Text>
                        )}
                    </View>}
                    
                    {isEmail ? <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={isLightMode ? Colors.blackWithOpacity(0.8) : Colors.blackWithOpacity(0.3)}
                            style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                            onPress={onContinueEmail}
                            text="Continue"
                            isLoading={loading}
                            color={Colors.text4}
                        />
                    </View> : <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={Colors.blackWithOpacity(0.05)}
                            style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                            onPress={() => setIsEmail(true)}
                            text="Continue with Email"
                            color={Colors.black2}
                            centerIcon={LandingSvg.emailIcon?.replace('white', Colors.text)}
                        />
                    </View>}
                    {isIOS && !isEmail && <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={Colors.blackWithOpacity(0.05)}
                            style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                            onPress={signInAppleAsync}
                            text="Continue with Apple"
                            isLoading={false}
                            color={Colors.black2}
                            centerIcon={LandingSvg.apple?.replace('white', Colors.text)}
                        />
                    </View>}
                    {!isEmail && <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={Colors.blackWithOpacity(0.05)}
                            style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                            onPress={onGoogleLogin}
                            text="Continue with Google"
                            isLoading={loginGoogle?.isLoading||false}
                            color={Colors.black2}
                            centerIcon={LandingSvg.google}
                        />
                        {googleError && <View style={{marginTop:8, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14}}>Account with this email already exists.</Text>
                        </View>}
                    </View>}
                </View>
        </KeyboardAvoidingView>
        {/* <View style={styles.footerContainer}>
            {isIOS && <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.05)}
                    style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                    onPress={signInAppleAsync}
                    text="Continue with Apple"
                    isLoading={false}
                    color={Colors.black2}
                    centerIcon={LandingSvg.apple?.replace('white', Colors.text)}
                />
            </View>}
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.05)}
                    style={[styles.button, { backgroundColor: Colors.bgColor, borderColor: Colors.grey4, borderWidth: 1 }]}
                    onPress={onGoogleLogin}
                    text="Continue with Google"
                    isLoading={false}
                    color={Colors.black2}
                    centerIcon={LandingSvg.google}
                />
            </View>
        </View> */}
    </SafeAreaView>
    </TouchableWithoutFeedback>
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
            marginTop: screenHeight > 700 ? 20 : 0,
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
            // position: 'absolute',
            // bottom: 32,
            // right: 0,
            // left: 0
        }
    }), [Colors]);
}

export default Email