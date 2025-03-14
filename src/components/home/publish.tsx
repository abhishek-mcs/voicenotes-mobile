import { useTheme } from 'context';
import { useEffect, useMemo, useState } from 'react';
import { setStringAsync } from "expo-clipboard";
import { MAIN_URL } from "services/api/api-constants";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

interface PublishModalProps {
    slug: string | any;
    isPublished: boolean;
    onPressDone: () => void;
    onPressCancel: () => void;
    isNoteJustMadePrivate: boolean;
    setIsNoteJustMadePrivte: (x: boolean) => void;
} 

const Publish = ({
        slug = "",
        isPublished = false,
        onPressDone = () => {},
        onPressCancel = () => {},
        isNoteJustMadePrivate = false,
        setIsNoteJustMadePrivte = () => {},
    } : PublishModalProps) => {
    const styles = useStyles()
    const { Colors, isLightMode } = useTheme()
    const [copy, setCopy] = useState(false);

    const onCopy = async () => {
        setCopy(true);
        await setStringAsync(MAIN_URL + "/s/" + slug);
        setTimeout(() => {
          setCopy(false);
        }, 700);
    };

    useEffect(() => {
        console.log('Publish ',slug, isPublished, isNoteJustMadePrivate);
    },[])

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
                        <TouchableOpacity>
                            <Text style={styles.playIcon}>▶</Text>
                        </TouchableOpacity>
                        <Text style={styles.timer}>00:29</Text>
                    </View>

                    {/* Voice Note Text */}
                    <Text style={styles.voiceText}>
                        So first, the biggest news I got the job I interviewed for last week. Super excited about that, it's a huge opportunity and I can't wait to start next month. Definitely feeling a little nervous...
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
        backgroundColor: Colors.whiteWithOpacity(1),
        borderColor: Colors.darkWithOpacity(0.1),
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    browserHeader: {
        width: '67%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: Colors.whiteWithOpacity(1),
        borderBottomColor: Colors.darkWithOpacity(0.1),
        borderBottomWidth: 1
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
        fontSize: 13,
        fontFamily: 'Primary-Bold',
        color: Colors.grey5
    },
    voiceNoteContent: {
        padding: 16,
        backgroundColor: Colors.darkWithOpacity(0.05)
    },
    voiceTitle: {
        fontSize: 14,
        fontFamily: 'Primary-Bold',
        marginBottom: 8,
        color: Colors.text
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.darkWithOpacity(0.05),
        paddingVertical: 6,
        borderRadius: 22,
        paddingHorizontal: 12,
        marginBottom: 10,
        width: 88
    },
    playIcon: {
        color: Colors.darkWithOpacity(1),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        fontSize: 16,
    },
    timer: {
        fontSize: 14,
        fontFamily: 'Primary-Semibold',
    },
    voiceText: {
        fontSize: 12,
        lineHeight: 18,
        color: Colors.grey3,
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