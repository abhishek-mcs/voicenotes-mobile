import { Alert, Dimensions, Pressable, StyleSheet, View } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from "react"
import { uploadDP } from "queries/auth"
import ImageBackground from "components/common/ImageBackground"
import CircularLoader from "components/common/loaders/circular-loader"
import { SvgXml } from "react-native-svg"
import { commonSvg } from "assets/svg/commonSvg"

type Props = {
    url?: string,
    onChange: (newURI: string) => void
}
const ProfilePic: React.FC<Props> = ({ url, onChange }) => {

    const [image, setImage] = useState(url)
    const [working, setWorking] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const [imageError, setImageError] = useState(false);

    const pickImage = async () => {
        setShowOverlay(true)
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Access denied', "You've refused to allow VoiceNotes to access your photos!");
            setShowOverlay(false)
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 1,
        });

        if(!result.canceled) {
            setWorking(true)
            let newURI = await uploadDP(result.assets[0].uri);
            setImage(newURI);
            onChange(newURI);
            setWorking(false)
        }
        setShowOverlay(false)
    }

    const renderContent = () => {
        if (working) {
            return <CircularLoader color="#bfbfbf" />;
        }

        if (!image || imageError) {
            return (
                <View style={styles.fallbackContainer}>
                    <SvgXml xml={commonSvg.profileIcon} width={80} height={80} />
                </View>
            );
        }

        return null;
    }

    return (
        <View style={styles.root}>
            <View style={[styles.container, { backgroundColor: image && !imageError ? "rgba(0,0,0,0.1)" : "transparent" }]}>
                <Pressable style={styles.button} onPress={pickImage}>
                    {image && !imageError ? (
                        <ImageBackground
                            uri={image}
                            style={styles.image}
                            imageStyle={{ borderRadius: 100 }}
                            onError={() => setImageError(true)}
                        >
                            {renderContent()}
                        </ImageBackground>
                    ) : (
                        renderContent()
                    )}
                    {showOverlay && (
                        <View style={styles.overlay}>
                            <SvgXml xml={commonSvg.camera} width={35} height={35} />
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}


const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
    root: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    container: {
        width: width/3.5,
        height: width/3.5,
        borderRadius: width/3.5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow:'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    fallbackContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width/3.5,
    },
})

export default ProfilePic