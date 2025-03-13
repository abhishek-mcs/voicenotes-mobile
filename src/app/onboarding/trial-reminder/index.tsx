import { View, Text, SafeAreaView, StyleSheet, Image, Linking, Platform } from 'react-native'
import notifee, { AuthorizationStatus } from '@notifee/react-native'
import LargeButton from 'components/Largebutton'
import { useTheme } from "context"
import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import * as Haptics from "expo-haptics";
import { SvgXml } from 'react-native-svg'
import { onboardingSvg } from 'assets/svg/onboardingSvg'

const TrialReminder = () => {
    const styles = useStyles()
    const router = useRouter()
    const {Colors} = useTheme()

    const openNotificationSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openSettings();
        } else {
            Linking.openURL('android.settings.APP_NOTIFICATION_SETTINGS');
        }
    };

    const onEnable = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        const settings = await notifee.requestPermission()
        if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
            // Notifications enabled, navigate to home
            router.push("/home")
        } else {
            openNotificationSettings()
            setTimeout(() => {
                router.push("/home")
            }
            , 2000)
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>We'll send you a reminder before your free trial ends</Text>
        </View>
         <View style={styles.imageContainer}>
            {/* <Image source={require('../../../assets/images/bell-icon.png')} style={styles.bellImage} /> */}
            <SvgXml xml={onboardingSvg.bellAlert.replace("black", Colors.black2)} />
        </View>
        <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.settingsBtnBg}
                style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                onPress={onEnable}
                text="Enable notifications"
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
            marginTop: Platform.OS === 'ios' ? 0 : 40
        },
        mainTextContainer: {
            marginTop: 20,
            paddingHorizontal: 24,
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
            paddingTop: 65,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bellImage: {
            height: 153,
            width: 137
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
            bottom: 60,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default TrialReminder