import { Alert, StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { changePassword } from "queries/auth";

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
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Change password</Text>
        <Text style={styles.description}>Please choose a strong password to secure your VoiceNotes account</Text>
        {props.isPasswdSet && <TextField
          value={props.old}
          onValueChange={props.onOldChange}
          placeholder="Old password"
        />}
        <TextField
          value={props.defaulT}
          onValueChange={props.onDefaultChange}
          placeholder="New password"
        />
        <TextField
          value={props.confirm}
          onValueChange={props.onConfirmChange}
          placeholder="Confirm password"
        />
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

    const handleOldChange = useCallback((value: string) => setOld(value), []);
    const handleDefaultChange = useCallback((value: string) => setDefault(value), []);
    const handleConfirmChange = useCallback((value: string) => setConfirm(value), []);

    const handleSubmit = () => {
        if(defaulT !== confirm) Alert.alert('Oops!', "These passwords don't match.");
        else {
            if(!userDetails.is_password_set) changePassword(defaulT, confirm, true)
            else changePassword(defaulT, confirm, false, old)
        }
    }
  
    return (
      <Input
        component={
            <Component
              isPasswdSet={userDetails.is_password_set}
              old={old}
              onOldChange={handleOldChange}
              defaulT={defaulT}
              onDefaultChange={handleDefaultChange}
              confirm={confirm}
              onConfirmChange={handleConfirmChange} 
            />
        }
        onCancel={props.onClose}
        onSubmit={handleSubmit}
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
    heading: {
        fontFamily: 'Primary-Bold',
        fontSize: 20,
        textAlign: 'center'
    },
    description: {
        fontFamily: "Primary",
        fontSize: 15,
        textAlign: 'center'
    }
})

export default Password
