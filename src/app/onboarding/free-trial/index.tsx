import { View, Text, SafeAreaView, StyleSheet, Image, Platform } from 'react-native'
import LargeButton from 'components/LargeButton'
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { SvgXml } from 'react-native-svg'
import * as Haptics from "expo-haptics";
import { useTheme } from "context"
import { useEffect, useMemo, useRef } from 'react'
import { screenHeight } from 'utils/common'
import { setSelectedScreen } from 'redux/reducers/onboardingData'
import { useDispatch } from 'react-redux'
import { Animated } from 'react-native';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';

const FreeTrial = () => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();

    const imageSlideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.timing(imageSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [imageSlideAnim]);

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        analytics().logEvent('onboarding_free_trial_info').catch((e: any)=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_free_trial_info');
        dispatch(setSelectedScreen(15))
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>We want you to try Voicenotes for free</Text>
        </View>
        <View style={styles.imageContainer}>
            <Animated.Image 
                source={require('../../../assets/images/free-try.png')} 
                style={[styles.noteImage, { transform: [{ translateX: imageSlideAnim }] }]}  
            />
        </View>
        <View style={styles.footerContainer}>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                <SvgXml xml={onboardingSvg.tick?.replace('black', Colors.black2)} /> 
                <Text style={{ fontFamily: 'Primary-Semibold', fontSize: 14, color: Colors.black2 }}>No payment due now</Text>
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.settingsBtnBg}
                    style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                    onPress={onContinue}
                    text="Try for free"
                    isLoading={false}
                    color={Colors.text4}
                />
            </View>
            <View style={{ alignSelf: 'center', paddingTop: 12 }}>
                <Text style={{ fontFamily: 'Primary', fontSize: 14, color: Colors.text10 }}>Just $49.99 per year (3.99/mo)</Text>
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
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 48,
            lineHeight: 56,
            textAlign: 'center',
            color: Colors.black2
        },
        imageContainer: {
            paddingHorizontal: 16,
            paddingTop: 16,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        noteImage: {
            height: screenHeight/2.3,
            // width: 240,
            resizeMode: 'contain',
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
            bottom: 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default FreeTrial