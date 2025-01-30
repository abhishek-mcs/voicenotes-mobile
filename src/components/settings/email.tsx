import { Alert, StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import RecButton from "components/common/recording/rec-button"
import { changeEmail } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import CircularLoader from "components/common/loaders/circular-loader"
import { useTheme } from "context"
import { useDialog } from "context/DialogContext"

interface ComponentProps {
  value: string;
  email: string,
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  isOTP: boolean,
  working?: boolean
}

const EmailInput: React.FC<ComponentProps> = ({ value, email, onValueChange, onSubmit, isOTP, working }) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Email</Text>
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
        {working ? <CircularLoader /> : <RecButton
          title={isOTP ? "Confirm" : "Send"}
          underlayColor={Colors.blackWithOpacity(0.7)}
          bgColor={Colors.settingsBtnBg}
          color={Colors.settingsBtnText}
          style={{ flex: 1, paddingHorizontal: 15 }}
          onPress={onSubmit}
        />}
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
    const [showOTP, setShowOTP] = useState(false);
    const [working, setWorking] = useState(false);
    const {isLightMode} = useTheme()
    const {showDialog} = useDialog()

    const dispatch = useDispatch()
    
    const handleOTPSubmit = async () => {
      setWorking(true)
      try {
        await changeEmail(email, otp)
        dispatch(setUserDetail({...userDetails, email}))
        showDialog("Email updated", `Your email address has been updated to ${email}.`,[],{userInterfaceStyle:isLightMode?"light":"dark"})
        props.onClose()
      } catch {}
      setWorking(false)
    }

    const handleEmailSubmit = async () => {
      setWorking(true)
      try {
        await changeEmail(email)
        setShowOTP(true)
      } catch(e) {
        showDialog('Uh oh', "Voicenotes ran into an error trying to change your email. Please try again later.",[],{userInterfaceStyle:isLightMode?"light":"dark"})
      }
      setWorking(false)
    }

    const handleEmailChange = useCallback((value: string) => { setEmail(value); }, [])
    const handleOTPChange = useCallback((value: string) => { setOTP(value); }, [])

    return (
      <Header
        onCancel={props.onClose}
      >
        <EmailInput
          isOTP={showOTP} 
          value={showOTP ? otp : email} 
          email={userDetails?.email || ''} onValueChange={showOTP ? handleOTPChange : handleEmailChange} 
          onSubmit={showOTP ? handleOTPSubmit : handleEmailSubmit} 
          working={working}
        />
      </Header>
    );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 50,
        paddingVertical: 60,
        gap: 10
    },
    heading: {
      fontFamily: 'Primary-Bold',
      fontSize: 20,
      textAlign: 'center',
      color:Colors.blackWithOpacity(1)
    },
    description: {
        fontFamily: "Primary",
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10,
        color:Colors.blackWithOpacity(1)
    },
    action: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    footer: {
      fontFamily: "Primary",
      fontSize: 13,
      textAlign: 'center',
      color:Colors.blackWithOpacity(1)
    }
  }), [Colors]); // Recreate styles when Colors change
};

export default Email
