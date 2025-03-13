import { useTheme } from 'context';
import { useMemo, useState } from 'react';
import { setStringAsync } from "expo-clipboard";
import { MAIN_URL } from "services/api/api-constants";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

interface PublishModalProps {
    visible: boolean;
    hideModal: () => void;
    isPublished: boolean;
    isLoading: boolean;
    slug: string | any;
    onPressDone: () => void;
    onPressCancel: () => void;
    isNoteJustMadePrivate: boolean;
    setIsNoteJustMadePrivte: (x: boolean) => void;
}
  

const Publish = ({
        visible,
        hideModal = () => {},
        isLoading = false,
        slug = "",
        onPressDone = () => {},
        onPressCancel = () => {},
        isNoteJustMadePrivate = false,
        setIsNoteJustMadePrivte = () => {},
    } : PublishModalProps) => {
    const styles = useStyles()
    const { Colors, isLightMode } = useTheme()
    const [isPublished, setPublished] = useState(true)
    const [copy, setCopy] = useState(false);

    const onCopy = async () => {
        setCopy(true);
        await setStringAsync(MAIN_URL + "/s/" + slug);
        setTimeout(() => {
          setCopy(false);
        }, 700);
    };

    return (
        <View style={styles.container}>
            {/* Title & Subtitle */}
            {isPublished ? <View><Text style={styles.title}>Your note is public</Text></View> : <Text style={styles.title}>Publish to web</Text>}
            <Text style={styles.subtitle}>Anyone with the link will have access to this voice note.</Text>

            {/* Voice Note Preview Box */}
            <View style={styles.previewBox}>
                {/* Fake Browser Header */}
                <View style={styles.browserHeader}>
                    <View style={styles.circleGroup}>
                        <View style={[styles.circle, { backgroundColor: '#FF5F57' }]} />
                        <View style={[styles.circle, { backgroundColor: '#FFBC2F' }]} />
                        <View style={[styles.circle, { backgroundColor: '#28C840' }]} />
                    </View>
                    <Text style={styles.browserTitle}>voicenotes.com</Text>
                </View>

                {/* Voice Note Content */}
                <View style={styles.voiceNoteContent}>
                    <Text style={styles.voiceTitle}>Life Updates, Random Thoughts & Plans</Text>
                    
                    {/* Play Button + Timer */}
                    <View style={styles.audioPlayer}>
                        <TouchableOpacity style={styles.playButton}>
                            <Text style={styles.playIcon}>▶</Text>
                        </TouchableOpacity>
                        <Text style={styles.timer}>00:29</Text>
                    </View>

                    {/* Voice Note Text */}
                    <Text style={styles.voiceText}>
                        So first, the biggest news I got the job I interviewed for last week. 
                        Super excited about that, it’s a huge opportunity and I can’t wait to start next month. 
                        Definitely feeling a little nervous...
                    </Text>
                </View>
            </View>

            {/* Publish Button */}
            {isPublished ? 
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.copyLinkButton}>
                    <Text style={styles.copyLinkText}>Copy link</Text>
                </TouchableOpacity> 
                <View>
                    <Text style={styles.unpublishText}>Unpublish</Text>
                </View>
            </View>
            : <TouchableOpacity style={styles.publishButton}>
                <Text style={styles.publishText}>Publish</Text>
            </TouchableOpacity> 
            }
        </View>
    );
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 25,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 14,
        fontFamily: 'Primary-Semibold',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Primary',
        color: Colors.grey3,
        marginBottom: 32,
        textAlign: 'center',
    },
    previewBox: {
        width: '100%',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    browserHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#EAEAEA',
    },
    circleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 3,
    },
    browserTitle: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    voiceNoteContent: {
        padding: 16,
    },
    voiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        padding: 8,
        borderRadius: 8,
        width: 100,
        marginBottom: 10,
    },
    playButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    playIcon: {
        color: 'white',
        fontSize: 12,
    },
    timer: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    voiceText: {
        fontSize: 14,
        color: 'gray',
    },
    publishButton: {
        marginTop: 24,
        width: '100%',
        backgroundColor: Colors.askLogo,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: 'center',
    },
    publishText: {
        color: Colors.bgColor8,
        fontSize: 14,
        fontFamily: 'Primary-Semibold'
    },
    buttonContainer: {
        width: '100%',
        marginTop: 24,
        alignItems: 'center',
    },
    copyLinkButton: {
        width: '100%',
        backgroundColor: Colors.blackWithOpacity(0.05),
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
    },
    copyLinkText: {
        fontSize: 14,
        fontFamily: 'Primary-Semibold',
        color: Colors.askLogo
    },
    unpublishText: {
        fontSize: 14,
        color: Colors.redWithOpacity(1),
        paddingVertical: 18,
        fontFamily: 'Primary-Medium',
    }
}), [Colors]); 
}

export default Publish