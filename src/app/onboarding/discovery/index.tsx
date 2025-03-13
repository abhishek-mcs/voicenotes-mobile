import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native'
import LargeButton from 'components/Largebutton'
import { useTheme } from "context"
import { useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { useDispatch, useSelector } from 'react-redux'
import { setReferrer, setSelectedScreen } from 'redux/reducers/onboardingData'
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { RootState } from 'redux/store/store';

const Discovery = ({data}: any) => {
    const styles = useStyles()
    const {Colors} = useTheme()
    const dispatch = useDispatch();
    const { referrer } = useSelector((state: RootState) => state.onboardingData);
    const [isSelected, setSelected] = useState<any>(referrer !== null ? referrer : null)

    const onSelect = async (num: number) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        setSelected(num)
        dispatch(setReferrer(num))
        if(num) {
            setTimeout(() => dispatch(setSelectedScreen(3)), 100);
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>How did you hear about Voicenotes?</Text>
        </View>
        {data?.map((item: any) => (
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
            paddingBottom: 4,
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

export default Discovery