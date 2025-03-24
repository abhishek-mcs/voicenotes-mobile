import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage, setSelectedScreen } from 'redux/reducers/onboardingData'
import { RootState } from 'redux/store/store';
import { Animated } from 'react-native';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { isAndroid, screenWidth } from 'utils/common';
import { ScrollView } from 'react-native';

const Language = () => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const { language } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<any>(
        language == null ? 1 
        : language == '' ? 0 
        : language == 'en' ? 2 
        : language == 'es' ? 3 
        : language == 'fr' ? 4
        : language == 'de' ? 5
        : language == 'it' ? 6
        : language == 'pt' ? 7
        : 0 
    )
    const languages = [
        { icon: onboardingSvg.zoom?.replace("black", Colors.black2) , label: 'Detect Language', name: null, value: 1 },
        { icon: onboardingSvg.english, label: 'English', name: 'en', value: 2 },
        { icon: onboardingSvg.spanish, label: 'Spanish', name: 'es', value: 3 }, 
        { icon: onboardingSvg.french, label: 'French', name: 'fr', value: 4 },
        { icon: onboardingSvg.german, label: 'German', name: 'de', value: 5 },
        { icon: onboardingSvg.italian, label: 'Italian', name: 'it', value: 6 },
        { icon: onboardingSvg.portugese, label: 'Portugese', name: 'pt', value: 7 }
    ]
    const animatedValues = useMemo(() => languages?.map(() => new Animated.Value(350)), [languages]);
    
    useEffect(() => {
      animatedValues.forEach((anim: any, index: any) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }).start();
      });
    }, [animatedValues]);

    const onSelect = async (num: number) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        analytics().logEvent('onboarding_language_select').catch(e=>{})
        AppEventsLogger.logEvent('fb_onboarding_language_select');
        if (num) {
            setTimeout(() => dispatch(setSelectedScreen(4)), 100);
            setSelected(num)
            const lang = languages.find((lang) => lang.value === num)
            const selectedLanguage: any = lang?.name || null
            dispatch(setLanguage(selectedLanguage))
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>What's your preferred language?</Text>
        </View>
        
        <ScrollView style={{ marginBottom: isAndroid ? 80 : 100 }}>
        {languages?.map((item: any, index: any) => (
            <Animated.View
            key={index}
            style={[styles.buttonContainer1, { transform: [{ translateX: animatedValues[index] }] }]}
            >
                <LargeButton
                    underlayColor={Colors.bottomBarButtonBg1}
                    style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == item.value && {borderColor: Colors.black2, borderWidth: 2}]}
                    onPress={() => onSelect(item.value)}
                    text={item.label}
                    isLoading={false}
                    color={Colors.black2}
                    endIcon={isSelected == item.value && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                    startIcon={item.icon}
                />
            </Animated.View>
        ))}
        </ScrollView>
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
            paddingBottom: 16,
            paddingHorizontal: 20,
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
        button2: { 
          marginTop:12,
          borderRadius:16,
          height:48,
          justifyContent:'center',
          alignItems:'center',
          flexDirection:'row'
        }
    }), [Colors]);
}

export default Language