import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import { memo, useContext } from "react";
import Touchable from "components/common/Touchable";
import {
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate, formatDateAndTimeNew, formatDateTime, isSameDay } from "utils/format-date";
import { Menu, MenuItem } from "react-native-material-menu";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { Audio } from "expo-av";
import {
  useAddTranscript,
  useCreate,
  useDeleteRecording,
  useSignedUrl,
  useToggleStar,
} from "queries/home";
import { useQueryClient } from "react-query";
import { setStringAsync } from "expo-clipboard";
import ChatBubble from "components/common/chat-buble";
import CircularLoader from "components/common/loaders/circular-loader";
import AiLoader from "components/common/loaders/ai-loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import {
  checkFileExists,
  isIOS,
  screenWidth,
  sleep,
} from "utils/common";
import {  router, useRouter } from "expo-router";
import { CreateModalSvg } from "assets/svg/CreateModal";
import AiCreatedView from "./ai-created-view";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { MAIN_URL } from "services/api/api-constants";
import { useUnpublishRecording } from "queries/home/share";
import * as wb from "expo-web-browser";
import PublishedModal from "./published-modal";
import {
  deleteRecording,
  updateRecordingDetails,
} from "redux/reducers/recordingStates";
import listenAiCreate from "func/firebase/listen-ai-create";
import NoteButtons from "components/common/note-buttons";
import { ScrollView } from "react-native";
import { useGetRelatedRecording } from "queries/home/relatedNote";
import Subnote from "./subnote";
import creationContent from "utils/constants/creation-content";
import { useNetInfo } from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";
import threeDotLoader2 from "assets/lottie/threeDotLoader2.json";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Foundation } from "@expo/vector-icons";
import { addMenu } from "assets/svg/AddMenu";
import AttachmentViewer from "components/NotePreview/AttachmentViewer";
import ImageUploader from "components/NotePreview/ImageUploader";
import AddEditLinkModal from "components/NotePreview/AddEditLinkInput";
import { notePreviewSVG } from "assets/svg/notePreviewSVG";
import RelatedNotesList from "./NotePreview/RelatedNotesList";
import CreationsList from "./NotePreview/CreationsList";
import axiosApi from "services/api/axios-api";
import StatusIndicator from "./NotePreview/StatusIndicator";
import TagsList from "./NotePreview/TagsList";
import { generateVoiceNoteFilename } from "utils/audioUtils";
import { setEditNote } from "redux/reducers/editStates";
import { setRelatedNoteId } from "redux/reducers/relatedNoteStates";
import MoreOptions from "components/common/more-options";
import { NoteContext } from "context";
import { StorageAccessFramework } from "expo-file-system";
import { saveFileAndroid } from "utils/filesystem";

