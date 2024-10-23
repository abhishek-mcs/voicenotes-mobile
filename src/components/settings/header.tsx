import { Platform, StatusBar, StyleSheet, View } from "react-native";
import Colors from "assets/Colors";
import RecButton from "components/common/recording/rec-button";
import CircularLoader from "components/common/loaders/circular-loader";

type Props = {
    onCancel: () => void,
    onSubmit?: () => void,
    cancelLabel?: string,
    submitLabel?: string,
    label?: string,
    children?: React.ReactElement,
    working?: boolean
}

const Header: React.FC<Props> = (props) => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

    return (
        <View style={[styles.root, { paddingTop: statusBarHeight }]}>
            <View style={styles.header}>
                <View style={styles.action} >
                    <RecButton
                        title={props.cancelLabel || "Cancel"}
                        underlayColor={Colors.blackWithOpacity(0.2)}
                        style={{ width: 'auto',alignSelf:'flex-start', paddingHorizontal: 16,height:40}}
                        onPress={props.onCancel}
                    />
                </View>
                <View style={[styles.action, { alignItems: 'flex-end', justifyContent: props.working ? 'center' : 'flex-end', paddingHorizontal: props.working ? 20 : 10 }]} >
                    {props.onSubmit ? props.working ? <CircularLoader /> : <RecButton
                        title={props.submitLabel || "Save"}
                        underlayColor={Colors.blackWithOpacity(0.7)}
                        bgColor={Colors.blackWithOpacity(1)}
                        color={Colors.whiteWithOpacity(1)}
                        style={{ width: 'auto',alignSelf:'flex-end', paddingHorizontal: 15,height:40 }}
                        onPress={props.onSubmit}
                    />: null}
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
        justifyContent: 'flex-end',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    content: {
        flex: 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Header;