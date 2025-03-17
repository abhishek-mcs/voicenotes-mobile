import { View, Text, SafeAreaView, StyleSheet, Platform, Animated } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setNoteTypes, setSelectedScreen } from 'redux/reducers/onboardingData'
import { isAndroid } from 'utils/common'
import { RootState } from 'redux/store/store';

const Topics = ({data}: any) => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const { note_types } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<number[]>(note_types)
    const animatedValues = useMemo(() => data?.map(() => new Animated.Value(500)), [data]);
    
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
        dispatch(setNoteTypes(isSelected))
        if (isSelected.length > 0 && isSelected.includes(2)) {
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
        {data?.map((item: any, index: any) => (
            <Animated.View key={item.value} style={[styles.buttonContainer1, { transform: [{ translateX: animatedValues[index] }] }]}>
                <LargeButton
                    underlayColor={Colors.bottomBarButtonBg1}
                    style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected.includes(item.value) && {borderColor: Colors.black2, borderWidth: 2}]}
                    onPress={() => onSelect(item.value)}
                    text={item.label}
                    isLoading={false}
                    color={Colors.black2}
                    endIcon={isSelected.includes(item.value) && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                />
            </Animated.View>
        ))}
        
        <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.black2}
                style={[styles.button, { backgroundColor: Colors.black2 }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.white1}
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
            paddingHorizontal: 20,
            paddingBottom: 10,
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
            height: isAndroid ? 50 : 70,
            position: 'absolute',
            bottom: 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Topics