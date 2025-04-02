import { View, Text, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics";
import { TextField } from 'components/common/text-field'
import { TouchableWithoutFeedback } from 'react-native'
import { setName, setSelectedScreen } from 'redux/reducers/onboardingData'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'redux/store/store';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { screenHeight } from 'utils/common';

const Name = () => {
    const styles = useStyles()
    const {Colors,isLightMode}=useTheme()
    const dispatch = useDispatch();
    const { name } = useSelector((state: RootState) => state.onboardingData);
    const [username, setUsername] = useState<string>(name ? name : '')
    const [error, setError] = useState<any>('')

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

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        analytics().logEvent('onboarding_name_entered').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_name_entered');
        if(username && username.length > 0) {
            dispatch(setName(username))
            dispatch(setSelectedScreen(17))
        } else {
            setError('Please enter a valid name.')
        }
    }

  return (
    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.mainContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.mainText}>Enter your name</Text>
                </View>

                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <TextField
                      style={{marginTop:0,flexDirection:'column'}}
                      inputStyle={{ height: 48, color:Colors.text, borderRadius: 16, borderWidth: 0, backgroundColor:Colors.bgColor7 }}
                      value={username}
                      returnKeyType="go"
                      textContentType="emailAddress"
                      onSubmitEditing={onContinue}
                      onChangeText={(text) => {
                        setUsername(text)
                        setError(null)
                      }}
                      placeholder="Your name"
                      placeholderTextColor={Colors.grey3}
                      autoComplete="name"
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
                            isLoading={false}
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
            marginBottom: 20
        },
        footerContainer: {
            position: 'absolute',
            bottom: screenHeight > 900 ? 100 : 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Name