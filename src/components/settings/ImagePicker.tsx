import { settingsSvg } from "assets/svg/settingsSvg"
import { useTheme } from "context/theme-context"
import { useMemo } from "react"
import { View, Text, StyleSheet } from "react-native"
import { SvgXml } from "react-native-svg"

const ImagePicker = ({ caption }: {caption: string}) => {
    const styles = useStyles()
    const { Colors } = useTheme()

    return <View style={styles.root}>
        <View style={styles.picker}>
            <SvgXml xml={settingsSvg.upload.replace("black", Colors.text)}></SvgXml>
            <Text style={styles.status}>Upload</Text>
        </View>
        <Text style={styles.status}>{caption}</Text>
    </View>
}

const useStyles = () => {
    const { Colors } = useTheme()
    
    return useMemo(() => StyleSheet.create({
        root: {
            height: 250,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        picker: {
            backgroundColor: Colors.bottomBarButtonBg1,
            paddingHorizontal: 50,
            paddingVertical: 60,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
            borderWidth: 1.5,
            borderStyle: 'dotted',
            borderColor: Colors.text,
            borderRadius: 8
        },
        status: {
            color: Colors.text,
            fontFamily: 'Primary'
        }
    }), [Colors])
}

export default ImagePicker;
