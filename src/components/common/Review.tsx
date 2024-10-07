import { Image, Modal, StyleSheet, Text, View } from "react-native";

const Review = () => {
    return <Modal
        transparent
        visible
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
                <View style={styles.actions}></View>
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
        width: '65%',
        height: '25%'
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
        borderRadius: 10, // Adjust this value to change the border radius
    },
    image: {
        width: '100%',
        height: '100%',
    },
    actions: {
        flex: 1
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
    }
})

export default Review;