const NotePreview = forwardRef(
  (
    {
      note,
      onUploadRetry,
      hashFilter,
      expand,
      setExpand,
      isSingle = false,
      isSubnote = false,
      list,
      index,
      isPlay,
      setIsPlay,
      play,
      setPlay,
      audioLoading,
      setAudioLoading,
      onDeleteCallBack = () => {},
      continueProcessing = () => {},
      syncUpNote = () => {},
      onStartRecord = (obj: {
        parent_id: string | null;
        repeat: boolean | null;
      }) => {},
      isOffline = false,
    }: any,
    ref
  ) => {
    const route = useRouter();
    const [moreOption, setMoreOption] = useState(false);
    const [createOption, setCreateOption] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);
    const [isPublished, setIsPublished] = useState(note?.is_published ?? false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [isNoteJustMadePrivate, setIsNoteJustMadePrivate] = useState(false);
    const [creationLoader, setCreationLoader] = useState(false);
    const [createType, setCreateType] = useState("summary");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showLinkEditModal, setShowLinkEditModal] = useState(false);
    const [retryLoader, setRetryLoader] = useState(false);
    const [editingLink, setEditingLink] = useState<{
      id: string;
      url: string;
    } | null>(null);
    const [attachments, setAttachments] = useState([]);

    const dispatch = useDispatch();

    const { token } = useSelector((state: RootState) => state.userDetails);
    const { tempRecordings } = useSelector(
      (state: RootState) => state.recordingStates
    );

    const queryClient = useQueryClient();
    const deleteRecord = useDeleteRecording(note?.id);
    // const addTitleRecord = useAddTitle();
    const getSignedURL = useSignedUrl();
    const createAI = useCreate();
    const addTranscript = useAddTranscript();
    const unPublishRecording = useUnpublishRecording();
    const relatedNotes = useGetRelatedRecording();
    const NetInfo = useNetInfo();
    const {setTriggerTypingTitle,setTriggerTypingTranscript,triggerTypingTranscript,triggerTypingTitle} = useContext(NoteContext)
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    const isUploadingFailed =
      !!note?.audio?.data?.url && note.isUploading == false;

    useEffect(() => {
      setAttachments(note?.attachments);
    }, [note?.attachments]);

    const hideMoreOption = () => setMoreOption(false);
    const showMoreOption = () => setMoreOption(true);
    const hideCreateOption = () => setCreateOption(false);
    const showCreateOption = () => setCreateOption(true);
    const closeAddMenu = () => setShowAddMenu(false);

    const onEdit = () => {
      dispatch(setEditNote(note))
      // router.navigate({ pathname: '/edit-note/', params: { note:JSON.stringify(note) ,index} })
      router.navigate({
        pathname: "/edit-note/",
        params: { index, id: note?.id },
      });
    };
    const onGotoAddTag = () => {
      hideMoreOption();
      setTimeout(() => {
        const tags = note?.tags?.flatMap((tag: any) => tag?.name);
        route.push({
          pathname: "/add-tags/",
          params: { tagsArray: JSON.stringify(tags), recording_id: note?.id },
        });
      }, 500);
    };

    const getCreation = async (id: number) => {
      await queryClient.refetchQueries("all-recording");
      isSingle && (await queryClient.resetQueries("single-recording"));
      setCreationLoader(false);
    };

    const onCreate = async (type = "summary") => {
      setCreateType(type);
      setCreationLoader(true);
      hideCreateOption();
      setExpand(index)
      await createAI.mutateAsync(
        { recording_id: note?.id, type },
        {
          onSuccess: async (r) => {
            await listenAiCreate({ id: r?.data?.id, getCreation });
          },
          onError: () => setCreationLoader(false),
        }
      );
    };

    const onGenerateTitle = async () => {
      hideMoreOption();
      await sleep(0.5);
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: { is_title_loading: true },
        })
      );

      try {
        const resp = await axiosApi.patch(`/recordings/${note.id}/title`);
        const title = resp.data?.recording?.title;
        dispatch(
          updateRecordingDetails({
            recordingId: note.id,
            data: { is_title_loading: false, title },
          })
        );
      } catch (error) {
        console.log("error in dispatching: ", error);
        dispatch(
          updateRecordingDetails({
            recordingId: note.id,
            data: { error_loading_title: error, is_title_loading: false },
          })
        );
      }
    };

    const onReGenerateTranscript = async () => {
      hideMoreOption();
      await sleep(0.5);
      continueProcessing(note, true);
    };

    const togglePublish = () => {
      const wasPublic = note?.public_slug;

      try {
        setPublishLoading(true);
        moreOption && hideMoreOption();
        unPublishRecording.mutate(
          { id: note?.id },
          {
            onSuccess: async (r) => {
              try {
                setShareVisible(false);
                setTimeout(() => {
                  if (wasPublic) {
                    setIsNoteJustMadePrivate(true);
                  } else {
                    setIsNoteJustMadePrivate(false);
                  }
                  setIsPublished((t: any) => !t);
                }, 50);
                await queryClient.invalidateQueries("all-recording");
              } catch (e) {
                console.info("error in toggle publish", e);
              } finally {
                setPublishLoading(false);
                setTimeout(() => {
                  setShareVisible(true);
                }, 50);
              }
            },
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    const onPrivateOk = () => {
      setShareVisible(false);
      setTimeout(() => {
        setIsNoteJustMadePrivate(false);
      }, 50);
    };

    const onShareNote = () => {
      hideMoreOption();
      setTimeout(() => {
        setShareVisible(true);
      }, 500);
    };

    const onCopy = async (content = "") => {
      hideMoreOption();
      const t:any=content
      await setStringAsync(
        t?.replaceAll(/\n/g, '')
        ?.replaceAll(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
        ?.replaceAll(/<br\s*\/?>\s+/g, '<br>')
        ?.replaceAll(/<br\/?>/g, "\n\n")
        ?.trimEnd()
      );
      setShareVisible(false);
    };
    const onDelete = (isCache=false) => {
      hideMoreOption();
      if (note.subnotes?.length) {
        Alert.alert(
          "",
          "This main note has subnotes attached. To proceed with deletion, ensure all subnotes are deleted first.",
          [
            {
              text: "Got It",
              style: "cancel",
            },
          ]
        );
        return;
      }

      Alert.alert(
        "",
        `Are you sure you want to delete?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              if (
                note.status == "uploading" ||
                note.status == "upload_failed" ||
                isCache
              ) {
                // edge case
                // await cancelUpload(note?.id);
                dispatch(deleteRecording({ id: note?.id }));
                // onDeleteCallBack();
              } else {
                try {
                  await axiosApi.delete(`/recordings/${note?.id}`);
                  dispatch(deleteRecording({ id: note?.id }));
                  onDeleteCallBack();
                } catch (error) {
                  console.log("Error in deleting: ", error);
                }
              }
            },
          },
        ]
      );
    };
    const onPlaybackStatusUpdate = async (status: any) => {
      if (status.isLoaded === false) console.log("loading audio..");

      if (status?.isLoaded && !status?.isPlaying && status?.didJustFinish) {
        setIsPlay(-1);
        setPlay(null);
      } else if (status?.isPlaying) {
        setAudioLoading(-1);
      }
      await play?.unloadAsync();
    };

    const onPlaySet = async (uri:any) => {
      console.log({ uri });
      try {
        setIsPlay(index);
        const { sound } = await Audio.Sound.createAsync(
          { uri: uri || "" },
          { shouldPlay: true, isLooping: false },
          onPlaybackStatusUpdate
        );
        setPlay(sound);
      } catch (e) {
        console.log("error in playset: ", e);
      }
    };

    const onPlay = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: 2,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 2,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        setIsPlay(-1);
        await play?.unloadAsync();
        setPlay(null);
        console.log("internalUrl: ", note.internalUrl);
        console.log("audiodataurl: ", note.audio?.data?.url);

        if (isPlay != index) {
          setAudioLoading(index);
          if (note?.internalUrl && (await checkFileExists(note?.internalUrl))) {
            console.log("has internalurl");
            onPlaySet(note?.internalUrl);
          } else {
            console.log("fetching signedurl");
            getSignedURL.mutate(note?.id, {
              onSuccess: async (r) => {
                try {
                  const signedUrl = r.data["url"];
                  console.log("received signed url: ", signedUrl);
                  onPlaySet(signedUrl);
                  console.log('about to download audio to be cached');
                  const fileName = `${FileSystem.cacheDirectory}AV/audio_${note.id}.mp3`;
                  const downloadResumable = FileSystem.createDownloadResumable(
                    signedUrl,
                    fileName,
                    {},
                    (downloadProgress) => {
                      const progress =
                        downloadProgress.totalBytesWritten /
                        downloadProgress.totalBytesExpectedToWrite;
                      console.log(`Download progress: ${progress * 100}%`);
                    }
                  );

                  const { uri }:any = await downloadResumable.downloadAsync();
                  console.log("downloaded!");

                  console.log({ uri });
                  dispatch(
                    updateRecordingDetails({
                      recordingId: note.id,
                      data: { internalUrl: uri },
                    })
                  );
                } catch (error) {
                  console.error("Error saving audio:", error);
                }
              },
            });
          }
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    useEffect(() => {
      if (!note?.public_slug) {
        setIsPublished(false);
      }
    }, [note?.public_slug]);

    const audioDuration = note?.audio?.data?.duration||note?.duration;
    const formattedDuration = useMemo(
      () =>
        audioDuration
          ? new Date(audioDuration).toISOString().substring(14, 19)
          : "",
      [audioDuration]
    );

    const isLongTranscript =
      !!note?.transcript && note?.transcript?.length > 520 ? true : false;
    let opacity = new Animated.Value(0.1);

    const onExpand = async () => {
      setShowImagePicker(false);
      setShowLinkEditModal(false);
      LayoutAnimation.configureNext({
        duration: 150,
        create: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      setExpand(index);
      if((!note?.related_notes||note?.related_notes?.length==0)&&note?.status=="processed")
        relatedNotes.mutate(note?.id)
    };

    useEffect(() => {
      if (expand > -1 && isLongTranscript) {
        opacity.setValue(0);
        Animated.timing(opacity, {
          duration: 270,
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }, [expand]);

    const onDownloadAudio = async () => {
      let audioUrl = "";
      if (note?.internalUrl && (await checkFileExists(note?.internalUrl))) {
        audioUrl = note.internalUrl;
      } else if (
        note?.audio?.data?.url &&
        (await checkFileExists(note?.audio?.data?.url))
      ) {
        audioUrl = note?.audio?.data?.url;
      } else {
        const resp = await getSignedURL.mutateAsync(note?.id);
        audioUrl = resp.data?.url;
      }

      try {
        hideMoreOption();
        const visibilityTime = Math.max(note.transcript?.length / 500, 1) * 1500;
        Toast.show({
          type: "info",
          text1: "Preparing",
          text2: "Voice note is being prepared...",
          position: "top",
          visibilityTime: visibilityTime,
        });

        let fileUri: string = audioUrl;
        const fileName = generateVoiceNoteFilename(note);

        if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
          fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const downloadResumable = FileSystem.createDownloadResumable(
            audioUrl,
            fileUri,
            {},
            (downloadProgress) => {
              const progress =
                downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite;
              console.log(`Download progress: ${progress * 100}%`);
            }
          );
          const { uri }:any = await downloadResumable.downloadAsync();
          fileUri = uri;
        }

        if (Platform.OS === "android") {
          await saveFileAndroid(fileUri, fileName);
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Audio saved successfully",
            position: "top",
            visibilityTime: 3000,
          });
        } else {
          const UTI = "public.audio";
          await Sharing.shareAsync(fileUri, {
            UTI: UTI,
            dialogTitle: "Save audio file",
          });
        }
      } catch (error) {
        console.error("Error processing file:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to process the audio file",
          position: "top",
          visibilityTime: 3000,
        });
      }
    };

    const MenuItemContent = ({ icon=null, text, style={},textStyle={} }:any) => (
      <View style={[styles.menuItemContent,style]}>
        {icon&&<SvgXml xml={icon} style={styles.menuItemIcon}/>}
        <Text style={[styles.menuItemText,textStyle]}>{text}</Text>
      </View>
    );

    const onThreadNote = () => {
      onStartRecord({ parent_id: note.id, index });
      closeAddMenu();
      expand!=index&&setExpand(index)
    };

    const renderButtons = () => {
      const mainButtons = hashFilter == "shared" ?
      [
        {
          text: "More",
          type: "menu",
          function: renderMoreSharedMenu,
        },
      ]:[];

      const intermediateButtons = [
        {
          text: "Download",
          onPress: onDownloadAudio,
          icon: home.download,
        },
        { text: "Delete", onPress: ()=>onDelete(true), icon: home.delete },
      ];

      const failedButtons = isOffline?
      [...intermediateButtons]
      :[
        {
          text: "Retry",
          onPress: async ()=>{
            setRetryLoader(true);
            await syncUpNote(note).catch(()=>{})
            // setRetryLoader(false);
          },
          icon: home.repeat,
          isLoading: !note?.status?.includes('failed'),
        },
        ...intermediateButtons,
      ];

      const getButtonsBasedOnStatus = (status: string) => {
        status = status?.toLowerCase();
        if(status?.includes('failed')) status = 'failed'
        switch (status) {
          case "uploading":
          case "processing":
            return intermediateButtons;
          case "failed":
            return failedButtons;
          default:
            return mainButtons;
        }
      };
    if(note?.status=='processing'||note?.status=='uploading'||note?.status?.includes('failed'))
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buttonContainer}
        >
          {getButtonsBasedOnStatus(note?.status)?.map((button:any, index) =>
            button.type === "menu" ? (
              <View key={index}>
              {button.function()}
              </View>
            ) : (
              <NoteButtons
                key={index+Math.random()}
                text={button.text}
                onPress={button.onPress}
                icon={button.icon}
                isLoading={button.isLoading??false}
              />
            )
          )}
        </ScrollView>
      );
    };

    const renderMoreSharedMenu = () => (
      <Menu
        visible={moreOption}
        onRequestClose={hideMoreOption}
        style={styles.menuShared}
        anchor={
          <NoteButtons
            text="More"
            style={{ marginLeft: 0 }}
            onPress={showMoreOption}
            icon={home.more}
          />
        }
      >
        <MenuItem onPress={() => onCopy(MAIN_URL + '/s/' + note?.public_slug)} pressColor="transparent">
          <MenuItemContent icon={home.shareCopy} text="Copy note" style={[styles.menuItemContentSharedStyle,{backgroundColor:'#000'}]} textStyle={[styles.menuItemContentSharedTextStyle,{color:'#fff'}]} />
        </MenuItem>
        <MenuItem onPress={togglePublish} style={{marginTop:3}} pressColor="transparent">
          <MenuItemContent text="Unpublish" style={[styles.menuItemContentSharedStyle,{backgroundColor:'#0d0d0d0d'}]} textStyle={[styles.menuItemContentSharedTextStyle,{color:'#222'}]} />
        </MenuItem>
      </Menu>
    );

    const openImagePicker = () => {
      setShowImagePicker(true);
      closeAddMenu();
    }

    const openLinkEditModal = () => {
      setShowLinkEditModal(true);
      closeAddMenu();
    }

    const options = [
      {
        title:"Copy note",
        systemIcon:'doc.text',
        onPress:()=>onCopy(note?.transcript ?? "")
      },
      ...(isSubnote ? [] : [{
        title:"Add subnote",
        systemIcon:'mic',
        onPress:onThreadNote
      }]),
      {
        title:"Attach",
        systemIcon:'photo.on.rectangle',
        actions:[
          {
            title:"Photo",
            onPress:openImagePicker
          },
          {
            title:"Link",
            onPress:openLinkEditModal
          }
        ]
      },
      {
        title:"Tag",
        systemIcon:'number',
        onPress:onGotoAddTag
      },
      {
        title:"Share",
        systemIcon:'square.and.arrow.up',
        onPress:onShareNote
      },
      {
        title:"Create",
        systemIcon:'pencil.and.outline',
        actions:[
          {
            title:"Summarize",
            onPress:()=>onCreate("summary")
          },
          {
            title:"Main points",
            onPress:()=> onCreate("points")
          },
          {
            title:"To-do list",
            onPress:()=> onCreate("todo")
          },
          {
            title:"Blog post",
            onPress:()=>onCreate("blog")
          },
          {
            title:"Tweet",
            onPress:()=>onCreate("tweet")
          },
          {
            title:"Email",
            onPress:()=>onCreate("email")
          },
          {
            title:"Cleanup",
            onPress:()=>onCreate("tidy")
          }
        ],
      },
      {
        title:"Regenerate",
        systemIcon:'arrow.clockwise',
        actions:isSubnote?[
          {
            title:"Regenerate transcript",
            onPress:onReGenerateTranscript
          }
        ]:[
          {
            title:"Regenerate title",
            onPress:onGenerateTitle
          },
          {
            title:"Regenerate transcript",
            onPress:onReGenerateTranscript
          }
        ]
      },
      {
        title:"Download audio",
        systemIcon:"arrow.down.circle",
        onPress:onDownloadAudio
      },
      {
        title:"Edit",
        systemIcon:'square.and.pencil',
        onPress:onEdit
      },
      {
        title:"Delete",
        destructive:true,
        systemIcon:'trash',
        onPress:()=>onDelete()
      }
    ]
    // :[
    //   {
    //     title:"Retry",
    //     systemIcon:'arrow.clockwise',
    //     onPress:async()=>await syncUpNote(note).catch(()=>{})
    //   },
    //   {
    //     title:"Download",
    //     systemIcon:'arrow.down.circle',
    //     onPress:()=>onCopy(note?.transcript ?? "")
    //   },
    //   {
    //     title:"Delete",
    //     destructive:true,
    //     systemIcon:'trash',
    //     onPress:()=>onDelete(true)
    //   }
    // ]

    const refreshNoteAfterAttachmentChange = async () => {
      await queryClient.invalidateQueries("all-recording");
    };

    if (!note) return null;
    const isNoteExpanded = useMemo(() => expand === index, [index, expand]);
    if (isNoteExpanded) {
    }

    return (
      <View style={[{borderColor:Colors.grey4WithOpacity(86.67),borderBottomWidth:0.5},isSubnote?{borderBottomWidth:0}:{paddingBottom:8}]}>
      <View style={{borderLeftWidth:0.5,borderColor:Colors.grey4WithOpacity(86.67)}}>
        <Touchable
          onPress={onExpand}
          activeOpacity={1}
          style={[
            styles.container,
            isSubnote?{paddingRight:0}:{},
            isNoteExpanded && !isSingle && styles.expandedContainer,
          ]}
        >
          {/* {!isSubnote &&
            (index == 0 ||
              (index != 0 &&
                !isSameDay(
                  note?.recorded_at,
                  recordingList[index - 1]?.recorded_at
                ))) && ( */}
          <Text style={styles.date}>
            {formatDateAndTimeNew(note?.recorded_at??note?.created_at)}
          </Text>
          {/* )} */}
          <View style={styles.row}>
            {/* <View>
              {audioLoading == index ? (
                <CircularLoader />
              ) : (
                <Touchable onPress={onPlay}>
                  <SvgXml xml={isPlay == index ? home.pause : home.play} />
                </Touchable>
              )}
              <View style={styles.timeLine} />
            </View> */}
            <View style={styles.content}>
              {(!isSubnote||note?.status!='processed')&&<View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {note?.is_title_loading ? (
                  <AiLoader
                    text="Creating title from your voice"
                    style={{ marginTop: -7 }}
                    size={14}
                  />
                ) : (
                  <>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <ChatBubble
                        style={styles.title}
                        status={note?.status}
                        showStatus={!isNoteExpanded}
                        cursorSvg={
                          note?.status == "processing"
                            ? notePreviewSVG.flower
                            : note?.status == "uploading"
                            ? notePreviewSVG.blackCircle
                            : ""
                        }
                        showCursorAtEnd={
                          note?.title === "New Recording" || !note?.title
                        }
                        message={!!note?.title?note?.title?.trimEnd():"New Recording"}
                        triggerAnimation={
                          triggerTypingTitle == note?.id ? 2 : 0
                        }
                        disableGenerating={() => setTriggerTypingTitle(null)}
                      />
                    </View>
                    {isNoteExpanded && (
                      <StatusIndicator
                        status={note?.status}
                        onRetry={() => {}}
                      />
                    )}
                  </>
                )}
              </View>}

              {note.is_transcript_loading && (
                <AiLoader
                  text={`Creating transcript from your voice`}
                  style={{ marginTop: 0 }}
                  size={14}
                />
              )}

              {(note?.status == "uploading" ||
                note?.status == "processing" ||
                note?.status?.includes("failed")) && (
                <View
                  style={[
                    styles.row,
                    { justifyContent: "space-between", marginTop: 2 },
                  ]}
                >
                  <Text
                    style={{
                      color: Colors.black2,
                      fontSize: 14,
                      fontFamily: "Primary",
                      lineHeight: 20,
                    }}
                  >
                    {formattedDuration}
                  </Text>
                  <Text
                    style={{
                      color: Colors.grey3,
                      fontSize: 13,
                      fontFamily: "Primary",
                      lineHeight: 20,
                    }}
                  >
                    {formatDateTime(note?.recorded_at)}
                  </Text>
                </View>
              )}
              <View>
                {note?.transcript && !note.is_transcript_loading && (
                  <ChatBubble
                    lines={expand == index ? 10000 : 4}
                    style={{...styles.text,color:isNoteExpanded?Colors.black2:Colors.grey2WithOpacity(0.5)}}
                    message={note?.transcript
                      ?.replaceAll(/\n/g, '')
                      ?.replaceAll(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
                      ?.replaceAll(/<br\s*\/?>\s+/g, '<br>')
                      ?.replaceAll(/<br\/?>/g, "\n\n")
                      ?.trimEnd()}
                    triggerAnimation={
                      triggerTypingTranscript == note?.id ? 2 : 0
                    }
                    disableGenerating={() =>setTriggerTypingTranscript(null)}
                  />
                )}

                <TagsList note={note} />
                {attachments?.length > 0 && (
                  <AttachmentViewer
                    attachments={attachments}
                    onAttachmentUpdate={refreshNoteAfterAttachmentChange}
                    onEditLink={(linkItem: any) => {
                      setShowLinkEditModal(true);
                      setEditingLink(linkItem);
                    }}
                  />
                )}
                <View style={{flexDirection:'row',alignItems:'center',marginVertical:6,justifyContent:'space-between'}}>
                <Touchable onPress={onPlay} style={{height:32,paddingHorizontal:12,alignSelf:'flex-start',borderRadius:32,backgroundColor:Colors.grey2WithOpacity(0.05),flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                  {audioLoading==index?
                  <CircularLoader strokeWidth={3} width={15} height={15}/>
                  :<SvgXml xml={isPlay == index ? home.pause : home.play} />}
                  <Text style={{fontFamily:'Primary-Semibold',fontSize:14,color:Colors.blackWithOpacity(1),marginLeft:6}}>{formattedDuration}</Text>
                </Touchable>
                {(note?.status=="processed"||isSingle)&&
                  <MoreOptions options={options} style={{height:30,paddingHorizontal:15, paddingLeft: 30, marginRight:-12,justifyContent:"center",alignItems:'center'}}>
                  <SvgXml xml={home.moreNew}/>
                </MoreOptions>}
                </View>

                {expand === index && (
                  <View style={{marginBottom:8}}>
                    {renderButtons()}
                    {token && (
                      <CreationsList
                        note={note}
                        createType={createType}
                        creationLoader={creationLoader}
                      />
                    )}
                    <RelatedNotesList
                      note={note}
                      onPress={(id: any) => {
                        // setRelatedNoteId(null);
                        dispatch(setRelatedNoteId(id));
                      }}
                    />
                    {/* <Text style={styles.timestamp}>
                      {formatDateTime(note?.recorded_at)}
                    </Text> */}
                  </View>
                )}
              </View>
            </View>
          </View>

          {showLinkEditModal && (
            <AddEditLinkModal
              noteId={note?.id}
              onAttachmentUpdate={refreshNoteAfterAttachmentChange}
              editingLink={editingLink}
              isVisible={showLinkEditModal}
              onClose={() => {
                setShowLinkEditModal(false);
                setEditingLink(null);
              }}
            />
          )}

          {showImagePicker && (
            <ImageUploader
              showImagePicker={showImagePicker}
              setShowImagePicker={setShowImagePicker}
              setAttachments={setAttachments}
              onAttachmentUpdate={refreshNoteAfterAttachmentChange}
              noteId={note?.id}
            />
          )}
        </Touchable>

        <PublishedModal
          slug={note?.public_slug || ""}
          visible={shareVisible}
          isPublished={isPublished}
          onPressCancel={() => setShareVisible(false)}
          onPressDone={togglePublish}
          isLoading={publishLoading}
          isNoteJustMadePrivate={isNoteJustMadePrivate}
          setIsNoteJustMadePrivte={setIsNoteJustMadePrivate}
          hideModal={() => setShareVisible(false)}
        />

        {note?.subnotes?.length > 0 && isNoteExpanded&& (
          <Subnote
            list={note?.subnotes}
            expand={expand}
            hashFilter={hashFilter}
            onUploadRetry={onUploadRetry}
            syncUpNote={syncUpNote}
          />
        )}
      </View>
    </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 11,
    paddingHorizontal:17
  },
  expandedContainer: {
    // backgroundColor: "#f7f7f7",
    // borderRadius: 12,
  },
  row: {
    flexDirection: "row",
  },
  content: {
    // marginLeft: 9,
    flex: 1,
  },
  date: {
    color: Colors.grey5WithOpacity(0.6),
    fontFamily: "Primary-Medium",
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Primary-Semibold",
    fontSize: 16,
    color: Colors.blackWithOpacity(1),
    lineHeight: 19.09
  },
  text: {
    fontFamily: "Primary",
    fontSize: 15,
    color: Colors.grey2WithOpacity(0.5),
    lineHeight: 21,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
    paddingBottom: 4,
    marginLeft:-3,
    paddingLeft:4
  },
  menu: {
    borderRadius: 12,
  },
  menuShared: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 118,
    width: 160,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "flex-start",
  },
  menuItemContentSharedStyle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0d0d0d",
    borderRadius: 16,
    // padding: 12,
    width: 136,
    justifyContent: "center",
  },
  menuItemContentSharedTextStyle: {
    color: "#fff",
    fontFamily: "Primary-Medium",
    fontSize: 14,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemText: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
  },
  timestamp: {
    color: Colors.grey3,
    fontFamily: "Primary",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  timeLine: {
    width: 1,
    backgroundColor: Colors.primaryWithOpacity(0.1),
    marginTop: 8,
    flex: 1,
    alignSelf: "center",
  },
  menuAttachIOS: {
    borderRadius: 12,
    paddingBottom: 0,
    paddingTop: 6,
    marginTop: 40,
  },
  menuAttachAndroid: {
    borderRadius: 12,
    paddingBottom: 0,
    paddingTop: 6,
  },
  menuIOS: {
    marginTop: 40,
    borderRadius: 12,
    paddingBottom: 0,
  },
  relatedNoteModal: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    margin: 0,
    zIndex:10,
  },
});

export default memo(NotePreview);
