import { StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"

interface ComponentProps {
    name: string;
    onValueChange: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ name, onValueChange }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Display name</Text>
        <Text style={styles.description}>Your display name is what appears in your VoiceNotes account</Text>
        <TextField
          value={name}
          onValueChange={onValueChange}
          placeholder="Name"
        />
      </View>
    );
  };

type Props = {
    onClose: () => void
}
const Name: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [name, setName] = useState(userDetails?.name || '');
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    return (
      <Input
        component={<Component name={name} onValueChange={handleValueChange} />}
        onCancel={props.onClose}
        onSubmit={props.onClose}
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

export default Name
