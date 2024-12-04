import { Alert, StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { changePassword } from "queries/auth";
import RecButton from "components/common/recording/rec-button";
import { screenWidth } from "utils/common";
import Colors from "assets/Colors";

interface ComponentProps {
    isPasswdSet: boolean,
    old: string;
    onOldChange: (value: string) => void;
    defaulT: string; // ending T is to satisfy type checker
    onDefaultChange: (value: string) => void;
    confirm: string;
    onConfirmChange: (value: string) => void;
}

const Component: React.FC<ComponentProps> = (props) => {

  const [show, setShow] = useState(false)
  const toggleShow = () => {
    setShow(!show)
  }
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Change password</Text>
        <Text style={styles.description}>Please choose a strong password to secure your VoiceNotes account</Text>
        {props.isPasswdSet && <TextField
          value={props.old}
          onValueChange={props.onOldChange}
          placeholder="Old password"
          notPassword={!show}
        />}
        <TextField
          value={props.defaulT}
          onValueChange={props.onDefaultChange}
          placeholder="New password"
          notPassword={!show}
        />
        <TextField
          value={props.confirm}
          onValueChange={props.onConfirmChange}
          placeholder="Confirm password"
          notPassword={!show}
        />
        <View style={styles.show}>
        <RecButton
          title={show ? "Hide" : "Show"}
          onPress={toggleShow}
          underlayColor={Colors.blackWithOpacity(0.7)}
          bgColor="#000"
          color="#fff"
        />
        </View>
      </View>
    );
  };

type Props = {
    onClose: () => void,
}
const Password: React.FC<Props> = (props) => {

    const { userDetails }: any = useSelector((state: RootState) => state.userDetails);

    const [old, setOld] = useState('')
    const [defaulT, setDefault] = useState('')
    const [confirm, setConfirm] = useState('')
    const [working, setWorking] = useState(false)

    const handleOldChange = useCallback((value: string) => setOld(value), []);
    const handleDefaultChange = useCallback((value: string) => setDefault(value), []);
    const handleConfirmChange = useCallback((value: string) => setConfirm(value), []);

    const handleSubmit = async() => {
        if(defaulT !== confirm) Alert.alert('Oops!', "These passwords don't match.");
        else {
          setWorking(true)
          try{
            if(!userDetails.is_password_set) await changePassword(defaulT, confirm, true)
            else await changePassword(defaulT, confirm, false, old)
            Alert.alert('Changed!', "Your password has been changed. You can now use it to log in.")
            handleClose()
          } catch(e: any) {
            Alert.alert('Oops!', e.message.replace(/\s*\([^)]*\)\s*$/, ''))
          }
          setWorking(false)
        }
    }

    const handleClose = () => {
      setOld('')
      setDefault('')
      setConfirm('')
      props.onClose()
    }
  
    return (
      <Header
        label="Change password"
        onCancel={handleClose}
        onSubmit={handleSubmit}
        working={working}
      >
        <Component
          isPasswdSet={userDetails.is_password_set}
          old={old}
          onOldChange={handleOldChange}
          defaulT={defaulT}
          onDefaultChange={handleDefaultChange}
          confirm={confirm}
          onConfirmChange={handleConfirmChange}
        />
      </Header>
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
    heading: {
      fontFamily: 'Primary-Bold',
      fontSize: 20,
      textAlign: 'center'
    },
    description: {
        fontFamily: "Primary",
        fontSize: 15,
        textAlign: 'center'
    },
    show: {
      marginTop: 10,
      width: screenWidth/4
    }
})

export default Password
