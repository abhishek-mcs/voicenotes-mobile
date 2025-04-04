import { commonSvg } from "assets/svg/commonSvg";
import { settingsSvg } from "assets/svg/settingsSvg";
import { useTheme } from "context/theme-context";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Pressable, Image } from "react-native"
import Svg, { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";

function Publish(): JSX.Element {
    const styles = useStyles()
    
    const { recordingList } = useSelector((state: RootState) => state.recordingStates);
    const { note_id } = useLocalSearchParams()

    const note = recordingList.find(item => item.id === note_id)

    const formatDuration = (ms: number): string => {
        const minutes = Math.floor(ms / 60000); // Convert to minutes
        const seconds = Math.floor((ms % 60000) / 1000); // Get remaining seconds
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const Publication = (): JSX.Element => {
        return <View style={styles.publication}>
            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    style={styles.avatar}
                    source={require('../../assets/images/landing3-dark.png')}
                />
            </View>
            <View style={{ flex: 4, justifyContent: 'center' }}>
                <Text style={styles.title}>Design & Beyond</Text>
                <Text style={styles.listens}>17.8k listens</Text>
            </View>
            <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.action}>
                    <Text style={styles.actionlabel}>Publish</Text>
                </Pressable>
            </View>
        </View>
    }
    
    return <View style={styles.container}>
        <View style={styles.previewBox}>
            <View style={styles.browserHeader}>
                <View style={styles.circleGroup}>
                    <View style={[styles.circle, { backgroundColor: '#FF5F57' }]} />
                    <View style={[styles.circle, { backgroundColor: '#FFBC2F' }]} />
                    <View style={[styles.circle, { backgroundColor: '#28C840' }]} />
                </View>
                <Text style={styles.browserTitle}>voicenotes.com</Text>
            </View>

            <View style={styles.voiceNoteContent}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.voiceTitle}>{note?.title}</Text>
                
                <View style={styles.audioPlayer}>
                    <TouchableOpacity>
                        <Text style={styles.playIcon}>▶</Text>
                    </TouchableOpacity>
                    <Text style={styles.timer}>{formatDuration(note?.duration)}</Text>
                </View>

                <Text numberOfLines={4} ellipsizeMode="tail" style={styles.voiceText}>{note?.transcript}</Text>
            </View>
        </View>

        <View style={styles.web}>
            <View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center' }}>
                <SvgXml xml={settingsSvg.upload} />
            </View>
            <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={styles.webHeader}>Publish to web</Text>
                <Text style={styles.webCaption}>Anyone with the link will have access to this voice note</Text>
            </View>
            <View style={{ flex: 2.2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, flexDirection: 'row', gap: 10 }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <SvgXml xml={commonSvg.greenTick} />
                    <Text style={styles.webPublished}>Published</Text>
                </View>
                <Pressable style={styles.more}>

                </Pressable>
                {/* <Pressable style={styles.action}>
                    <Text style={styles.actionlabel}>Publish</Text>
                </Pressable> */}
            </View>
        </View>
        <View style={styles.publications}>
            <Publication />
            <Publication />
        </View>
    </View>
}

const useStyles = () => {
  const { Colors, isLightMode } = useTheme();
  const screenWidth = Dimensions.get('screen').width
  return useMemo(() => StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 20
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
    web: {
        marginTop: 20,
        width: '100%',
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.greyWithOpacity(0.5),
        height: 100,
        flexDirection: 'row',
        backgroundColor: Colors.whiteWithOpacity(1),
        ...(isIOS ? {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.20,
            shadowRadius: 3.0,
        } : {
            elevation: 4,
        }),
    },
    webHeader: {
        fontFamily: 'Primary-Bold',
        color: Colors.text,
        fontSize: 15
    },
    webCaption: {
        fontFamily: 'Primary',
        fontSize: 13,
        color: Colors.text10
    },
    webPublished: {
        fontFamily: 'Primary-Medium',
        color: Colors.green2
    },
    more: {
        width: 25,
        height: 25,
        borderRadius: 100,
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: Colors.greyWithOpacity(0.2)
    },
    action: {
        padding: 10,
        backgroundColor: Colors.blackWithOpacity(1),
        borderRadius: 25,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionlabel: {
        fontFamily: 'Primary-Bold',
        color: Colors.whiteWithOpacity(1)
    },
    publications: {
        width: '100%'
    },
    publication: {
        width: '100%',
        height: 90,
        borderWidth: 0.5,
        borderColor: Colors.greyWithOpacity(0.5),
        marginTop: 15,
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: Colors.whiteWithOpacity(1),
        ...(isIOS ? {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.20,
            shadowRadius: 3.0,
        } : {
            elevation: 4,
        }),
    },
    title: {
        fontFamily: 'Primary-Bold',
        color: Colors.text,
        fontSize: 15
    },
    listens: {
        color: Colors.greyWithOpacity(1)
    },
    avatar: {
        height: 50,
        width: 50,
        resizeMode: 'contain'
    }
  }), [Colors])
}

export default Publish