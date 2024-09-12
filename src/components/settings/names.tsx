import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import Input from "./input"
import TextField from "./textfield"
import { useState, useCallback } from "react"
import { home } from "assets/svg/home"
import RecButton from "components/common/recording/rec-button";
import { SvgXml } from "react-native-svg"

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
    onValueChange: (value: string) => void;
    onNamesChange: (names: string[]) => void;
}
  
const Component: React.FC<ComponentProps> = ({ value, onValueChange, onNamesChange }) => {
    const [names, setNames] = useState<string[]>([]);
  
    const addName = useCallback(() => {
      if (value.trim()) {
        const updatedNames = [...names, value.trim()];
        setNames(updatedNames);
        onNamesChange(updatedNames);
        onValueChange(''); // Clear the input field
      }
    }, [value, names, onNamesChange, onValueChange]);
  
    const removeName = useCallback((nameToRemove: string) => {
      const updatedNames = names.filter(name => name !== nameToRemove);
      setNames(updatedNames);
      onNamesChange(updatedNames);
    }, [names, onNamesChange]);
  
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Names to remember</Text>
        <Text style={styles.description}>Add words that are unique to you to avoid misspellings during transcription.</Text>
        <View style={styles.controls}>
          <TextField
            value={value}
            onValueChange={onValueChange}
            placeholder="Enter the name"
          />
          <RecButton
            onPress={addName}
            title="Done"
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
}
  
const Names: React.FC<Props> = (props) => {
    const [name, setName] = useState('');
    const [namesList, setNamesList] = useState<string[]>([]);
  
    const handleValueChange = useCallback((value: string) => {
      setName(value);
    }, []);
  
    const handleNamesChange = useCallback((names: string[]) => {
      setNamesList(names);
    }, []);
  
    return (
      <Input
        component={
          <Component 
            value={name} 
            onValueChange={handleValueChange} 
            onNamesChange={handleNamesChange}
          />
        }
        onCancel={props.onClose}
        onSubmit={() => {
          // You can do something with namesList here before closing
          props.onClose();
        }}
      />
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
    heading: {
        fontFamily: 'Primary-Bold',
        fontSize: 20,
        textAlign: 'center'
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
