import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, View, Text, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isIOS } from "utils/common";

const Review = () => {

    const insets = useSafeAreaInsets()
    const router = useRouter()

    const Action: React.FC<{ label: string, onPress?: () => void }> = ({ label, onPress }) => {
        return <Pressable onPress={onPress} style={styles.action}>
            <Text style={styles.actionLabel}>{label}</Text>
        </Pressable> 
    }
    return <SafeAreaView style={{ flex: 1, paddingTop: isIOS ? 0 : insets.top }}>
        <View style={styles.header}>
            <Action onPress={() => router.back()} label="Cancel" />
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Write a review</Text>
            </View>
            <Action label="Send" />
        </View>
        <View style={styles.content}>
            <TextInput
                placeholder="Tell us your problems with the app..."
                multiline
                autoFocus
                style={styles.field}
            />
        </View>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        borderColor: "#DDDDDD",
        borderBottomWidth: 1
    },
    action: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionLabel: {
        color: "#007AFF",
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
        fontSize: 18
    },
    content: {
        flex: 12,
        padding: 20,
    },
    field: {
        width: '100%',
        fontSize: 14
    }
})

export default Review;
