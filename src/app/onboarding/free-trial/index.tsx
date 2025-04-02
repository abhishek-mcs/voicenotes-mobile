import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import LargeButton from 'components/LargeButton'
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { SvgXml } from 'react-native-svg'
import * as Haptics from "expo-haptics";
import { useTheme } from "context"
import { useEffect, useMemo, useRef } from 'react'
import { screenHeight, screenWidth } from 'utils/common'
import { RootState } from 'redux/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { setShowClose, setSelectedScreen } from 'redux/reducers/onboardingData'
import { Animated } from 'react-native';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';

const FreeTrial = () => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
    const pack=IAPOfferings?.availablePackages||[]

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
        dispatch(setShowClose(false))
        dispatch(setSelectedScreen(15))
    }

    let MonthlyPriceString=(pack[1]?.product?.priceString?.replace(/\s*(?=\d)/, '')||'$9.99')?.replace(/\.0+$/, '')
    let AnnualPriceString=(pack[4]?.product?.priceString?.replace(/\s*(?=\d)/, '')||'$49.99')?.replace(/\.0+$/, '')

    let priceString=(pack[1]?.product?.priceString?.replace(/\s*(?=\d)/, '')||'$9.99')?.replace(/\.0+$/, '')
    const match = priceString?.match(/^[^\d]*[^\d\s]/);
    const currencySymbol=match?match[0]?.trim():"$";

    const priceMonth=(pack[1]?.product?.price||9.99).toFixed(2);
    const priceAnnual=(pack[4]?.product?.price||49.99).toFixed(2);
    const priceAnnualMonthly=((pack[4]?.product?.price||49.99)/12).toFixed(2);
    const priceAnnualMonthlyRibu=((pack[4]?.product?.price||49.99)/12000).toFixed(0);

    let priceAnnualMonthlyString=`${currencySymbol}${priceAnnualMonthly}`;
    let priceAnnualMonthlyStringRibu=`${currencySymbol}${priceAnnualMonthlyRibu}`;
    let priceMonthString=`${currencySymbol}${priceMonth}`;
    let priceAnnualString=`${currencySymbol}${priceAnnual}`;

    if (priceString.startsWith('Rp')){
      priceMonthString = MonthlyPriceString+'ribu';
      priceAnnualMonthlyString = priceAnnualMonthlyStringRibu+'ribu';
      priceAnnualString = AnnualPriceString+'ribu';
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
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                <SvgXml xml={onboardingSvg.tick?.replace('black', Colors.black2)} /> 
                <Text style={{ fontFamily: 'Primary-Semibold', fontSize: 14, color: Colors.black2 }}>No payment due now</Text>
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.8)}
                    style={[styles.button, { backgroundColor: Colors.black2 }]}
                    onPress={onContinue}
                    text="Try for free"
                    isLoading={false}
                    color={Colors.white1}
                />
            </View>
            <View style={{ alignSelf: 'center', paddingTop: 12 }}>
                <Text style={{ fontFamily: 'Primary', fontSize: 14, color: Colors.text10 }}>Just {priceAnnualString} per year ({priceAnnualMonthly}/mo)</Text>
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
            marginTop: screenHeight > 700 ? 20 : 0,
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
            paddingTop: 16,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        noteImage: {
            height: screenHeight/2.4,
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
            bottom: 6,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default FreeTrial