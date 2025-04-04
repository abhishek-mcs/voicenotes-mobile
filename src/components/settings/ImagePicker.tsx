import { settingsSvg } from "assets/svg/settingsSvg"
import { useTheme } from "context/theme-context"
import { useMemo, useState } from "react"
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native"
import { SvgXml } from "react-native-svg"
import * as ExpoImagePicker from 'expo-image-picker'
import { useDialog } from "context/DialogContext"
import { uploadAvatar } from "queries/auth"

interface ImagePickerProps {
    caption: string;
    initialURL?: string;
    onChange: (path: string) => void;
    isAuthor: boolean
}

const ImagePicker = ({ caption, initialURL, onChange, isAuthor }: ImagePickerProps) => {
    const styles = useStyles()
    const { Colors, isLightMode } = useTheme()
    const { showDialog } = useDialog()
    const [image, setImage] = useState<string | undefined>(initialURL)
    const [working, setWorking] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)

    const pickImage = async () => {
        setShowOverlay(true)
        const permissionResult = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            showDialog('Access denied', 
                "You've refused to allow VoiceNotes to access your photos!",
                [],
                {userInterfaceStyle:isLightMode?"light":"dark"}
            );
            setShowOverlay(false)
            return;
        }

        let result = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if(!result.canceled) {
            setWorking(true)
            // Set the local image immediately for display
            setImage(result.assets[0].uri);
            
            try {
                let response = await uploadAvatar(result.assets[0].uri, isAuthor, isLightMode, showDialog);
                if (response) {
                    // We keep the local URI for display but pass the server path to parent
                    onChange(response.path);
                }
            } catch (error) {
                // If upload fails, reset the image
                setImage(initialURL);
                showDialog(
                    'Upload Failed', 
                    "Couldn't upload your photo. Please try again.",
                    [],
                    {userInterfaceStyle:isLightMode?"light":"dark"}
                );
            }
            setWorking(false)
        }
        setShowOverlay(false)
    }

    const renderContent = () => {
        if (working) {
            return (
                <View style={styles.picker}>
                    <ActivityIndicator color={Colors.askLogo} size="large" />
                </View>
            )
        }

        if (image) {
            return (
                <View style={styles.imageContainer}>
                    {imageLoading && (
                        <View style={[styles.picker, styles.loaderOverlay]}>
                            <ActivityIndicator color={Colors.askLogo} size="large" />
                        </View>
                    )}
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                </View>
            )
        }

        return (
            <View style={styles.picker}>
                <SvgXml xml={settingsSvg.upload.replace("black", Colors.text)} />
                <Text style={styles.status}>Upload</Text>
            </View>
        )
    }

    return (
        <Pressable style={styles.root} onPress={pickImage} disabled={working || showOverlay}>
            {renderContent()}
            <Text style={styles.status}>{caption}</Text>
        </Pressable>
    )
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
        },
        imageContainer: {
            width: 120,
            height: 120,
            marginBottom: 15,
            position: 'relative'
        },
        image: {
            width: '100%',
            height: '100%',
            borderRadius: 8
        },
        loaderOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0,
            zIndex: 1
        }
    }), [Colors])
}

export default ImagePicker