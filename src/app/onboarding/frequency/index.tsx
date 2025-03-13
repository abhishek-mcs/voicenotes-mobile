import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { useDispatch, useSelector } from 'react-redux'
import { setNoteTakingFrequency, setSelectedScreen } from 'redux/reducers/onboardingData'
import { RootState } from 'redux/store/store';

const Frequency = ({data}: any) => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const { note_taking_frequency } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<any>(note_taking_frequency !== null ? note_taking_frequency : null)

    const onSelect = async (num: number) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        setSelected(num)
        dispatch(setNoteTakingFrequency(num))
        if(num) {
            setTimeout(() => dispatch(setSelectedScreen(7)), 200);
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>How often do you take notes?</Text>
        </View>
        {data?.map((item:any) => (
            <View key={item.value} style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.bottomBarButtonBg1}
                    style={[styles.button, { backgroundColor: Colors.bottomBarButtonBg1 }, isSelected == item.value && {borderColor: Colors.black2, borderWidth: 2}]}
                    onPress={() => onSelect(item.value)}
                    text={item.label}
                    isLoading={false}
                    color={Colors.black2}
                    endIcon={isSelected == item.value && onboardingSvg.filledTick?.replace('black', Colors.black2)}
                />
            </View>
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
            marginTop: Platform.OS === 'ios' ? 0 : 40
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

export default Frequency