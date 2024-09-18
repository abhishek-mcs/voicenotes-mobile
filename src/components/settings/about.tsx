import { StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { RootState } from "redux/store/store";
import { useSelector } from "react-redux";
import RecButton from "components/common/recording/rec-button";
import Colors from "assets/Colors";

interface ComponentProps {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
}

const Component: React.FC<ComponentProps> = ({ value, onValueChange, onSubmit }) => {
    return (
      <View style={styles.root}>
        <Text style={styles.description}>What would you like your AI to know about you?</Text>
        <TextField
          value={value}
          onValueChange={onValueChange}
          multiline
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
    onSubmit: (about: string) => void
}
const About: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [about, setAbout] = useState(userDetails.settings?.about || '');
  
    const handleValueChange = useCallback((value: string) => {
      setAbout(value);
    }, []);
  
    return (
      <Input
        component={<Component value={about} onValueChange={handleValueChange} onSubmit={() => props.onSubmit(about)} />}
        onCancel={props.onClose}
        label="About"
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
        textAlign: 'center'
    }
})

export default About
