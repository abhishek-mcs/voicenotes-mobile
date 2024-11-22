import { Platform, StatusBar, StyleSheet, View } from "react-native";
import RecButton from "components/common/recording/rec-button";
import CircularLoader from "components/common/loaders/circular-loader";
import { useTheme } from "context";
import { useMemo } from "react";

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
    const { Colors } = useTheme()
    const styles = useStyles()

    return (
        <View style={[styles.root, { paddingTop: statusBarHeight }]}>
            <View style={styles.header}>
                <View style={styles.action} >
                    <RecButton
                        title={props.cancelLabel || "Cancel"}
                        underlayColor={Colors.bottomBarButtonBg1}
                        style={{ width: 'auto',alignSelf:'flex-start', paddingHorizontal: 16,height:40}}
                        onPress={props.onCancel}
                        bgColor={Colors.bottomBarButtonBg1}
                        color={Colors.bottomBarText1}
                    />
                </View>
                <View style={[styles.action, { alignItems: 'flex-end', justifyContent: props.working ? 'center' : 'flex-end', paddingHorizontal: props.working ? 20 : 10 }]} >
                    {props.onSubmit ? props.working ? <CircularLoader /> : <RecButton
                        title={props.submitLabel || "Save"}
                        underlayColor={Colors.bottomBarButtonBg}
                        bgColor={Colors.settingsBtnBg}
                        color={Colors.settingsBtnText}
                        style={{ width: 'auto',alignSelf:'flex-end', paddingHorizontal: 15,height:40 }}
                        onPress={props.onSubmit}
                    />: null}
                </View>
            </View>
            <View style={styles.content}>{props.children}</View>
        </View>
    )
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
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
}), [Colors]); // Recreate styles when Colors change
};

export default Header;