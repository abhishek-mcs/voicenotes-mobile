import { View, Text, SafeAreaView, StyleSheet, Image, Platform } from 'react-native'
import LargeButton from 'components/LargeButton'
import Reminders from 'components/common/Reminders';
import { useTheme } from "context"
import * as Haptics from "expo-haptics";
import { useDispatch } from 'react-redux';
// import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { setSelectedScreen } from 'redux/reducers/onboardingData';
import { useMemo } from 'react';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { screenWidth } from 'utils/common';

const Reminder = () => {
    const styles = useStyles()
    const {Colors,isLightMode} = useTheme()
    const dispatch=useDispatch()

    const onContinue = async() => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        analytics().logEvent('onboarding_notification_settings').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_notification_settings');
        dispatch(setSelectedScreen(14))
    }

    // const checkNotificationPermission = async () => {
    //     const settings = await notifee.getNotificationSettings()
    //     if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    //         dispatch(setSelectedScreen(14))
    //     }
    // }

    // useEffect(() => {
    //   checkNotificationPermission()
    // },[])

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Build a note-taking habit with reminders</Text>
        </View>

        <View style={styles.imageContainer}>
            <View style={styles.notifContainer}>
              <View
                style={styles.appIcon}
              >
                <View style={styles.appLogo}>
                    <Image source={require('../../../assets/images/logo.png')} style={{ width: 27, height: 30 }} />
                </View>
              </View>
              <View style={styles.notifText}>
                <View style={styles.notifHeader}>
                  <Text style={styles.appName}>Voicenotes</Text>
                  <Text style={styles.notifTime}>3m ago</Text>
                </View>
                <Text style={styles.notifMessage}>
                  Good morning! Take a moment for a quick brain dump and clear your mind for what's ahead.
                </Text>
              </View>
            </View>
        </View>

        <View style={{ height: '30%', paddingTop: 40 }}>
            <Reminders />
        </View>
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
        const { Colors, isLightMode } = useTheme();
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
            fontSize: screenWidth/8,
            lineHeight: 56,
            textAlign: 'center',
            color: Colors.black2
        },
        imageContainer: {
            paddingHorizontal: 16,
            paddingTop: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        // notImage: {
        //     height: 91,
        // },
        notifContainer: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: isLightMode ? Colors.darkWithOpacity(0.5) : Colors.bgColor2, 
            padding: 12,
            borderRadius: 12,
        },
        appIcon: {
            width: 39,
            height: 39,
            borderRadius: 8,
            marginRight: 10,
            marginTop: 8,
            backgroundColor: 'white',
        },
        appLogo: { 
            padding: 3,
            justifyContent: 'center',
            alignItems: 'center', 
        },
        notifText: {
            flex: 1,
        },
        notifHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
        },
        appName: {
            color: Colors.text4,
            fontSize: 14,
            fontWeight: "600",
        },
        notifTime: {
            color: isLightMode ? Colors.whiteWithOpacity(0.6) : Colors.grey3,
            fontSize: 12,
        },
        notifMessage: {
            color: Colors.text4,
            fontSize: 14,
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

export default Reminder