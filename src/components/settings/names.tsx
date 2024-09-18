import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import Header from "./header"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { home } from "assets/svg/home"
import RecButton from "components/common/recording/rec-button";
import { SvgXml } from "react-native-svg"
import { RootState } from "redux/store/store"
import { useSelector } from "react-redux"

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
  
interface ComponentProps {
    value: string;
    defaults?: string[];
    onValueChange: (value: string) => void;
    onNamesChange: (names: string[]) => void;
    onSubmit: () => void
}
  
const Component: React.FC<ComponentProps> = ({ value, defaults, onValueChange, onNamesChange, onSubmit }) => {
    const [names, setNames] = useState<string[]>(defaults || []);
  
    const addName = useCallback(() => {
      if (value.trim()) {
        const updatedNames = [...names, value.trim()];
        setNames(updatedNames);
        onNamesChange(updatedNames);
        onValueChange(''); // Clear the input field
      }
      onSubmit();
    }, [value, names, onNamesChange, onValueChange]);
  
    const removeName = useCallback((nameToRemove: string) => {
      const updatedNames = names.filter(name => name !== nameToRemove);
      setNames(updatedNames);
      onNamesChange(updatedNames);
    }, [names, onNamesChange]);
  
    return (
      <View style={styles.root}>
        <Text style={styles.description}>Add words that are unique to you to avoid misspellings during transcription.</Text>
        <View style={styles.controls}>
          <TextField
            value={value}
            onValueChange={onValueChange}
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
          {names.map((name, index) => (
            <Name key={`${name}-${index}`} name={name} onClose={removeName} />
          ))}
        </View>
      </View>
    );
};

type Props = {
    onClose: () => void
    onSubmit: (names: string[]) => void
}
  
const Names: React.FC<Props> = (props) => {

    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const [name, setName] = useState('');
    const [namesList, setNamesList] = useState<string[]>(userDetails.settings?.remember_words || []);
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    const handleNamesChange = useCallback((names: string[]) => {
      setNamesList(names);
    }, []);
  
    return (
      <Header
        onCancel={props.onClose}
        label="Names to remember"
      >
        <Component 
            value={name} 
            defaults={userDetails.settings?.remember_words || []}
            onValueChange={handleValueChange} 
            onNamesChange={handleNamesChange}
            onSubmit={() => props.onSubmit(namesList)}
          />
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
