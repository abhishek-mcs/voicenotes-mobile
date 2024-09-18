import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState } from "react"
import { home } from "assets/svg/home"
import RecButton from "components/common/recording/rec-button";
import { SvgXml } from "react-native-svg"
import { RootState } from "redux/store/store"
import { useDispatch, useSelector } from "react-redux"
import { useSaveSettings } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import { getLanguageCode } from "utils/common"

const Name: React.FC<{ name: string; onClose: (name: string) => void }> = ({ name, onClose }) => {
    return (
      <View style={styles.name}>
        <Text style={styles.label}>{name}</Text>
        <Pressable style={styles.icon} onPress={() => onClose(name)}>
          <SvgXml xml={home.close} />
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

    const [name, setName] = useState('');
    const [namesList, setNamesList] = useState<string[]>(userDetails.settings?.remember_words || []);

    const updateNames = (names: string[]) => {
      const settings = userDetails.settings;

      setNamesList(names)
      dispatch(setUserDetail({ ... userDetails, remember_words: names}))
      saveSettings.mutate({
        language: getLanguageCode(lang) || '',
        about: settings?.about,
        remember_words: names,
        name: userDetails?.name,
        fix_punctuation:settings?.fix_punctuation,
      })
    }
  
    const addName = () => {
      if (name.trim()) {
        const updatedNames = [...namesList, name.trim()];
        updateNames(updatedNames);
        setName(''); // Clear the input field
      }
    }
  
    const removeName = (nameToRemove: string) => {
      const updatedNames = namesList.filter(name => name !== nameToRemove);
      updateNames(updatedNames);
    }
  
    return (
      <Header
        onCancel={props.onClose}
        label="Names to remember"
      >
        <View style={styles.root}>
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
              bgColor="#000"
              color="#fff"
              style={{ paddingHorizontal: 20 }}
            />
          </View>
          <View style={styles.names}>
            {namesList.map((name, index) => (
              <Name key={`${name}-${index}`} name={name} onClose={removeName} />
            ))}
          </View>
        </View>
      </Header>
    );
};

const width = Dimensions.get('window').width;
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
        width: width,
        paddingHorizontal: 10,
        height: '80%',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 20,
    },
    name: {
        backgroundColor: "#2222220D",
        padding: 10,
        maxHeight: 40,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    label: {
        fontSize: 15
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Names
