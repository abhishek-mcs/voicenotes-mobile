import { StyleSheet, View, Text, Pressable } from "react-native";
import { commonSvg } from "assets/svg/commonSvg";
import { SvgXml } from "react-native-svg";

type Props = {
    onCancel: () => void,
    label?: string,
    children?: React.ReactElement
}

const Header: React.FC<Props> = (props) => {
    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={props.onCancel} style={styles.action} >
                    <SvgXml height={18} width={18} xml={commonSvg.back} />
                    <Text style={{
                        fontFamily: 'Primary-Medium',
                        fontSize: 16,
                        textAlign: 'center'
                    }}>Back</Text>
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
            <View style={styles.content}>{props.children}</View>
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
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    action: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    content: {
        flex: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Header;
