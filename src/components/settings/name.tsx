import { StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import RecButton from "components/common/recording/rec-button"
import Colors from "assets/Colors"
import { useSaveSettings } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import { getLanguageCode } from "utils/common"

type Props = {
    onClose: () => void
}
const Name: React.FC<Props> = (props) => {

    const { userDetails, lang }:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()
    const saveSettings = useSaveSettings()
    
    const [name, setName] = useState(userDetails?.name || '');

    const handleSubmit = () => {
      const settings = userDetails.settings
      dispatch(setUserDetail({ ... userDetails, name}))
      saveSettings.mutate({
        language: getLanguageCode(lang) || '',
        about:settings?.about,
        remember_words:settings?.remember_words||[],
        name,
        fix_punctuation:settings?.fix_punctuation,
      })
    }
  
    return (
      <Header
        onCancel={props.onClose}
        label="Display name"
      >
        <View style={styles.root}>
          <Text style={styles.description}>Your display name is what appears in your VoiceNotes account</Text>
          <TextField
            value={name}
            onValueChange={value => setName(value)}
            placeholder="Name"
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

export default Name
