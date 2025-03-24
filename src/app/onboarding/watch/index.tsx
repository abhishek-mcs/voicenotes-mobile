import { View, Text, SafeAreaView, StyleSheet, Image, Platform, Animated, Easing } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef } from 'react'
import * as Haptics from "expo-haptics";
import { isIOS, screenHeight, screenWidth } from 'utils/common'
import { setSelectedScreen } from 'redux/reducers/onboardingData'
import { useDispatch } from 'react-redux'
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';

const Watch = () => {
    const styles = useStyles()
    const dispatch = useDispatch();
    const {Colors, isLightMode}=useTheme()

    const imageSlideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.timing(imageSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [imageSlideAnim]);

     // Animations
     const watchScale = useRef(new Animated.Value(1)).current;
     const cloudAnimation = useRef(new Animated.Value(0)).current;
 
     // Watch Scaling Animation (Pulsating)
     useEffect(() => {
         Animated.loop(
             Animated.sequence([
                 Animated.timing(watchScale, {
                     toValue: 1.03, // Slight scale-up
                     duration: 1500,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true,
                 }),
                 Animated.timing(watchScale, {
                     toValue: 1, // Back to normal
                     duration: 1500,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true,
                 }),
             ])
         ).start();
     }, []);
 
     // Cloud Bouncing Animation (Up & Down Movement)
     useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudAnimation, {
                    toValue: -8, // Move slightly up
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(cloudAnimation, {
                    toValue: 0, // Move back to original position
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);


    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        analytics().logEvent('onboarding_apple_watch').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_apple_watch');
        dispatch(setSelectedScreen(6))
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Voicenotes works well on {isIOS ? 'Apple' : 'Android'} Watch</Text>
        </View>

        {/* Watch Image with Scaling Animation */}
        <View style={styles.imageContainer}>
                <Animated.Image
                    source={isLightMode && isIOS ? require('../../../assets/images/watch.png') : isIOS ? require('../../../assets/images/watch-dark.png') : require('../../../assets/images/androidWatch.png')}
                    style={[!isIOS ? styles.watchImage : styles.androidWatch, { transform: [{ scale: watchScale }] }]}
                />
            </View>

        {/* Speech Bubble with Circular Motion */}
        <Animated.View
            style={[
                styles.imageContainer2,
                {
                    transform: [{ translateY: cloudAnimation }],
                },
            ]}
        >
            <Animated.Image source={require('../../../assets/images/watchNote.png')} style={[styles.watchImage2, { transform: [{ translateX: imageSlideAnim }] }]}   />
        </Animated.View>

        <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={isLightMode ? Colors.blackWithOpacity(0.8) : Colors.blackWithOpacity(0.3)}
                style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.text4}
            />
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
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: screenWidth/8,
            lineHeight: 56,
            textAlign: 'center',
            color: Colors.black2
        },
        imageContainer: {
            width: screenWidth,
            paddingHorizontal: 16,
            paddingTop: isIOS ? 30 : 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        watchImage: {
            height: screenHeight / 2.5,
            resizeMode: 'contain',
        },
        androidWatch: {
            height: screenHeight / 2.3,
            resizeMode: 'contain',
        },
        imageContainer2: {
            paddingHorizontal: 25,
            paddingTop: 10,
            paddingBottom: 16,
            alignItems: 'flex-start',
        },
        watchImage2: {
            height: 100,
            // width: screenWidth / 2,
            resizeMode: 'contain'
        },
        text: { 
            fontFamily:'Primary-Semibold',
            fontSize:16
        },
        buttonContainer1: {
            padding: 16,
            paddingBottom: 0,
        },
        button: {
            height:48,
            justifyContent:'center',
            alignItems:'center',
            borderRadius:16,
            flexDirection:'row'
        },
        footerContainer: {
            position: 'absolute',
            bottom: 18,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Watch