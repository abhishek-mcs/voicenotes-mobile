import { ReviewSvg } from "assets/svg/ReviewSvg";
import { useRouter } from "expo-router";
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as StoreReview from 'expo-store-review'

type Props = {
    onClose: () => void,
    visible: boolean
}
const Review: React.FC<Props> = ({ onClose, visible }: Props) => {

    const router = useRouter()
    
    const onNegativeFeedback = () => {
        onClose()
        setTimeout(() => {
            router.push("/review/")
        }, 100)
    }

    const onPositiveFeedback = () => {
        StoreReview.requestReview()
            .then(() => {})
            .catch((e) => {
                console.error(e)
                const url = StoreReview.storeUrl();
                if(url) Linking.openURL(url);
            })
        onClose()
    }

    const Action = ({ yes, onPress }: { yes?: boolean, onPress: () => void }) => {
        return <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.action,
                    { borderRightWidth: yes ? 0.3 : 0 },
                    pressed && styles.actionPressed
                ]}
            >
            <SvgXml xml={yes ? ReviewSvg.yes : ReviewSvg.no} />
            <Text style={styles.label}>{yes ? 'Yes' : 'No'}</Text>
        </Pressable>
    }

    return <Modal
        transparent
        visible={visible}
    >
        <View style={styles.root}>
            <View style={styles.box}>
                <View style={styles.logo}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/images/icon.jpg')}
                            resizeMode="cover"
                            style={styles.image}
                        />
                    </View>
                    <Text style={styles.heading}>Enjoying the app?</Text>
                    <Text style={styles.subtext}>Tell us your experience</Text>
                </View>
                <View style={styles.actions}>
                    <Action yes onPress={onPositiveFeedback} />
                    <Action onPress={onNegativeFeedback} />
                </View>
            </View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    box: {
        backgroundColor: '#D8D8D8',
        borderRadius: 16,
        width: 280,
        height: 250
    },
    logo: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        padding: 50
    },
    imageContainer: {
        width: '38%',
        height: '65%',
        overflow: 'hidden',
        borderRadius: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    actions: {
        flex: 1.5,
        borderTopWidth: 0.3,
        borderColor: '#3C3C43',
        flexDirection: 'row'
    },
    heading: {
        fontFamily: 'Primary-Medium',
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15
    },
    subtext: {
        fontFamily: 'Primary-Medium',
        color: 'grey',
        fontSize: 14,
        fontWeight: '400'
    },
    action: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    actionPressed: {
        opacity: 0.8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    label: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14
    }
})

export default Review;