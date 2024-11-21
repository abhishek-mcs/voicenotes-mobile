import CircularLoader from "components/common/loaders/circular-loader";
import { useTheme } from "context";
import { useRouter } from "expo-router";
import { submitReview } from "queries/settings";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, View, Text, TextInput, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isIOS } from "utils/common";

const Review = () => {

    const insets = useSafeAreaInsets()
    const router = useRouter()

    const [review, setReview] = useState('')
    const [working, setWorking] = useState(false)
    const { Colors, isLightMode } = useTheme()
    const styles = useStyles()

    const onSubmit = async () => {
        if(!review) {
            Alert.alert('Just your honest opinion', 'Please write a few thoughts about voicenotes. It really helps us improve your experience.',[],{userInterfaceStyle:isLightMode?"light":"dark"})
            return
        }

        setWorking(true)
        try {
            await submitReview(review)
            Alert.alert('Got it!', "Thanks for your feedback! This really means a lot & we'll be sure to listen to this opinion for future releases.",[],{userInterfaceStyle:isLightMode?"light":"dark"})
        } catch (error) {
            console.error(`Error submitting review: ${JSON.stringify(error)}`)
            Alert.alert('Oops!', "There was a problem submitting your review. Please try again next time this pops up.",[],{userInterfaceStyle:isLightMode?"light":"dark"})
        }
        setWorking(false)
        router.back()
    }

    const Action: React.FC<{ label: string, onPress?: () => void }> = ({ label, onPress }) => {
        return <Pressable onPress={onPress} style={styles.action}>
            <Text style={styles.actionLabel}>{label}</Text>
        </Pressable> 
    }
    return <SafeAreaView style={{ flex: 1, paddingTop: isIOS ? 0 : insets.top, backgroundColor:Colors.bgColor8 }}>
        <View style={styles.header}>
            <Action onPress={() => router.back()} label="Cancel" />
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Write a review</Text>
            </View>
            <Action onPress={onSubmit} label="Send" />
        </View>
        <View style={styles.content}>
            <TextInput
                placeholder="Tell us your problems with the app..."
                multiline
                autoFocus
                value={review}
                onChangeText={text => setReview(text)}
                style={styles.field}
                placeholderTextColor={Colors.grey6}
            />
        </View>
        <Modal visible={working} transparent
        >
            <View style={{ flex: 1, backgroundColor: Colors.blackWithOpacity(0.5), justifyContent: 'center', alignItems: 'center' }}>
                <CircularLoader />
            </View>
        </Modal>
    </SafeAreaView>
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        borderColor: Colors.border,
        borderBottomWidth: 1
    },
    action: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionLabel: {
        color: Colors.blue,
        fontWeight: '600',
        fontSize: 16
    },
    labelContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        fontWeight: '600',
        fontSize: 18,
        color:Colors.text
    },
    content: {
        flex: 12,
        padding: 20,
    },
    field: {
        width: '100%',
        fontSize: 14,
        color:Colors.text
    }
}), [Colors]); // Recreate styles when Colors change
};

export default Review;
