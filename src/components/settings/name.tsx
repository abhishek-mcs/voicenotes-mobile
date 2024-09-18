import { StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import RecButton from "components/common/recording/rec-button"
import Colors from "assets/Colors"

interface ComponentProps {
    name: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void
}

const Component: React.FC<ComponentProps> = ({ name, onValueChange, onSubmit }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.description}>Your display name is what appears in your VoiceNotes account</Text>
        <TextField
          value={name}
          onValueChange={onValueChange}
          placeholder="Name"
        />
        <RecButton
          title="Save"
          onPress={onSubmit}
          underlayColor={Colors.blackWithOpacity(0.7)}
          style={{ paddingHorizontal: 15 }}
          bgColor="#000"
          color="#fff"
        />
      </View>
    );
  };

type Props = {
    onClose: () => void,
    onSubmit: (name: string) => void
}
const Name: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [name, setName] = useState(userDetails?.name || '');
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    return (
      <Header
        onCancel={props.onClose}
        label="Display name"
      >
        <Component name={name} onValueChange={handleValueChange} onSubmit={() => props.onSubmit(name)} />
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
    description: {
        fontFamily: "Primary",
        fontSize: 15,
        textAlign: 'center'
    }
})

export default Name
