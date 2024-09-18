import { StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import RecButton from "components/common/recording/rec-button";
import Colors from "assets/Colors";
import { useSaveSettings } from "queries/settings";
import { setUserDetail } from "redux/reducers/userDetails";
import { getLanguageCode } from "utils/common";

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
}
const About: React.FC<Props> = (props) => {

    const { userDetails, lang }:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()
    const saveSettings = useSaveSettings()
    
    const [about, setAbout] = useState(userDetails.settings?.about || '');

    const handleSubmit = () => {
      const settings = userDetails.settings
      dispatch(setUserDetail({ ... userDetails, about}))
      saveSettings.mutate({
        language: getLanguageCode(lang) || '',
        about,
        remember_words:settings?.remember_words||[],
        name: userDetails?.name,
        fix_punctuation:settings?.fix_punctuation,
      })
    }
  
    return (
      <Header
        onCancel={props.onClose}
        label="About"
      >
        <View style={styles.root}>
          <Text style={styles.description}>What would you like your AI to know about you?</Text>
          <TextField
            value={about}
            onValueChange={value => setAbout(value)}
            multiline
          />
          <RecButton
            title="Save"
            onPress={handleSubmit}
            underlayColor={Colors.blackWithOpacity(0.7)}
            style={{ paddingHorizontal: 15 }}
            bgColor="#000"
            color="#fff"
          />
        </View>
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

export default About
