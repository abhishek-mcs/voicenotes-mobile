import { Platform, StatusBar, StyleSheet, View, Text, ViewStyle } from "react-native";
import RecButton from "components/common/recording/rec-button";
import CircularLoader from "components/common/loaders/circular-loader";
import { useTheme } from "context";
import { useMemo } from "react";
import React from "react";

type Props = {
    onCancel: () => void,
    onSubmit?: () => void,
    cancelLabel?: string,
    submitLabel?: string,
    label?: string,
    children?: React.ReactElement,
    working?: boolean,
    style?: ViewStyle
}

const Header = React.memo<Props>((props) => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
    const { Colors } = useTheme()
    const styles = useStyles()

    return (
        <View style={[styles.root, { paddingTop: statusBarHeight }, props.style]}>
            <View style={styles.header}>
                <View style={styles.action} >
                    <ActionButton
                        title={props.cancelLabel || "Cancel"}
                        onPress={props.onCancel}
                        style={{ width: 'auto',alignSelf:'flex-start', paddingHorizontal: 16,height:40}}
                        working={props.working}
                    />
                </View>
                {props.label && <View style={{flex:2,alignItems:'center', justifyContent:'center'}}>
                    <Text style={styles.label}>{props.label}</Text>
                    </View>}
                <View style={[styles.action, { alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: props.working ? 20 : 10 }]} >
                    {props.onSubmit ? props.working ? <CircularLoader /> : <ActionButton
                        title={props.submitLabel || "Save"}
                        onPress={props.onSubmit}
                        style={{ width: 'auto',alignSelf:'flex-end', paddingHorizontal: 15,height:40 }}
                    />: null}
                </View>
            </View>
            <View style={styles.content}>{props.children}</View>
        </View>
    )
})

const ActionButton = React.memo<{
  title: string,
  onPress: () => void,
  style?: ViewStyle,
  working?: boolean
}>(({ title, onPress, style, working }) => {
  const { Colors } = useTheme();
  
  if (working) return <CircularLoader />;
  
  return (
    <RecButton
      title={title}
      underlayColor={Colors.grey10}
      style={[{ width: 'auto', alignSelf: 'flex-start', paddingHorizontal: 16, height: 40 }, style]}
      onPress={onPress}
      bgColor={Colors.bottomBarButtonBg1}
      color={Colors.bottomBarText1}
    />
  );
});

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    root: { 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: Colors.bgColor1
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
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    label: {
        fontFamily:'Primary-Medium',
        fontSize:16,
        color:Colors.blackWithOpacity(1),
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