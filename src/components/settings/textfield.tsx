import { TextInput, Dimensions } from "react-native"

type Props = {
    value: string,
    onValueChange: (value: string) => void,
    placeholder?: string,
    multiline?: boolean,
    notPassword?: boolean
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
            paddingTop: 15, // paddingVertical doesn't work with multiline
            paddingBottom: 15, // see https://github.com/facebook/react-native/issues/21720#issuecomment-515286499
            paddingHorizontal: 20,
            borderRadius: 10,
            fontSize: 15,
            minHeight: props.multiline ? 150 : 40
        }}
        multiline={props.multiline || false}
        secureTextEntry={props.notPassword || false}
    />
}

export default TextField
