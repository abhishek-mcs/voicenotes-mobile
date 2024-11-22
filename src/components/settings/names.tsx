import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useMemo, useState } from "react"
import { home } from "assets/svg/home"
import RecButton from "components/common/recording/rec-button";
import { SvgXml } from "react-native-svg"
import { RootState } from "redux/store/store"
import { useDispatch, useSelector } from "react-redux"
import { useSaveSettings } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import { getLanguageCode } from "utils/common"
import { useTheme } from "context"

const Name: React.FC<{ name: string; onClose: (name: string) => void }> = ({ name, onClose }) => {
  const styles = useStyles()
    return (
      <View style={styles.name}>
        <Text style={styles.label}>{name}</Text>
        <Pressable style={styles.icon} onPress={() => onClose(name)}>
          <SvgXml xml={home.smallClose} />
        </Pressable>
      </View>
    );
};

type Props = {
    onClose: () => void
}
  
const Names: React.FC<Props> = (props) => {

    const { userDetails, lang }:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()
    const saveSettings = useSaveSettings()
    const { Colors } = useTheme()
    const styles = useStyles()

    const [name, setName] = useState('');
    const [namesList, setNamesList] = useState<string[]>(userDetails.settings?.remember_words || []);
    const [working, setWorking] = useState(false)

    const updateNames = () => {
      const settings = userDetails.settings;
      setWorking(true)
      
      dispatch(setUserDetail({ ... userDetails, remember_words: namesList}))
      saveSettings.mutate({
        language: getLanguageCode(lang) || '',
        about: settings?.about,
        remember_words: namesList,
        name: userDetails?.name,
        fix_punctuation:settings?.fix_punctuation,
      })
      setWorking(false)
      props.onClose()
    }
  
    const addName = () => {
      if (name.trim()) {
        const updatedNames = [...namesList, name.trim()];
        setNamesList(updatedNames)
        setName(''); // Clear the input field
      }
    }
  
    const removeName = (nameToRemove: string) => {
      const updatedNames = namesList.filter(name => name !== nameToRemove);
      setNamesList(updatedNames)
    }
  
    return (
      <Header
        onCancel={props.onClose}
        onSubmit={updateNames}
        label="Names to remember"
        working={working}
      >
        <View style={styles.root}>
          <Text style={styles.heading}>Names to remember</Text>
          <Text style={styles.description}>Add words that are unique to you to avoid misspellings during transcription.</Text>
          <View style={styles.controls}>
            <TextField
              value={name}
              onValueChange={text => setName(text)}
              placeholder="Enter the name"
            />
            <RecButton
              onPress={addName}
              title="Add"
              bgColor={Colors.settingsBtnBg}
              color={Colors.settingsBtnText}
              style={{ paddingHorizontal: 20 }}
              underlayColor={Colors.settingsBtnBg}
            />
          </View>
          <ScrollView>
          <View style={styles.names}>
            {namesList.map((name, index) => (
              <Name key={`${name}-${index}`} name={name} onClose={removeName} />
            ))}
          </View>
          </ScrollView>
        </View>
      </Header>
    );
};

const width = Dimensions.get('window').width;
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
    },
    controls: { 
        width: width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10
    },
    names: {
        paddingHorizontal:12,
        height: '80%',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 20,
    },
    name: {
        backgroundColor: Colors.inputBg2,
        paddingHorizontal: 14,
        paddingVertical:8,
        maxHeight: 40,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    label: {
        fontSize: 15,
        color:Colors.blackWithOpacity(1)
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center'
    }
  }), [Colors]); // Recreate styles when Colors change
};

export default Names
