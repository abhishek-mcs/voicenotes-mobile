import { Alert, StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import Colors from "assets/Colors"
import RecButton from "components/common/recording/rec-button"
import { changeEmail } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"

interface ComponentProps {
  value: string;
  email: string,
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  isOTP: boolean
}

const EmailInput: React.FC<ComponentProps> = ({ value, email, onValueChange, onSubmit, isOTP }) => {
  return (
    <View style={styles.root}>
      <Text style={styles.description}>
        {isOTP ?
          "Enter the OTP you just received in this email address."
          : "We'll send an email to your new address with instructions on how to complete the change."  
        }
      </Text>
      <TextField
        value={value}
        onValueChange={onValueChange}
        placeholder={isOTP ? "Enter OTP" : "Enter new email"}
      />
      <View style={styles.action}>
        <RecButton
          title={isOTP ? "Confirm" : "Send"}
          underlayColor={Colors.blackWithOpacity(0.7)}
          bgColor="#000"
          color="#fff"
          style={{ flex: 1, paddingHorizontal: 15 }}
          onPress={onSubmit}
        />
      </View>
      <Text style={styles.footer}>Current email is {email}</Text>
    </View>
  );
};

type Props = {
    onClose: () => void
}
const Email: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [showOTP, setShowOTP] = useState(false)

    const dispatch = useDispatch()
    
    const handleOTPSubmit = async () => {
      try {
        await changeEmail(email, otp)
        dispatch(setUserDetail({...userDetails, email}))
        Alert.alert("Email updated", `Your email address has been updated to ${email}.`)
        props.onClose()
      } catch {}
    }

    const handleEmailSubmit = async () => {
      try {
        await changeEmail(email)
        setShowOTP(true)
      } catch(e) {
        Alert.alert('Uh oh', "Voicenotes ran into an error trying to change your email. Please try again later.")
      }
    }

    const handleEmailChange = useCallback((value: string) => { setEmail(value); }, [])
    const handleOTPChange = useCallback((value: string) => { setOTP(value); }, [])

    return (
      <Input
        component={
          <EmailInput
            isOTP={showOTP} 
            value={email} 
            email={userDetails?.email || ''} onValueChange={showOTP ? handleOTPChange : handleEmailChange} 
            onSubmit={showOTP ? handleOTPSubmit : handleEmailSubmit} 
          />
        }
        label="Change Email"
        onCancel={props.onClose}
      />
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 50,
        paddingVertical: 60,
        gap: 10
    },
    description: {
        fontFamily: "Primary",
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10,
    },
    action: {
      width: '100%',
      height: 50
    },
    footer: {
      fontFamily: "Primary",
      fontSize: 13,
      textAlign: 'center',
    }
})

export default Email
