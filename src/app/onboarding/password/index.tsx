import { View, Text, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics";
import { useOnboardingSignup, useGetPreferences } from 'queries/auth'
import { TextField } from 'components/common/text-field'
import { TouchableWithoutFeedback } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'redux/store/store'
import { useNetInfo } from '@react-native-community/netinfo'
import { setAuthToken } from 'services/api/axios-api'
import { setRecordingList } from 'redux/reducers/recordingStates'
import { setToken, setUserDetail } from 'redux/reducers/userDetails'
import { useQueryClient } from 'react-query'
import { analytics } from '../../../../firebaseConfig'
// import appsFlyer from 'react-native-appsflyer'
// import { getNotification } from 'utils/cache'
// import { saveNotificationSettings } from 'queries/settings'
// import { formatTime } from 'utils/format-date'
import { setSelectedScreen } from 'redux/reducers/onboardingData';
import { AppEventsLogger } from 'react-native-fbsdk-next';

const Password = () => {
    const styles = useStyles()
    const {Colors,isLightMode}=useTheme()
    const dispatch = useDispatch();
    const queryClient=useQueryClient()
    // const saveNotificationSettingsMutation:any = saveNotificationSettings()
    const {userEmail, name, referrer, language, age_group, note_taking_frequency, revisit_frequency, note_types} = useSelector((state: RootState) => state.onboardingData);
    const onboardingSignupMutation:any = useOnboardingSignup()
    const getPreferencesMutation:any = useGetPreferences()
    // const [morningTime, setMorningTime] = useState<Date | null>(null)
    // const [eveningTime, setEveningTime] = useState<Date | null>(null)
    // const [active, setActive] = useState({ morning: true, evening: true })
    const [password, setPassword] = useState('')
    const [error, setError] = useState<any>('')
    const [loading, setLoading] = useState(false)
    const netInfo = useNetInfo()

      // Animated value for the footer position
      const footerPosition = useRef(new Animated.Value(0)).current;
    
        // Effect to track keyboard events and adjust footer position
      useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            const keyboardHeight = e.endCoordinates.height;
            const adjustedHeight = Math.min(keyboardHeight - 20, 150);
          Animated.timing(footerPosition, {
            toValue: adjustedHeight,
            duration: 300,
            useNativeDriver: false,
          }).start();
        });
    
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
          Animated.timing(footerPosition, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
        });
    
        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
      }, []);

    // const checkNotification = async (type: 'morning' | 'evening') => {
    //     getNotification(type).then((response) => {
    //         if (response) {
    //             if (type === 'morning') {
    //                 setMorningTime(response.time)
    //                 setActive({ ...active, morning: response.active })
    //             } else {
    //                 setEveningTime(response.time)
    //                 setActive({ ...active, evening: response.active })
    //             }
    //         }
    //     })
    // }

    // useEffect(() => {
    //     checkNotification('morning')
    //     checkNotification('evening')
    // },[])

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

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        setLoading(true)
        analytics().logEvent('sign_up_initiated').catch(e=>{})
        AppEventsLogger.logEvent('fb_sign_up_initiated');
        if (password && password.length > 0) {
            onboardingSignupMutation.mutate(
                { 
                    name: name,
                    email: userEmail,
                    password: password,
                    "signup-version": "v2"
                 },
                { 
                    onSuccess: async (response:any) => {
                        const token = response.data?.authorisation?.token;
                        const userData = response.data?.user
                        if(token) {
                            dispatch(setRecordingList([]))
                            dispatch(setToken(token));
                            dispatch(setUserDetail(userData))
                            setAuthToken(token,false,netInfo)
                            //From auth/signup/otp-screen.tsx
                            queryClient.resetQueries('all-recording')
                            queryClient.resetQueries('user-data')
                            analytics().logEvent('sign_up_success').catch(()=>{})
                            AppEventsLogger.logEvent(
                                AppEventsLogger.AppEvents.CompletedRegistration,
                                {
                                  [AppEventsLogger.AppEventParams.RegistrationMethod]: `${userEmail}`,
                                }
                            );
                            // appsFlyer?.logEvent('signup_success',{value:'af_success'})
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
                                        analytics().logEvent('onboarding_preferences_updated').catch(e=>{console.log(e)})
                                        AppEventsLogger.logEvent('fb_onboarding_preferences_updated');
                                        console.log(response.data,'preferences')
                                    },
                                    onError: (error:any) => {
                                        setLoading(false)
                                        console.log(error?.response?.data,'preferences');
                                        setError('There was a problem with your signup. Please try again.')
                                    }
                                }
                            )
                            // useSaveNotificationSettings()
                            // setTimeout(() => router.push("/onboarding/pricing/"), 2000);
                            setTimeout(() => {
                                dispatch(setSelectedScreen(18))
                                setLoading(false)
                            }, 3000);
                        }
                    },
                    onError: (error:any) => {
                        setLoading(false)
                        console.warn(error?.response?.data,'s')
                        for (const er in error.response.data.errors) {
                          if (er == "password") {
                            console.warn(error.response.data.errors[er][0])
                            setError(error.response.data.errors[er][0])
                          } 
                          return
                        }
                    }
                }
            )
        } else {
            setLoading(false)
            setError('Please enter a valid password.')
        }
    }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.mainContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.mainText}>Create a password</Text>
                </View>

                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <TextField
                      style={{marginTop:0,flexDirection:'column'}}
                      inputStyle={{ height: 48, color:Colors.text, borderRadius: 16, borderWidth: 0, backgroundColor:Colors.bgColor7 }}
                      value={password}
                      returnKeyType="go"
                      textContentType="password"
                      secureTextEntry={true}
                      onSubmitEditing={onContinue}
                      onChangeText={(val) => setPassword(val)}
                      placeholder="*******"
                      placeholderTextColor={Colors.grey3}
                      autoCapitalize="none"
                      autoFocus={true}
                    />
                     {error && error.length > 0 && (
                    <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8}}>{error}</Text>
                    )}
                </View>

                <Animated.View style={[styles.footerContainer, { bottom: footerPosition }]}>
                <View style={styles.buttonContainer1}>
                    <LargeButton
                        underlayColor={isLightMode ? Colors.blackWithOpacity(0.8) : Colors.blackWithOpacity(0.3)}
                        style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                        onPress={onContinue}
                        text="Continue"
                        isLoading={loading}
                        color={Colors.text4}
                    />
                </View> 
                </Animated.View>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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

export default Password