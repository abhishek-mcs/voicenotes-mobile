import { ReviewSvg } from "assets/svg/ReviewSvg";
import { useTheme } from "context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

type Props = {
    onClose: () => void,
    visible: boolean
}
const Review: React.FC<Props> = ({ onClose, visible }: Props) => {

    const router = useRouter()
    const styles = useStyles()
    
    const onNegativeFeedback = () => {
        onClose()
        setTimeout(() => {
            router.push("/review/")
        }, 100)
    }

    const onPositiveFeedback = () => {
        try{
            Linking.openURL(isIOS ? `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id6483293628?action=write-review` : `market://details?id=com.app.voicenotes&showAllReviews=true`)
        } catch {
            Linking.openURL(isIOS ? `https://apps.apple.com/app/apple-store/id6483293628?action=write-review` : `https://play.google.com/store/apps/details?id=com.app.voicenotes&showAllReviews=true`)
        }
        onClose()
    }

    const Action = ({ yes, onPress }: { yes?: boolean, onPress: () => void }) => {
        return <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.action,
                    { borderRightWidth: !yes ? 0.3 : 0 },
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
                    <Action onPress={onNegativeFeedback} />
                    <Action yes onPress={onPositiveFeedback} />
                </View>
            </View>
        </View>
    </Modal>
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgColor10(0.5),
        justifyContent: 'center',
        alignItems: 'center'
    },
    box: {
        backgroundColor: Colors.bgColor16,
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
        borderColor: Colors.grey5WithOpacity(1),
        flexDirection: 'row'
    },
    heading: {
        fontFamily: 'Primary-Medium',
        color: Colors.text,
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
        backgroundColor: Colors.blackWithOpacity(0.1),
    },
    label: {
        color: Colors.blue,
        fontWeight: '600',
        fontSize: 14
    }
}), [Colors]); // Recreate styles when Colors change
};

export default Review;