import { StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { useSaveSettings } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import { getLanguageCode } from "utils/common"
import { useTheme } from "context"

type Props = {
    onClose: () => void
}
const Name: React.FC<Props> = (props) => {

    const { userDetails, lang }:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()
    const saveSettings = useSaveSettings()
    
    const [name, setName] = useState(userDetails?.name || '');
    const [working, setWorking] = useState(false)
    const styles = useStyles()

    const handleSubmit = async() => {
      setWorking(true)
      const settings = userDetails.settings
      await saveSettings.mutateAsync({
        language: getLanguageCode(lang) || '',
        about:settings?.about,
        remember_words:settings?.remember_words||[],
        name,
        fix_punctuation:settings?.fix_punctuation,
      })
      dispatch(setUserDetail({ ... userDetails, name}))
      setWorking(false)
      props.onClose()
    }
  
    return (
      <Header
        onCancel={props.onClose}
        onSubmit={handleSubmit}
        working={working}
        label="Display name"
      >
        <View style={styles.root}>
          <Text style={styles.heading}>Display Name</Text>
          <Text style={styles.description}>Your display name is what appears in your VoiceNotes account</Text>
          <TextField
            value={name}
            onValueChange={value => setName(value)}
            placeholder="Name"
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

export default Name
