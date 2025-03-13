import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native'
import LargeButton from 'components/Largebutton'
import { useTheme } from "context"
import { useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage, setSelectedScreen } from 'redux/reducers/onboardingData'
import { RootState } from 'redux/store/store';

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
        { name: null, value: 1 },
        { name: 'en', value: 2 },
        { name: 'es', value: 3 }, 
        { name: 'fr', value: 4 },
        { name: 'de', value: 5 },
        { name: 'it', value: 6 },
        { name: 'pt', value: 7 }
    ]

    const onSelect = async (num: number) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        if (num) {
            setSelected(num)
            const lang = languages.find((lang) => lang.value === num)
            const selectedLanguage: any = lang?.name || null
            dispatch(setLanguage(selectedLanguage))
            if (num){
                setTimeout(() => dispatch(setSelectedScreen(4)), 200);
            }
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>What's your preferred language?</Text>
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 1 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(1)}
                text="Detect Language"
                isLoading={false}
                color={Colors.black2}
                endIcon={isSelected == 1 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                startIcon={onboardingSvg.zoom?.replace("black", Colors.black2)}
            />
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 2 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(2)}
                text="English"
                isLoading={false}
                color={Colors.black2}
                endIcon={isSelected == 2 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                startIcon={onboardingSvg.english}
            />
            
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 3 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(3)}
                text="Spanish"
                isLoading={false}
                color={Colors.black2}
                startIcon={onboardingSvg.spanish}
                endIcon={isSelected == 3 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
            />
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 4 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(4)}
                text="French"
                isLoading={false}
                color={Colors.black2}
                startIcon={onboardingSvg.french}
                endIcon={isSelected == 4 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
            />
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 5 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(5)}
                text="German"
                isLoading={false}
                color={Colors.black2}
                startIcon={onboardingSvg.german}
                endIcon={isSelected == 5 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
            />
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 6 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(6)}
                text="Italian"
                isLoading={false}
                color={Colors.black2}
                startIcon={onboardingSvg.italian}
                endIcon={isSelected == 6 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
            />
        </View>
        <View style={styles.buttonContainer1}>
            <LargeButton
                underlayColor={Colors.bottomBarButtonBg1}
                style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == 7 && {borderColor: Colors.black2, borderWidth: 2}]}
                onPress={() => onSelect(7)}
                text="Portugese"
                isLoading={false}
                color={Colors.black2}
                endIcon={isSelected == 7 && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                startIcon={onboardingSvg.portugese}
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
            paddingBottom: 16,
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