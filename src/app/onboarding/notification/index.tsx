import { View, Text, SafeAreaView, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native'
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
// import LargeButton from 'components/Largebutton';
import { useDispatch } from 'react-redux';
import * as Haptics from "expo-haptics";
import { setSelectedScreen } from 'redux/reducers/onboardingData';
import { screenWidth } from 'utils/common';

const Notification = () => {
    const styles = useStyles()
    const dispatch=useDispatch()
    const [popupVisible, setPopupVisible] = useState(false)

    const openNotificationSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openSettings();
        } else {
            Linking.openURL('android.settings.APP_NOTIFICATION_SETTINGS');
        }
    };

    const onAllow = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        openNotificationSettings()
        setTimeout(() => dispatch(setSelectedScreen(13)), 200);
    }

    const onNotAllow = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        setTimeout(() => dispatch(setSelectedScreen(14)), 200);
    }


    async function requestUserPermission() {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
            console.log('Permission settings:', settings);
            dispatch(setSelectedScreen(13))
        } else {
            console.log('User declined permissions');
            dispatch(setSelectedScreen(14))
        }
    }

    useEffect(() => {
        checkIfPopupAppeared();
    }, []);
    
    const checkIfPopupAppeared = async () => {
        const settings = await notifee.getNotificationSettings();
        if (
          settings.authorizationStatus === AuthorizationStatus.DENIED
        ) {
          // If status is DENIED or BLOCKED, the popup has already appeared
          setPopupVisible(true);
        } else {
          // If status is NOT_DETERMINED (iOS) or default Android case, it hasn't appeared
          setPopupVisible(false);
          requestUserPermission()
        }
    };
    

    // useEffect(() => {
    //    requestUserPermission
    // },[AuthorizationStatus])

    const CustomPopup =  () => {
        return (
        <View style={styles.popupContainer}>
          <Text style={styles.title}>Voicenotes would like to send you notifications</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onNotAllow} style={styles.buttonLeft}>
              <Text style={styles.buttonText}>Don't Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAllow} style={styles.buttonRight}>
              <Text style={[styles.buttonText, styles.allowText]}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
    )}
    
  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Build a note-taking habit with reminders</Text>
        </View>
        <View style={{ flex: 1 }}>
          {popupVisible && <CustomPopup />}
        </View>
        {/* <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.settingsBtnBg}
                style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.text4}
            />
        </View> */}
    </SafeAreaView>
  )
}

const useStyles = () => {
        const { Colors, isLightMode } = useTheme();
        return useMemo(() => StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: Colors.whiteWithOpacity(1),
            marginTop: Platform.OS === 'ios' ? 0 : 40,
            alignItems: 'center',
        },
        mainTextContainer: {
            marginTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 16,
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 48,
            lineHeight: 56,
            textAlign: 'center',
            color: Colors.black2
        },
        popupContainer: {
            marginTop: screenWidth / 4,
            width: screenWidth / 1.2,
            backgroundColor: isLightMode ? Colors.darkWithOpacity(0.1) : Colors.bgColor2,
            borderRadius: 24,
        },
        title: {
            fontSize: 18,
            lineHeight: 24,
            fontFamily: 'Primary-Semibold',
            textAlign: "center",
            color: isLightMode ? Colors.darkWithOpacity(0.85) : Colors.text10,
            paddingVertical: 25,
            paddingHorizontal: 50
        },
        buttonContainer: {
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: Colors.grey10,
            width: "100%",
        },
        buttonLeft: {
            flex: 1,
            paddingVertical: 20,
            alignItems: "center",
            borderRightWidth: 1,
            borderRightColor: Colors.grey10,
        },
        buttonRight: {
            flex: 1,
            paddingVertical: 20,
            alignItems: "center",
        },
        buttonText: {
            fontSize: 18,
            fontFamily: 'Primary-Semibold',
            color: isLightMode ? Colors.darkWithOpacity(0.85) : Colors.text10,
        },
        allowText: {
            color: Colors.blue
        },
        // buttonContainer1: {
        //     padding: 16,
        //     paddingBottom: 0,
        // },
        // button: {
        //     height:48,
        //     justifyContent:'center',
        //     alignItems:'center',
        //     borderRadius:16,
        //     flexDirection:'row'
        // },
        // footerContainer: {
        //     position: 'absolute',
        //     bottom: 32,
        //     right: 0,
        //     left: 0
        // }
    }), [Colors]);
}

export default Notification