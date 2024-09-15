import { StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import Colors from "assets/Colors"
import RecButton from "components/common/recording/rec-button"

interface ComponentProps {
    value: string;
    email: string,
    onValueChange: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ value, email, onValueChange }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Change email</Text>
        <Text style={styles.description}>We'll send an email to your new address with instructions on how to complete the change.</Text>
        <TextField
          value={value}
          onValueChange={onValueChange}
          placeholder="Enter new email"
        />
        <View style={styles.action}>
          <RecButton
            title={"Change"}
            underlayColor={Colors.blackWithOpacity(0.7)}
            bgColor="#000"
            color="#fff"
            style={{ flex: 1, paddingHorizontal: 15 }}
            onPress={() => {}}
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
    const [name, setName] = useState('');
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    return (
      <Input
        component={<Component value={name} email={userDetails?.email || ''} onValueChange={handleValueChange} />}
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
    heading: {
        fontFamily: 'Primary-Bold',
        fontSize: 20,
        textAlign: 'center'
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
