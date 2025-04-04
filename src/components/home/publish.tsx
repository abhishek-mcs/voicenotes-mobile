import * as Haptics from 'expo-haptics'
import { commonSvg } from "assets/svg/commonSvg";
import { home } from "assets/svg/home";
import { settingsSvg } from "assets/svg/settingsSvg";
import { useTheme } from "context/theme-context";
import { useLocalSearchParams } from "expo-router";
import { publishNotetoPage, publishPublicly, unPublishNoteFromPage } from "queries/share";
import { useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Pressable, Image, ActivityIndicator } from "react-native"
import { SvgXml } from "react-native-svg";
import MoreOptions from 'components/common/more-options';
import { MenuOptionsType } from "components/common/more-options/menu-props";
import { useDispatch, useSelector } from "react-redux";
import { updateRecordingDetails } from "redux/reducers/recordingStates";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import { setStringAsync } from "expo-clipboard";
import { MAIN_URL } from 'services/api/api-constants';
import formatBigNumber from 'utils/formatBigNumber';

function Publish(): JSX.Element {
    const styles = useStyles()
    const { Colors } = useTheme()
    const { recordingList } = useSelector((state: RootState) => state.recordingStates);
    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    const { note_id } = useLocalSearchParams()
    const dispatch = useDispatch()

    const note = recordingList.find(item => item.id === note_id)

    const [isPublic, setPublic] = useState<boolean>(note?.is_published);
    const [buffering, setBuffering] = useState<boolean>(false)

    const moreOptionsRef = useRef<{ show: () => void; hide: () => void } | null>(null);

    const formatDuration = (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const togglePublic = async () => {
        setBuffering(true)
        try {
            await publishPublicly(note?.id);
            dispatch(updateRecordingDetails({
                recordingId: note?.id,
                data: {
                    is_published: !isPublic
                }
            }))
            setPublic(prev => !prev)
        } catch(error) {
            console.error(error)
        } finally { setBuffering(false) }
    }

    const onCopy = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        await setStringAsync(MAIN_URL + "/s/" + note?.id);
    };

    const menuOptions: MenuOptionsType[] = [
        {
            title: "Copy link",
            onPress: onCopy,
            androidIcon: "content-copy"
        },
        {
            title: "Unpublish",
            onPress: () => {
                if (!buffering) {
                    togglePublic();
                }
            },
            androidIcon: "close-circle-outline"
        }
    ];

    const Publication = ({ title, image, listens, disabled, slug, id }: { title: string, image: string, listens: number, disabled: boolean, slug: string, id: number }): JSX.Element => {

        const [published, setPublished] = useState<boolean>(note?.publication_ids.includes(id))
        const [working, setWorking] = useState<boolean>(false)
        const [imageLoading, setImageLoading] = useState<boolean>(false)

        const onChangePublish = async () => {
            setWorking(true)
            try{
                if(published) {
                    await unPublishNoteFromPage(note?.id, slug)
                    setPublished(false)
                    dispatch(updateRecordingDetails({
                        recordingId: note?.id,
                        data: {
                            publication_ids: note?.publication_ids.filter((pubId: number) => pubId !== id)
                        }
                    }));
                }else {
                    await publishNotetoPage(note?.id, slug)
                    setPublished(true)
                    dispatch(updateRecordingDetails({
                        recordingId: note?.id,
                        data: {
                            publication_ids: [...(note?.publication_ids || []), id]
                        }
                    }));
                }
            } catch(error) {
                console.error(error)
            } finally { setWorking(false) }
        }

        return <View style={[styles.publication, { opacity: disabled ? 0.5 : 1 }]}>
            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                {imageLoading && (
                    <View style={{ position: 'absolute', width: 40, height: 40, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.askLogo} />
                    </View>
                )}
                <Image
                    style={styles.avatar}
                    width={50}
                    height={50}
                    resizeMode="contain"
                    source={{ uri: image }}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                />
            </View>
            <View style={{ flex: 4, justifyContent: 'center' }}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{title}</Text>
                <Text style={styles.listens}>{formatBigNumber(listens)} listens</Text>
            </View>
            {disabled ? <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <View style={[styles.action, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.actionlabel, { color: Colors.text }]}>Disabled</Text>
                </View>
            </View> :
            <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Pressable onPress={ working? null : onChangePublish} style={styles.action}>
                    {working ? <ActivityIndicator /> : <Text style={styles.actionlabel}>{published ? 'Unpublish' : 'Publish'}</Text>}
                </Pressable>
            </View>}
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <SvgXml xml={commonSvg.globe.replace("black", Colors.text)} width={25} height={25} />
            </View>
            <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={styles.webHeader}>Publish to web</Text>
                <Text style={styles.webCaption}>Anyone with the link will have access to this voice note</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, flexDirection: 'row', gap: 10 }} >
                {buffering ? <ActivityIndicator /> : isPublic ? <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <SvgXml xml={commonSvg.greenTick} />
                        <Text style={styles.webPublished}>Published</Text>
                    </View>
                    <MoreOptions
                        ref={moreOptionsRef}
                        options={menuOptions}
                        isNative={isIOS}
                    >
                        <Pressable 
                            style={styles.more}
                            onPress={() => moreOptionsRef.current?.show()}
                        >
                            <SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/>
                        </Pressable>
                    </MoreOptions>
                </> :
                <Pressable onPress={buffering ? null : togglePublic} style={styles.action}>
                    <Text style={styles.actionlabel}>Publish</Text>
                </Pressable>}
            </View>
        </View>
        {note?.recording_type !== 3 && <View style={styles.publications}>
            {userDetails?.publications.map((item: any, index: number) => {
                return <Publication key={index} title={item?.title} image={item?.avatar} listens={item?.meta?.listener_count} disabled={!item?.is_public} slug={item?.slug} id={item?.id} />
            })}
        </View>}
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
        resizeMode: 'contain',
        borderRadius: 10
    }
  }), [Colors])
}

export default Publish