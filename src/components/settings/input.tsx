import { StyleSheet, View, Text, Pressable } from "react-native";
import RecButton from "components/common/recording/rec-button";
import Colors from "assets/Colors";
import { commonSvg } from "assets/svg/commonSvg";
import { SvgXml } from "react-native-svg";

type Props = {
    onCancel: () => void,
    label?: string,
    component: React.ReactElement
}

const Input: React.FC<Props> = (props) => {
    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={props.onCancel} style={styles.action} >
                    <SvgXml xml={commonSvg.back} />
                </Pressable>
                <View style={styles.heading} >
                    <Text style={{
                        fontFamily: 'Primary-Bold',
                        fontSize: 20,
                        textAlign: 'center'
                    }}>{props.label || ''}</Text>
                </View>
                <View style={styles.action} />
            </View>
            <View style={styles.content}>{props.component}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    header: {
        flex: 1,
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    heading: {
        flex: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    action: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 0,
    },
    content: {
        flex: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Input;
