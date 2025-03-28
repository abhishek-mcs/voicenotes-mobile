import { useTheme } from 'context';
import { useEffect, useMemo, useState } from 'react';
import { setStringAsync } from "expo-clipboard";
import { MAIN_URL } from "services/api/api-constants";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SvgXml } from 'react-native-svg';
import * as Haptics from "expo-haptics";
import { commonSvg } from 'assets/svg/commonSvg';
import { screenWidth } from 'utils/common';
import { useUnpublishRecording } from 'queries/home/share';
import { useQueryClient } from 'react-query';
import { set } from '@react-native-firebase/database';
import CircularLoader from 'components/common/loaders/circular-loader';

interface PublishModalProps {
    slug?: string | any;
    isPublished?: boolean;
} 

const Publish = ({
        slug = "",
        isPublished,
    } : PublishModalProps) => {
    const styles = useStyles()
    const { Colors } = useTheme()
    const [copy, setCopy] = useState(false);
    const [loading, setLoading] = useState(false)
    const [published, setPublished] = useState(isPublished??false)
    const publishRecording = useUnpublishRecording()
    const queryClient = useQueryClient();

    const onPublish = () => {
        setLoading(true)
        publishRecording.mutate(
          { id: slug },
          {
            onSuccess: async (data: any) => {
              try {
                setLoading(false)
                setPublished(data.data.recording.is_published)
                await queryClient.invalidateQueries("published-recordings");
                await queryClient.invalidateQueries("all-recording");
                await queryClient.invalidateQueries("single-recording");
              } catch (e) {
                console.log("error in publish recording", e);
              } finally {
                setLoading(false)
              }
            }
          }
        )
      }
    

    const onCopy = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        setCopy(true);
        await setStringAsync(MAIN_URL + "/s/" + slug);
        setTimeout(() => {
          setCopy(false);
        }, 700);
    };

    return (
        <View style={styles.container}>
            {/* Title & Subtitle */}
            {published ? 
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <SvgXml style={{ marginTop: 4 }} xml={commonSvg.greenTick} />
                    <Text style={styles.title}>Your note is public</Text>
                </View> : 
                <Text style={styles.title}>Publish to web</Text>
            }
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
            {published ? 
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onCopy} style={styles.copyLinkButton}>
                    <SvgXml xml={commonSvg.link?.replace("black", Colors.askLogo)} />
                    <Text style={styles.copyLinkText}>Copy link</Text>
                </TouchableOpacity> 
                <TouchableOpacity onPress={onPublish}>
                    <Text style={styles.unpublishText}>Unpublish</Text>
                </TouchableOpacity>
            </View>
            : <TouchableOpacity onPress={onPublish} style={styles.publishButton}>
                {loading ? <CircularLoader /> : <Text style={styles.publishText}>Publish</Text>}
            </TouchableOpacity> 
            }
        </View>
    );
}

const useStyles = () => {
  const { Colors, isLightMode } = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 25,
        paddingHorizontal: 20,
        backgroundColor: isLightMode ? Colors.white1 : Colors.darkWithOpacity(0.2),
    },
    title: {
        fontSize: 16,
        fontFamily: 'Primary-Semibold',
        marginBottom: 6,
        color: Colors.black2
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
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: isLightMode ? Colors.whiteWithOpacity(1) : Colors.darkWithOpacity(0.7),
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
        paddingRight: screenWidth/3.5,
        color: isLightMode ? Colors.grey5 : Colors.black2
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
        backgroundColor: isLightMode ? Colors.darkWithOpacity(0.05) : Colors.darkWithOpacity(0.7),
        paddingVertical: 6,
        borderRadius: 22,
        paddingHorizontal: 12,
        marginBottom: 10,
        width: 88
    },
    playIcon: {
        color: Colors.black2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        fontSize: 16,
    },
    timer: {
        fontSize: 14,
        fontFamily: 'Primary-Semibold',
        color: Colors.black2,
    },
    voiceText: {
        fontSize: 12,
        lineHeight: 18,
        color: isLightMode ? Colors.grey3 : Colors.black2,
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
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.blackWithOpacity(0.05),
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
        gap: 6,
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