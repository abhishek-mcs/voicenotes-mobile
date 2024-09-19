import { StyleSheet, View } from "react-native";
import Colors from "assets/Colors";
import RecButton from "components/common/recording/rec-button";

type Props = {
    onCancel: () => void,
    onSubmit?: () => void,
    cancelLabel?: string,
    submitLabel?: string,
    label?: string,
    children?: React.ReactElement
}

const Header: React.FC<Props> = (props) => {
    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View style={styles.action} >
                    <RecButton
                        title={props.cancelLabel || "Cancel"}
                        underlayColor={Colors.blackWithOpacity(0.2)}
                        style={{ flex: 1, paddingHorizontal: 10 }}
                        onPress={props.onCancel}
                    />
                </View>
                <View style={{ flex: 3 }} />
                <View style={styles.action} >
                    {props.onSubmit && <RecButton
                        title={props.submitLabel || "Save"}
                        underlayColor={Colors.blackWithOpacity(0.7)}
                        bgColor="#000"
                        color="#fff"
                        style={{ flex: 1, paddingHorizontal: 15 }}
                        onPress={props.onSubmit}
                    />}
                </View>
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
    action: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    content: {
        flex: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Header;
