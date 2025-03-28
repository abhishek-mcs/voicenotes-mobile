import { View, Text, SafeAreaView, StyleSheet, Platform, Animated } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setShowClose, setNoteTypes, setSelectedScreen } from 'redux/reducers/onboardingData'
import { isAndroid, screenHeight, screenWidth } from 'utils/common'
import { RootState } from 'redux/store/store';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { ScrollView } from 'react-native';

const Topics = ({data}: any) => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const [error, setError] = useState(false)
    const { note_types } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<number[]>(note_types)
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

    const onSelect = (num: number) => {
        setError(false)
        setSelected((prevSelected) =>
            prevSelected.includes(num)
                ? prevSelected.filter((item) => item !== num) 
                : [...prevSelected, num] 
        );
    };

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        analytics().logEvent('onboarding_note_types').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_note_types');
        dispatch(setNoteTypes(isSelected))
        dispatch(setShowClose(false))
        if (isSelected.length == 0) {
            setError(true)
        }
        else if (isSelected.length > 0 && isSelected.includes(2)) {
            dispatch(setSelectedScreen(8))
        }
        else if (isSelected.length > 0) {
            dispatch(setSelectedScreen(9))
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>What do you take notes about?</Text>
        </View>
        <ScrollView style={{ marginBottom: isAndroid ? 80 : 100 }}>
        {data?.map((item: any, index: any) => (
            <Animated.View key={item.value} style={[styles.buttonContainer1, { transform: [{ translateX: animatedValues[index] }] }]}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.1)}
                    style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected.includes(item.value) && {borderColor: Colors.black2, borderWidth: 2}]}
                    onPress={() => onSelect(item.value)}
                    text={item.label}
                    isLoading={false}
                    color={Colors.black2}
                    endIcon={isSelected.includes(item.value) && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                />
            </Animated.View>
        ))}
        </ScrollView>
        
        <View style={[styles.buttonContainer1, error ? styles.footerContainerWithError : styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.blackWithOpacity(0.8)}
                style={[styles.button, { backgroundColor: Colors.black2 }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.white1}
            />
            {error && (
                <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8, alignSelf: 'center'}}>Please select an option to continue.</Text>
            )}
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
            paddingHorizontal: 20,
            paddingBottom: 10,
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
        footerContainer: {
            height: isAndroid ? 50 : 60,
            position: 'absolute',
            bottom: 32,
            right: 0,
            left: 0
        },
        footerContainerWithError: {
            height: isAndroid ? 50 : 60,
            position: 'absolute',
            bottom: isAndroid ? 45 : 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Topics