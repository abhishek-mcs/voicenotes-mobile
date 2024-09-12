import { StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"

interface ComponentProps {
    value: string;
    onValueChange: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ value, onValueChange }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Email</Text>
        <Text style={styles.description}>This is the email linked to your VoiceNotes account, used for registration & communication.</Text>
        <TextField
          value={value}
          onValueChange={onValueChange}
          placeholder="Email"
        />
      </View>
    );
  };

type Props = {
    onClose: () => void
}
const Email: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [name, setName] = useState(userDetails?.email || '');
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    return (
      <Input
        component={<Component value={name} onValueChange={handleValueChange} />}
        onCancel={props.onClose}
        onSubmit={props.onClose}
        submitLabel="Change"
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

export default Email
