import { Alert, StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"

interface ComponentProps {
    defaulT: string; // ending T is to satisfy type checker
    onDefaultChange: (value: string) => void;
    confirm: string;
    onConfirmChange: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ defaulT, confirm, onDefaultChange, onConfirmChange }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Change password</Text>
        <Text style={styles.description}>Please choose a strong password to secure your VoiceNotes account</Text>
        <TextField
          value={defaulT}
          onValueChange={onDefaultChange}
          placeholder="New password"
        />
        <TextField
          value={confirm}
          onValueChange={onConfirmChange}
          placeholder="Confirm password"
        />
      </View>
    );
  };

type Props = {
    onClose: () => void,
}
const Password: React.FC<Props> = (props) => {

    const [defaulT, setDefault] = useState('')
    const [confirm, setConfirm] = useState('')

    const handleDefaultChange = useCallback((value: string) => {
      setDefault(value);
    }, []);

    const handleConfirmChange = useCallback((value: string) => {
        setConfirm(value);
    }, []);

    const handleSubmit = () => {
        if(defaulT !== confirm) Alert.alert('Oops!', "These passwords don't match.");
        else {
            
        }
    }
  
    return (
      <Input
        component={
            <Component 
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
