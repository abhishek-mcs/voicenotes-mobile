import { Alert, Dimensions, Pressable, StyleSheet, View } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import { useState } from "react"
import { uploadDP } from "queries/auth"
import ImageBackground from "components/common/ImageBackground"

type Props = {
    url: string,
    onChange: (newURI: string) => void
}
const ProfilePic: React.FC<Props> = ({ url, onChange }) => {

    const [image, setImage] = useState(url)

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Access denied', "You've refused to allow VoiceNotes to access your photos!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 1,
        });

        if(!result.canceled) {
            let newURI = await uploadDP(result.assets[0].uri);
            setImage(newURI);
            onChange(newURI)
        }
    }

    return <View style={styles.root}>
        <View style={styles.container}>
            <ImageBackground
                uri={image}
                style={styles.image}
                imageStyle={{ borderRadius: 100 }}
            >
                <Pressable style={styles.button} onPress={pickImage} />
            </ImageBackground>
        </View>
    </View>
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
        backgroundColor: "rgba(0,0,0,0.1)"
    },
    image: {
        width: '100%',
        height: '100%',
    },
    button: {
        flex: 1
    }
})

export default ProfilePic