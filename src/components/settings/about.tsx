import { StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useMemo, useState } from "react"
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useSaveSettings } from "queries/settings";
import { setUserDetail } from "redux/reducers/userDetails";
import { getLanguageCode } from "utils/common";
import { useTheme } from "context";

type Props = {
    onClose: () => void,
}
const About: React.FC<Props> = (props) => {

    const { userDetails, lang }:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()
    const saveSettings = useSaveSettings()
    
    const [about, setAbout] = useState(userDetails.settings?.about || '');
    const [working, setWorking] = useState(false)
    const styles = useStyles()

    const handleSubmit = async () => {
      setWorking(true)
      const settings = userDetails.settings
      await saveSettings.mutateAsync({
        language: getLanguageCode(lang) || '',
        about,
        remember_words:settings?.remember_words||[],
        name: userDetails?.name,
        fix_punctuation:settings?.fix_punctuation,
      })
      dispatch(setUserDetail({ ... userDetails, about}))
      setWorking(false)
      props.onClose()
    }
  
    return (
      <Header
        onCancel={props.onClose}
        onSubmit={handleSubmit}
        working={working}
        label="About"
      >
        <View style={styles.root}>
          <Text style={styles.heading}>About</Text>
          <Text style={styles.description}>What would you like your AI to know about you?</Text>
          <TextField
            value={about}
            onValueChange={value => setAbout(value)}
            multiline
          />
        </View>
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
        color:Colors.blackWithOpacity(1)
    }
  }), [Colors]); // Recreate styles when Colors change
};

export default About
