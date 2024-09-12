import { TextInput, Dimensions } from "react-native"

type Props = {
    value: string,
    onValueChange: (value: string) => void,
    placeholder?: string,
    multiline?: boolean
}
const TextField: React.FC<Props> = (props) => {

    const width = Dimensions.get('window').width

    return <TextInput
        placeholder={props.placeholder || ''}
        value={props.value}
        onChangeText={text => props.onValueChange(text)}
        style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            width: props.multiline ? width / 1.3 :  width / 2,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 10,
            fontSize: 15,
            minHeight: props.multiline ? 150 : 40
        }}
        multiline={props.multiline || false}
    />
}

export default TextField
