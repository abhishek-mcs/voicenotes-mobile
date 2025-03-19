import { View, Text, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useTheme } from "context"
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'redux/store/store'
import { SvgXml } from 'react-native-svg'
import { settingsSvg } from 'assets/svg/settingsSvg'
import { OTPInput } from 'components/auth/otp-input'
import LargeButton from 'components/LargeButton'
import { useRouter } from 'expo-router'
import { screenHeight } from 'utils/common'
import { useVerifyEmail } from 'queries/auth'
import { useQueryClient } from 'react-query'
import { setEmailVerified } from 'redux/reducers/onboardingData'

type Props = {
    onClose: () => void,
    onOpen: boolean
}

const VerifyEmail: React.FC<Props> = (props) => {
    const styles = useStyles()
    const {Colors}=useTheme()
    const router=useRouter()
    const dispatch = useDispatch();
    const queryClient=useQueryClient()
    const verifyEmail = useVerifyEmail()
    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [otpText, setOTP] = useState('------')
    const [errorText, setErrorText] = useState('')
    const errorContent='Sorry, the code you have entered is invalid.'

    useEffect(() => {
        console.log( props.onOpen, 'called');
        if(props.onOpen) {
            handleSubmit(true)
        }
    },[props.onOpen])

    const verifyOtp = () => {
        if (otpText == "") {
          setErrorText(errorContent)
        } else handleSubmit(false)
    }

    const  handleSubmit = (getOtp:boolean) => {
        const payload = getOtp ? {} : { otp: otpText}
        if (otpText != "") {
            verifyEmail.mutate(
                payload,
                {
                    onSuccess: async (response: any, _variables: any, _context: any) => {
                      console.log('Verify email ',response);
                      queryClient.invalidateQueries('user-data')
                      dispatch(setEmailVerified(true))
                      if(!getOtp) {
                        router.back()
                      }
                    },
                    onError: (error: any) => {
                        console.log('Verify email ',error)
                        setErrorText("The code you entered is wrong.")
                    }
                }
            )
        }
    }

  return (
    <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
            <TouchableHighlight onPress={props.onClose} underlayColor={Colors.grey10} style={{ width: 'auto', alignSelf: 'flex-start', paddingHorizontal: 16, height: 40, backgroundColor: Colors.bottomBarButtonBg1, borderRadius: 16, alignItems: "center", justifyContent:'center', marginTop: 30, marginLeft: 16 }}>
                <Text style={{ color: Colors.bottomBarText1, fontFamily: "Primary-Semibold", fontSize: 14 }}>Back</Text>
            </TouchableHighlight>
            <View style={styles.root}>
                <View style={{ alignItems: 'center' }}>
                    <SvgXml xml={settingsSvg.verifyEmail?.replace('black', Colors.black2)} />
                </View>
                <Text style={styles.heading}>Verify your email</Text>
                <Text style={styles.description}>We just sent a 6-digit code to</Text>
                <Text style={styles.description}>{userDetails?.email}, enter it below:</Text>
                {props.onOpen && <OTPInput
                    numberOfInputs={6}
                    onChange={(v)=>{setOTP(v);errorText?.length!=0&&setErrorText("")}}
                    otpValue={otpText}
                    errorText={errorText}
                />}
                <View style={[styles.buttonContainer, styles.footerContainer]}>
                    <LargeButton
                        underlayColor={Colors.settingsBtnBg}
                        style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                        onPress={verifyOtp}
                        text="Done"
                        color={Colors.text4}
                    />
                    <TouchableHighlight onPress={() => handleSubmit(true)}>
                        <Text style={styles.blueButton}>Resend email</Text>
                    </TouchableHighlight>
                </View>
            </View>
            </View>
        </TouchableWithoutFeedback>
    </View>
  )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: screenHeight/8
    },
    heading: {
      fontFamily: 'Primary-Bold',
      fontSize: 24,
      textAlign: 'center',
      color: Colors.blackWithOpacity(1),
      paddingVertical: 16
    },
    description: {
        fontFamily: "Primary",
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        color: Colors.blackWithOpacity(0.8)
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        // width: '100%',
        gap: 30
    },
    blueButton: {
        fontSize: 16,
        fontFamily: 'Primary-Semibold',
        color: Colors.blue,
    },
    button: {
        height:48,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:16,
        flexDirection:'row',
    },
    footerContainer: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 50,
        right: 0,
        left: 0
    }
  }), [Colors]); // Recreate styles when Colors change
};

export default VerifyEmail