import { View, Text, SafeAreaView, StyleSheet, Platform, Animated } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setAgeGroup, setSelectedScreen } from 'redux/reducers/onboardingData'
import { RootState } from 'redux/store/store';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from "react-native-fbsdk-next";
// import { logEvent } from 'func/analytics/logEvent';

const Age = ({data}: any) => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const { age_group } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<any>(age_group !== null ? age_group : null)

    const animatedValues = useMemo(() => data?.map(() => new Animated.Value(350)), [data]);
    
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
        analytics().logEvent('onboarding_age_group').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_age_group');
        // logEvent('onboarding_age_group',{value:'success'})
        setSelected(num)
        dispatch(setAgeGroup(num))
        if(num) {
            setTimeout(() => dispatch(setSelectedScreen(5)), 200);
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>How old are you?</Text>
        </View>
        <View style={styles.subheadingContainer}>
            <Text style={styles.subheading}>Your age is used to personalize your AI and its responses.</Text>
        </View>
        {data?.map((item:any, index: any) => (
            <Animated.View key={item.value} style={[styles.buttonContainer1, { transform: [{ translateX: animatedValues[index] }] }]}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.1)}
                    style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == item.value && {borderColor: Colors.black2, borderWidth: 2}]}
                    onPress={() => onSelect(item.value)}
                    text={item.label}
                    isLoading={false}
                    color={Colors.black2}
                    endIcon={isSelected == item.value && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                />
            </Animated.View>
        ))}
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
            paddingHorizontal: 20,
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
        subheadingContainer: {
            paddingHorizontal: 50,
            paddingTop: 16,
            paddingBottom: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        subheading: {
            fontFamily: 'Primary',
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            color: Colors.grey3
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

export default Age