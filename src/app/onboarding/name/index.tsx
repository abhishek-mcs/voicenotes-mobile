import { View, Text, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useMemo, useState } from 'react'
import * as Haptics from "expo-haptics";
import { TextField } from 'components/common/text-field'
import { TouchableWithoutFeedback } from 'react-native'
import { setName, setSelectedScreen } from 'redux/reducers/onboardingData'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'redux/store/store';

const Name = () => {
    const styles = useStyles()
    const {Colors}=useTheme()
    const dispatch = useDispatch();
    const { name } = useSelector((state: RootState) => state.onboardingData);
    const [username, setUsername] = useState<string>(name ? name : '')
    const [error, setError] = useState<any>('')

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        if(username && username.length > 0) {
            dispatch(setName(username))
            dispatch(setSelectedScreen(17))
        } else {
            setError('Please enter a valid name.')
        }
    }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.mainContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.mainText}>Enter your name</Text>
                </View>

                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <TextField
                      style={{marginTop:0,flexDirection:'column'}}
                      inputStyle={{ height: 48, color:Colors.text, borderRadius: 16, borderWidth: 0, backgroundColor:Colors.bgColor7 }}
                      value={username}
                      returnKeyType="go"
                      textContentType="emailAddress"
                      onSubmitEditing={onContinue}
                      onChangeText={(text) => {
                        setUsername(text)
                        setError(null)
                      }}
                      placeholder="Your name"
                      placeholderTextColor={Colors.grey3}
                      autoComplete="name"
                      autoCapitalize="none"
                      autoFocus={true}
                    />
                    {error && error.length > 0 && (
                    <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8}}>{error}</Text>
                    )}
                </View>

                <View style={styles.footerContainer}>
                    <View style={styles.buttonContainer1}>
                        <LargeButton
                            underlayColor={Colors.settingsBtnBg}
                            style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                            onPress={onContinue}
                            text="Continue"
                            isLoading={false}
                            color={Colors.text4}
                        />
                    </View> 
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 48,
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
            paddingTop: 12,
        },
        button: {
            height:48,
            justifyContent:'center',
            alignItems:'center',
            borderRadius:16,
            flexDirection:'row',
        },
        footerContainer: {
            position: 'absolute',
            bottom: 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Name