import { home } from "assets/svg/home";
import { memo, useCallback, useContext, useRef } from "react";
import Touchable from "components/common/Touchable";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDateAndTimeNew, formatDateTime, formattedDurations } from "utils/format-date";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { Audio } from "expo-av";
import {
  useCreate,
  useSignedUrl,
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
  fetchSingleRecording,
  formatTranscript,
  formatTranscript2,
  formatTranscript5,
  isIOS,
  screenHeight,
  sleep,
} from "utils/common";
import {  router, useRouter } from "expo-router";
import { useUnpublishRecording } from "queries/home/share";
import PublishedModal from "./published-modal";
import {
  deleteRecording,
  setCurrentlyOpenedMeetingTranscript,
  updateRecordingDetails,
  updateTempRecordingData,
} from "redux/reducers/recordingStates";
import listenAiCreate from "func/firebase/listen-ai-create";
import NoteButtons from "components/common/note-buttons";
import { ScrollView } from "react-native";
import { useGetRelatedRecording } from "queries/home/relatedNote";
import Subnote from "./subnote";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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
import { setRelatedNoteId, setRelatedNoteTitleLoad, setRelatedNoteTranscriptLoad } from "redux/reducers/relatedNoteStates";
import MoreOptions from "components/common/more-options";
import { NoteContext, useTheme } from "context";
import { saveFileAndroid } from "utils/filesystem";
import { useDialog } from "context/DialogContext";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { MAIN_URL } from "services/api/api-constants";

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
      scrollRef
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
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showLinkEditModal, setShowLinkEditModal] = useState(false);
    const [retryLoader, setRetryLoader] = useState(false);
    const [editingLink, setEditingLink] = useState<{
      id: string;
      url: string;
    } | null>(null);
    const [attachments, setAttachments] = useState(note?.attachments??[]);
    const { Colors, isLightMode } = useTheme()
    const styles = useStyles()
    const {showDialog} = useDialog()

    const dispatch = useDispatch();

    const { userDetails }:{token:any,userDetails:any} = useSelector((state: RootState) => state.userDetails);

    const queryClient = useQueryClient();
    // const addTitleRecord = useAddTitle();
    const getSignedURL = useSignedUrl();
    const createAI = useCreate();
    const unPublishRecording = useUnpublishRecording();
    const relatedNotes = useGetRelatedRecording();
    const {setTriggerTypingTitle,setTriggerTypingTranscript,triggerTypingTranscript,triggerTypingTitle} = useContext(NoteContext)
    const isNoteExpanded = useMemo(() => expand === index, [index, expand]);
    const isShared = userDetails?.id!=note?.user_id && note?.is_shared
    const titleRef = useRef<View>(null);

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
      isSingle && (await queryClient.invalidateQueries("single-recording"));
      setCreationLoader(false);
    };

    const onCreate = useCallback(async (type = "summary", language?: string) => {
      setCreateType(type);
      setCreationLoader(true);
      hideCreateOption();
      setExpand(index);
    
      try {
        const response = await createAI.mutateAsync(
          { recording_id: note?.id, type, language },
          {
            onSuccess: async (r) => {
              await listenAiCreate({ 
                id: r?.data?.id, 
                getCreation: async () => {
                  // Invalidate queries to refresh data
                  await queryClient.invalidateQueries("all-recording");
                  isSingle && await queryClient.invalidateQueries("single-recording");
                  // Only turn off loader after data is refreshed
                  setTimeout(() => setCreationLoader(false), 100);
                }
              });
            },
            onError: () => {
              setCreationLoader(false);
            },
          }
        );
      } catch (error) {
        setCreationLoader(false);
      }
    }, [note, index, queryClient]);

    const onGenerateTitle = async () => {
      hideMoreOption();
      await sleep(0.5);
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: { is_title_loading: note?.id },
        })
      );
      dispatch(setRelatedNoteTitleLoad(note?.id))

      try {
        const resp = await axiosApi.patch(`/recordings/${note.id}/title`);
        const title = resp.data?.recording?.title;
        dispatch(
          updateRecordingDetails({
            recordingId: note.id,
            data: { is_title_loading: false, title },
          })
        );
        dispatch(setRelatedNoteTitleLoad(false))
      } catch (error) {
        console.log("error in dispatching: ", error);
        dispatch(
          updateRecordingDetails({
            recordingId: note.id,
            data: { error_loading_title: error, is_title_loading: false },
          })
        );
        dispatch(setRelatedNoteTitleLoad(false))
      }
    };

    const onReGenerateTranscript = async () => {
      hideMoreOption();
      await sleep(0.5);
      note?.recording_type!=2&&
      dispatch(setRelatedNoteTranscriptLoad(note?.id))
      await continueProcessing(note, true);
      note?.recording_type==2&&onTranscriptOpen(true)
    };

    const togglePublish = () => {
      const wasPublic = !!note?.public_slug;

      try {
        setPublishLoading(true);
        moreOption && hideMoreOption();
        unPublishRecording.mutate(
          { id: note?.id },
          {
            onSuccess: async (r) => {
              try {
                setTimeout(() => {
                  setIsPublished((t:any)=>!t)
                }, 50);
                await queryClient.invalidateQueries("all-recording");
                await queryClient.invalidateQueries("single-recording");
                setShareVisible(false);
              } catch (e) {
                console.info("error in toggle publish", e);
              } finally {
                setPublishLoading(false);
                setIsNoteJustMadePrivate(wasPublic)
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

    const onShareNote = async() => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
      hideMoreOption();
      setTimeout(() => {
        setShareVisible(true);
      }, 500);
    };

    const onCopy = async (content = "") => {
      hideMoreOption();
      let t:any=''
      if(note?.recording_type==2)
        t=note?.creations?.find((t:any)=>t?.type=="team-summary")?.content?.data??''
      else if(note?.recording_type==3)
        t=formatTranscript2(content)
      else
        t=formatTranscript(content)
      console.log(t)
      await setStringAsync(t);
      setShareVisible(false);
    };
    const onDelete = (isCache=false) => {
      hideMoreOption();
      if (note?.subnotes?.length) {
        showDialog(
          "",
          "This main note has subnotes attached. To proceed with deletion, ensure all subnotes are deleted first.",
          [
            {
              text: "Got It",
              style: "cancel",
            },
          ],{userInterfaceStyle:isLightMode?"light":"dark"}
        );
        return;
      }

      showDialog(
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
                isCache ||  note?.status == "saving"
              ) {
                // edge case
                // await cancelUpload(note?.id);
                dispatch(updateTempRecordingData('processed'))
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
        ],{userInterfaceStyle:isLightMode?"light":"dark"}
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
          ? formattedDurations(audioDuration)
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
        create: 
        {
           type: LayoutAnimation.Types.easeInEaseOut,
           property: LayoutAnimation.Properties.opacity,
        },
        update: 
        {
           type: LayoutAnimation.Types.easeInEaseOut,
        }
       });
      setExpand((i:any)=>index==i?-1:index);
      if((!note?.related_notes||note?.related_notes?.length==0)&&note?.status=="processed")
        relatedNotes.mutate(note?.id)
      
      await sleep(200)      
      isNoteExpanded&&
      titleRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const windowHeight = screenHeight;
        const isVisible = pageY >= 0 && pageY + height <= windowHeight;
        !isVisible&&scrollRef&&scrollRef?.current?.scrollToIndex({animated:true,index})
      })
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
      []:[];

      const intermediateButtons = [
        ...([0,1,2,4]?.includes(note?.recording_type)?[{
          text: "Download",
          onPress: onDownloadAudio,
          icon: home.download?.replace(/#9B9B9B/g,Colors.text9),
        }]:[]),
        { text: "Delete", onPress: ()=>onDelete(true), icon: home.delete?.replace(/#0D0D0D/g,Colors.text) },
      ];

      const failedButtons = [
        {
          text: "Retry",
          onPress: async ()=>{
            setRetryLoader(true);
            await syncUpNote(note).catch(()=>{})
            // setRetryLoader(false);
          },
          icon: home.repeat?.replace(/black/g,Colors.text),
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
          case "saving":
            return intermediateButtons;
          case "failed":
            return failedButtons;
          default:
            return mainButtons;
        }
      };
    if(note?.status=='processing'||note?.status=='uploading'||note?.status=='saving'||note?.status?.includes('failed'))
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

    const openImagePicker = () => {
      setShowImagePicker(true);
      closeAddMenu();
    }

    const openLinkEditModal = () => {
      setShowLinkEditModal(true);
      closeAddMenu();
    }

    const onTranscriptOpen = async(isRetry=false) =>{
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
      dispatch(setCurrentlyOpenedMeetingTranscript(isRetry?null:note?.transcript))
      dispatch(setEditNote({...note,isEditMeetingTranscript:true}))
      router?.push({pathname:'/transcript/',params:{recording_id:JSON.stringify(note?.recording_id),isShared:isShared?'shared':'',index}})
    }

    const onReGenerateTeamSummary = async() => {
      hideMoreOption();
      dispatch(setRelatedNoteTranscriptLoad(note?.id))
      const id = note?.creations?.find((t:any)=>t?.type=="team-summary")?.id??'' 
      await continueProcessing(note, true,id)
    }
    
    const moreOptions = isShared?
    [
      {
        title: "Copy link",
        systemIcon: "doc.text",
        androidIcon: "content-copy",
        onPress: async() => await setStringAsync(MAIN_URL + "/s/" + note?.id),
      },
    ]
    :[
      {
        title: "Copy note",
        systemIcon: "doc.text",
        androidIcon: "content-copy",
        onPress: () => onCopy(note?.recording_type==2?note:note?.transcript ?? ""),
      },
      ...((isSubnote||note?.recording_type!=1)
        ? []
        : [
            {
              title: "Record subnote",
              androidIcon: "microphone-outline",
              systemIcon: "mic",
              onPress: onThreadNote,
            },
          ]),
          {
        title: "Attach",
        systemIcon: "photo.on.rectangle",
        androidIcon: "folder-multiple-image",
        actions: [
          {
            title: "Photo",
            androidIcon: "image-area",
            onPress: openImagePicker,
          },
          {
            title: "Link",
            androidIcon: "link-variant",
            onPress: openLinkEditModal,
          },
        ],
        },
        {
        title: "Tag",
        systemIcon: "number",
        androidIcon: "pound",
        onPress: onGotoAddTag,
        },
      ...(userDetails?.id==note?.user_id?[{
        title:"Share",
        systemIcon:'square.and.arrow.up',
        androidIcon:'share-outline',
        onPress:onShareNote
      }]:[]),
      // {
      //   title:"Create",
      //   systemIcon:'pencil.and.outline',
      //   androidIcon:'circle-edit-outline',
      //   actions:,
      // },
      ...([3, 5].includes(note?.recording_type)?
        []:[{
        title: "Download audio",
        systemIcon: "arrow.down.circle",
        androidIcon: "tray-arrow-down",
        onPress: onDownloadAudio,
      }]),
      {
        title: "Regenerate",
        systemIcon: "arrow.clockwise",
        androidIcon: "reload",
        actions: isSubnote
          ? [
              {
                title: "Regenerate transcript",
                onPress: onReGenerateTranscript,
              },
            ]
          : [
              {
                title: "Regenerate title",
                onPress: onGenerateTitle,
              },
              ...([0,1,2,4]?.includes(note?.recording_type)?[{
                title: "Regenerate transcript",
                onPress: onReGenerateTranscript,
              }]:[]),
              ...(note?.recording_type == 2
                ? [
                    {
                      title: "Regenerate summary",
                      onPress: onReGenerateTeamSummary,
                    },
                  ]
                : []),
            ],
      },
      {
        title: "Edit",
        systemIcon: "square.and.pencil",
        androidIcon: "pencil-outline",
        onPress: onEdit,
      },
      {
        title: "Delete",
        destructive: true,
        systemIcon: "trash",
        androidIcon: "delete-outline",
        onPress: () => onDelete(),
      },
    ];

    const shareOptions = [
      {
        title:"Copy note",
        systemIcon:'doc.text',
        androidIcon:'content-copy',
        onPress:()=>onCopy(note?.transcript ?? "")
      },
    ]

    const createActions =[
      {
      title:"Summary",
      androidIcon:'bullseye-arrow',
      systemIcon:'pencil.and.scribble',
      onPress:()=>onCreate("summary")
    },
    {
      title:"Meeting report",
      androidIcon:'file-document-outline',
      systemIcon:'doc.text',
      onPress:()=>onCreate("meeting-report")
    },
    {
      title:"Main points",
      androidIcon:'format-list-bulleted',
      systemIcon:'list.bullet',
      onPress:()=> onCreate("points")
    },
    {
      title:"To-do list",
      androidIcon:'checkbox-outline',
      systemIcon:'checkmark.rectangle.stack',
      onPress:()=> onCreate("todo")
    },
    {
      title: "Translate",
      androidIcon:'translate',
      systemIcon:'translate',
      onPress: () => {
        router.push({
          pathname: '/translate/',
          params: { noteId: note?.id }
        });
      }
    },
    {
      title:"Tweet",
      androidIcon:'bullhorn-variant-outline',
      systemIcon:'megaphone',
      onPress:()=>onCreate("tweet")
    },
    {
      title:"Blog post",
      androidIcon:'fountain-pen',
      systemIcon:'rectangle.and.pencil.and.ellipsis',
      onPress:()=>onCreate("blog")
    },
    {
      title:"Email",
      androidIcon:'email-outline',
      systemIcon:'envelope',
      onPress:()=>onCreate("email")
    },
    {
      title:"Cleanup",
      androidIcon:'broom',
      systemIcon:'paintbrush',
      onPress:()=>onCreate("tidy")
    }
    ]

    const createOptions = [
      ...(isIOS?[{
        title: 'Create',
        inlineChildren: true,
        actions: createActions
      }]:createActions),
    ]

    const refreshNoteAfterAttachmentChange = async () => {
      const recordingId = note?.id
      const updatedStatus = "processed";
      const updatedNote = await fetchSingleRecording(recordingId);
      dispatch(
        updateRecordingDetails({
          recordingId,
          data: {
            ...updatedNote.data,
            status: updatedStatus,
            is_transcript_loading:false,
          },
        })
      );
    };

    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener('translateNote', (data) => {
        if (data.noteId === note?.id) {
          onCreate('translate', data.code);
        }
      });

      return () => subscription.remove();
    }, [note?.id]);

    if (!note) return null;

    return (
    <View>
      <View style={{borderLeftWidth:isSubnote?0.5:0,borderLeftColor:Colors.grey4WithOpacity(86.67)}}>
        <Touchable
          onPress={onExpand}
          activeOpacity={1}
          style={[
            styles.container,
            isSubnote?{paddingRight:0}:{},
          ]}
        >
          {/* {!isSubnote &&
            (index == 0 ||
              (index != 0 &&
                !isSameDay(
                  note?.recorded_at,
                  recordingList[index - 1]?.recorded_at
                ))) && ( */}
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={styles.date}>
              {formatDateAndTimeNew(note?.recorded_at??note?.created_at)}
            </Text>
            {isShared&&
            <>
            <View style={{borderRadius:20,width:14,height:14,marginHorizontal:4,overflow:'hidden',backgroundColor:Colors.grey11,justifyContent:'center',alignItems:'center',alignSelf:'flex-start',marginTop:isIOS?0:2}}>
              {!!note?.user_image?
              <Image source={{uri: note?.user_image}} style={{width:'100%',height:'100%'}} />
              :<Text style={{fontFamily:'Primary-Semibold',fontSize:9,color:Colors.text6}}>{note?.user_name[0]?.toUpperCase()}</Text>}
            </View>
            <Text style={styles.date}>
              {note?.user_name}
            </Text>
            </>}
          </View>
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
              {isSubnote&&!note?.status?null
              :(!isSubnote||note?.status!='processed')&&<View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {note?.is_title_loading==note?.id ? (
                  <AiLoader
                    text={`Creating title from your ${note?.recording_type==2?'meeting':note?.recording_type==3 || note?.recording_type===5?'note':'voice'}`}
                    style={{ marginTop: -7 }}
                    size={14}
                  />
                ) : (
                  <>
                    <View ref={titleRef} style={{ flex: 1, marginRight: 10 }}>
                      <ChatBubble
                        style={styles.title}
                        status={note?.status}
                        showStatus={!isNoteExpanded}
                        cursorSvg={
                          note?.status == "processing"
                            ? notePreviewSVG.flower?.replace(/#0D0D0D/g,Colors.arrow)
                            : (note?.status == "uploading"|| note?.status == "saving")
                            ? notePreviewSVG.blackCircle?.replace(/#0D0D0D/g,Colors.arrow)
                            : ""
                        }
                        showCursorAtEnd={
                          note?.title === "New note" || note?.title === "New Recording" || !note?.title
                        }
                        message={!!note?.title?note?.title?.trimEnd():note?.recording_type!=3?"New Recording":"New note"}
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
              </View>
              }

              {note?.is_transcript_loading==note?.id && (
                <AiLoader
                  text={
                    note?.recording_type==2?'Processing transcript with timestamps, speaker identification, and generating insights.':
                    `Creating transcript from your voice`
                  }
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
                    isSummary={note?.recording_type==2}
                    message={
                      note?.recording_type==2?
                      note?.creations?.filter((t:any)=>t?.type=="team-summary")[0]?.content?.data?.replace(/- /g, '• ')?.replace(/\* /g,'• ')?.trimStart()??''
                      :note?.recording_type==3?
                      formatTranscript2(note?.transcript)
                      : note?.recording_type==5 ?
                        formatTranscript5(note?.transcript)
                      : formatTranscript(note?.transcript)
                    }
                    triggerAnimation={
                      triggerTypingTranscript == note?.id ? 2 : 0
                    }
                    // showUpgrade={note?.duration>60000&&!userDetails?.subscription_status}
                    disableGenerating={() =>setTriggerTypingTranscript(null)}
                  />
                )}

                <TagsList note={note} />
                {((!!attachments && attachments?.length > 0)||(!!note?.imageAttachments && note?.imageAttachments?.length > 0)) && (
                  <AttachmentViewer
                    attachments={attachments}
                    localImages={note?.imageAttachments??null}
                    onAttachmentUpdate={refreshNoteAfterAttachmentChange}
                    onEditLink={(linkItem: any) => {
                      setShowLinkEditModal(true);
                      setEditingLink(linkItem);
                    }}
                    isShared={isShared}
                  />
                )}
                <View style={{flexDirection:'row',alignItems:'center',marginVertical:6,justifyContent:'space-between'}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                {[0,1,2,4].includes(note?.recording_type)&&<Pressable onPress={onPlay} style={{height:32,paddingHorizontal:12,alignSelf:'flex-start',borderRadius:32,backgroundColor:Colors.bgColor3(0.05),flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                  {audioLoading==index?
                  <CircularLoader strokeWidth={3} width={15} height={15} color={Colors.whiteWithOpacity(1)}/>
                  :<SvgXml xml={isPlay == index ? home.pause?.replace("black",Colors.blackWithOpacity(1)) : home.play?.replace("black",Colors.blackWithOpacity(1))} fill={'#fff'} width={15}/>}
                  <Text style={{fontFamily:'Primary-Semibold',fontSize:14,color:Colors.blackWithOpacity(1),marginLeft:6}}>{formattedDuration}</Text>
                </Pressable>}
                {!!note?.subnotes&&note?.subnotes?.length>0&&expand!=index&&
                  <View style={{flexDirection:'row',alignItems:'center',marginLeft:8}}>
                    <SvgXml xml={home.subnote?.replace('#1C1B1F',Colors.askClose)}/>
                    <Text style={[styles.text,{marginTop:0,marginLeft:2,color:Colors.text8(0.9),fontSize:13}]}>+{note?.subnotes?.length}</Text>
                  </View>
                }
                {/* {!!attachments&&attachments.length>0&&expand!=index&&
                  <View style={{flexDirection:'row',alignItems:'center',marginLeft:8}}>
                    <SvgXml xml={home.attach}/>
                    <Text style={[styles.text,{marginTop:0,marginLeft:2,color:Colors.darkWithOpacity(0.9)}]}>+{attachments?.length}</Text>
                  </View>
                } */}
                </View>
                {(note?.status=="processed"||isSingle||(isSubnote&&note?.transcript))&&
                <View style={[styles.row,{gap:8}]}>
                  {note?.recording_type==2&&
                  <Pressable onPress={()=>onTranscriptOpen()} style={{height:30,width:30,zIndex:1000,borderRadius:100,backgroundColor:Colors.inputBg2,justifyContent:"center",alignItems:'center'}}>
                      <SvgXml xml={home.transcript?.replace('#0D0D0D',Colors.more)}/>
                  </Pressable>}
                  {userDetails?.id==note?.user_id&&
                  <MoreOptions options={createOptions} style={{height:31,width:31,position:'relative'}}>
                    <View style={{height:31,width:31,zIndex:1000,borderRadius:100,backgroundColor:Colors.inputBg2,justifyContent:"center",alignItems:'center'}}>
                      <SvgXml xml={home.create1?.replace('#0D0D0D',Colors.more)}/>
                    </View>
                  </MoreOptions>}
                  {/* <MoreOptions options={shareOptions} style={{height:30,width:30,position:'relative'}}> */}
                    {/* {userDetails?.id==note?.user_id&&
                    <Pressable onPress={onShareNote} style={{height:30,width:30,zIndex:1000,borderRadius:100,backgroundColor:Colors.inputBg2,justifyContent:"center",alignItems:'center'}}>
                      <SvgXml xml={home.share2?.replace('#0D0D0D',Colors.more)}/>
                    </Pressable>} */}
                  {/* </MoreOptions> */}
                  <MoreOptions options={moreOptions} style={{height:30,width:30,position:'relative'}}>
                    <View style={{height:30,width:30,zIndex:1000,borderRadius:100,backgroundColor:Colors.inputBg2,justifyContent:"center",alignItems:'center'}}>
                      <SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/>
                    </View>
                  </MoreOptions>
                </View>}
                </View>

                {expand === index && (
                  <View style={{marginBottom:8}}>
                    {renderButtons()}
                    <CreationsList
                      note={note}
                      createType={createType}
                      creationLoader={creationLoader}
                      setLoader={setCreationLoader}
                    />
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
          hideModal={() => {setShareVisible(false);setIsNoteJustMadePrivate(false)}}
        />

        {!!note?.subnotes&&note?.subnotes?.length > 0 && isNoteExpanded&& (
          <Subnote
            list={note?.subnotes}
            expand={expand}
            hashFilter={hashFilter}
            onUploadRetry={onUploadRetry}
            syncUpNote={syncUpNote}
            continueProcessing={continueProcessing}
          />
        )}
      </View>
      <View style={{backgroundColor:Colors.grey4WithOpacity(86.67),height:isSubnote?0:1,width:'100%',marginTop:isSubnote?0:8}}/>
    </View>
    );
  }
);

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    paddingTop: 11,
    paddingHorizontal:17
  },
  expandedContainer: {
    // backgroundColor: "f7f7f7",
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
    color: Colors.text11,
    fontFamily: "Primary-Medium",
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Primary-Semibold",
    fontSize: 16,
    color: Colors.blackWithOpacity(1),
    lineHeight: 23
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
    backgroundColor:Colors.grey2WithOpacity(0.05),
    borderRadius: 16,
    // padding: 12,
    width: 136,
    justifyContent: "center",
  },
  menuItemContentSharedTextStyle: {
    color: Colors.whiteWithOpacity(1),
    fontFamily: "Primary-Medium",
    fontSize: 14,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemText: {
    fontFamily: "Primary",
    fontSize: 14,
    color: Colors.darkWithOpacity(1),
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
    backgroundColor:Colors.whiteWithOpacity(1),
    width: "100%",
    height: "100%",
    margin: 0,
    zIndex:10,
  },
}), [Colors]); // Recreate styles when Colors change
};

export default memo(NotePreview);
