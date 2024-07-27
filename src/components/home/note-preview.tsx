import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import { memo } from "react";
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
import { formatDate, formatDateTime, isSameDay } from "utils/format-date";
import { Menu, MenuItem } from "react-native-material-menu";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
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
import { Link, router, useRouter } from "expo-router";
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
import { Note } from "types";
import TagsList from "./NotePreview/TagsList";
import { generateVoiceNoteFilename } from "utils/audioUtils";

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
    const [triggerTypingTitle, setTriggerTypingTitle] = useState(0);
    const [triggerTypingTranscript, setTriggerTypingTranscript] = useState(0);
    const [createType, setCreateType] = useState("summary");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showLinkEditModal, setShowLinkEditModal] = useState(false);
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
    const relatedNotes = useGetRelatedRecording(index ?? 0);
    const NetInfo = useNetInfo();

    const isUploadingFailed =
      !!note?.audio?.data?.url && note.isUploading == false;

    useEffect(() => {
      if (triggerTypingTranscript == 0 && !note?.transcript)
        setTriggerTypingTranscript(2);
    }, [note?.transcript]);

    useEffect(() => {
      if (triggerTypingTitle == 0 && !note?.title) setTriggerTypingTitle(2);
    }, [note?.title]);

    useEffect(() => {
      setAttachments(note?.attachments);
    }, [note?.attachments]);

    const hideMoreOption = () => setMoreOption(false);
    const showMoreOption = () => setMoreOption(true);
    const hideCreateOption = () => setCreateOption(false);
    const showCreateOption = () => setCreateOption(true);
    const closeAddMenu = () => setShowAddMenu(false);

    const onEdit = () => {
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
      await setStringAsync(content);
      setShareVisible(false);
    };
    const onDelete = () => {
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
        `Are you sure you want to ${note?.isUploading ? "cancel" : "delete"}?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              try {
                await axiosApi.delete(`/recordings/${note?.id}`);
                dispatch(deleteRecording({ id: note?.id }));
                onDeleteCallBack();
              } catch (error) {
                console.log("Error in deleting: ", error);
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

    const onPlaySet = async (uri) => {
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

                  const { uri } = await downloadResumable.downloadAsync();
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

    const audioDuration = note?.audio?.data?.duration;
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
      setExpand();
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
        console.log("internal url = ", note?.internalUrl);
        audioUrl = note.internalUrl;
      } else if (
        note?.audio?.data?.url &&
        (await checkFileExists(note?.audio?.data?.url))
      ) {
        console.log("note audio url = ", note?.internalUrl);
        audioUrl = note?.audio?.data?.url;
      } else {
        const resp = await getSignedURL.mutateAsync(note?.id);
        console.log("signed url = ", note?.internalUrl);
        audioUrl = resp.data?.url;
      }

      try {
        hideMoreOption();
        const visibilityTime =
          Math.max(note.transcript?.length / 500, 1) * 1500;
        Toast.show({
          type: "info",
          text1: "Preparing",
          text2: "Voice note is being prepared...",
          position: "top",
          visibilityTime: visibilityTime,
        });

        let fileUri: string = audioUrl;
        if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
          const fileName = generateVoiceNoteFilename(note);
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
          const { uri } = await downloadResumable.downloadAsync();
          fileUri = uri;
        }

        if (Platform.OS === "android") {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          const album = await MediaLibrary.getAlbumAsync("Download");
          if (album === null) {
            await MediaLibrary.createAlbumAsync("Download", asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Audio saved to Downloads folder",
            position: "top",
            visibilityTime: 3000,
          });
        } else if (Platform.OS === "ios") {
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

    const MenuItemContent = ({ icon, text }) => (
      <View style={styles.menuItemContent}>
        <SvgXml xml={icon} />
        <Text style={styles.menuItemText}>{text}</Text>
      </View>
    );

    const onThreadNote = () => {
      onStartRecord({ parent_id: note.id, index });
      closeAddMenu();
    };

    const renderButtons = () => {
      const mainButtons = [
        {
          text: "Add",
          onPress: () => setShowAddMenu(true),
          type: "menu",
          function: renderAddMenu,
        },

        {
          text: "Edit",
          onPress: onEdit,
          icon: home.edit,
        },
        {
          text: "Tag",
          onPress: onGotoAddTag,
          icon: home.hash1,
        },
        {
          text: "Create",
          type: "menu",
          function: renderCreateMenu,
        },
        {
          text: "Share",
          onPress: onShareNote,
          icon: home.share1,
        },
        {
          text: "More",
          type: "menu",
          function: renderMoreMenu,
        },
      ];

      const intermediateButtons = [
        {
          text: "Download",
          onPress: onDownloadAudio,
          icon: home.download,
        },
        { text: "Delete", onPress: onDelete, icon: home.delete },
      ];

      const failedButtons = [
        {
          text: "Retry",
          onPress: onUploadRetry,
          icon: home.retry,
        },
        ...intermediateButtons,
      ];

      const getButtonsBasedOnStatus = (status: string) => {
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

      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buttonContainer}
        >
          {getButtonsBasedOnStatus(note?.status).map((button, index) =>
            button.type === "menu" ? (
              button.function()
            ) : (
              <NoteButtons
                key={index}
                text={button.text}
                onPress={button.onPress}
                icon={button.icon}
              />
            )
          )}
        </ScrollView>
      );
    };

    const renderMoreMenu = () => (
      <Menu
        visible={moreOption}
        onRequestClose={hideMoreOption}
        style={styles.menu}
        anchor={
          <NoteButtons
            text="More"
            style={hashFilter != "shared" ? {} : { marginLeft: 0 }}
            onPress={showMoreOption}
            icon={home.more}
          />
        }
      >
        <MenuItem onPress={() => onCopy(note?.transcript ?? "")}>
          <MenuItemContent icon={home.copy} text="Copy note" />
        </MenuItem>
        <MenuItem onPress={onGenerateTitle}>
          <MenuItemContent icon={home.generate} text="Regenerate title" />
        </MenuItem>
        <MenuItem onPress={onReGenerateTranscript}>
          <MenuItemContent icon={home.retry} text="Regenerate transcript" />
        </MenuItem>
        <MenuItem onPress={onDownloadAudio}>
          <MenuItemContent icon={home.download} text="Download Audio" />
        </MenuItem>
        <MenuItem onPress={onDelete}>
          <MenuItemContent icon={home.deleteGrey} text="Delete" />
        </MenuItem>
      </Menu>
    );

    const renderAddMenu = () => (
      <>
        <Menu
          visible={showAddMenu}
          anchor={
            <NoteButtons
              text="Add"
              onPress={() => setShowAddMenu(true)}
              disabled={!note?.transcript}
              icon={addMenu.add}
            />
          }
          onRequestClose={closeAddMenu}
          style={isIOS ? styles.menuAttachIOS : styles.menuAttachAndroid}
          animationDuration={150}
        >
          {!isSubnote && (
            <MenuItem style={styles.menuItemContent} onPress={onThreadNote}>
              <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                <Foundation name="record" size={24} color="red" />
                <Text style={styles.menuItemText}>Thread a Note</Text>
              </View>
            </MenuItem>
          )}
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => {
              setShowImagePicker(true);
              closeAddMenu();
            }}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={addMenu.camera} />
              <Text style={styles.menuItemText}>Photo</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => {
              setShowLinkEditModal(true);
              closeAddMenu();
            }}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml style={{ marginLeft: 4 }} xml={addMenu.link} />
              <Text style={[styles.menuItemText, { marginLeft: 14 }]}>
                Link
              </Text>
            </View>
          </MenuItem>
        </Menu>
      </>
    );

    const renderCreateMenu = () => {
      return (
        <Menu
          visible={createOption}
          onRequestClose={hideCreateOption}
          style={isIOS ? styles.menuIOS : styles.menu}
          anchor={
            <NoteButtons
              text="Create"
              onPress={showCreateOption}
              disabled={!note?.transcript}
              icon={home.create}
            />
          }
          animationDuration={150}
        >
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("summary")}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={CreateModalSvg.summary} />
              <Text style={styles.menuItemText}>Summarize</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("points")}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={CreateModalSvg.points} />
              <Text style={styles.menuItemText}>Main points</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("todo")}
          >
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.todo} />
              <Text style={styles.menuItemText}>To-do list</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("blog")}
          >
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.blog} />
              <Text style={styles.menuItemText}>Blog post</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("tweet")}
          >
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.tweet} />
              <Text style={styles.menuItemText}>Tweet</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItemContent}
            onPress={() => onCreate("email")}
          >
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.email} />
              <Text style={styles.menuItemText}>Email</Text>
            </View>
          </MenuItem>
        </Menu>
      );
    };

    const refreshNoteAfterAttachmentChange = async () => {
      await queryClient.invalidateQueries("all-recording");
    };

    if (!note) return null;
    const isNoteExpanded = useMemo(() => expand === index, [index, expand]);
    if (isNoteExpanded) {
    }

    return (
      <View>
        <TouchableOpacity
          onPress={onExpand}
          style={[
            styles.container,
            isNoteExpanded && !isSingle && styles.expandedContainer,
          ]}
        >
          {!isSubnote && (
            <Text style={styles.date}>{formatDate(note?.created_at)}</Text>
          )}
          <View style={styles.row}>
            {audioLoading == index ? (
              <CircularLoader />
            ) : (
              <Touchable onPress={onPlay}>
                <SvgXml xml={isPlay == index ? home.pause : home.play} />
              </Touchable>
            )}

            <View style={styles.content}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {note?.is_title_loading ? (
                  <AiLoader
                    text="Creating title from your voice"
                    style={{ marginTop: 0 }}
                    size={14}
                  />
                ) : (
                  <>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <ChatBubble cursorSvg={note?.status === 'uploading'?notePreviewSVG.blackCircle : notePreviewSVG.flower} showCursorAtEnd={note?.title === 'New Recording' } message={note?.title} />
                    </View>
                    {isNoteExpanded && (
                      <StatusIndicator
                        status={note?.status}
                        onRetry={() => syncUpNote(note)}
                      />
                    )}
                  </>
                )}
              </View>

              {note.is_transcript_loading && (
                <AiLoader
                  text={`Creating transcript from your voice`}
                  style={{ marginTop: 0 }}
                  size={14}
                />
              )}

              {note?.status === "uploading" && (
                <Text style={{}}>{formattedDuration}</Text>
              )}

              {note?.transcript && !note.is_transcript_loading && (
                <ChatBubble
                  lines={expand == index ? 10000 : 4}
                  style={styles.text}
                  message={note?.transcript
                    ?.replaceAll(/<br\/?>/g, "\n")
                    ?.trimEnd()}
                  continueGenerating={!note?.title}
                  triggerAnimation={triggerTypingTranscript}
                  disableGenerating={() => setTriggerTypingTranscript(0)}
                />
              )}

              <TagsList note={note} />
              {attachments?.length > 0 && (
                <AttachmentViewer
                  attachments={attachments}
                  onAttachmentUpdate={refreshNoteAfterAttachmentChange}
                  onEditLink={(linkItem) => {
                    setShowLinkEditModal(true);
                    setEditingLink(linkItem);
                  }}
                />
              )}
              {expand === index && (
                <>
                  {renderButtons()}
                  <RelatedNotesList note={note} />
                  {token && (
                    <CreationsList
                      note={note}
                      createType={createType}
                      creationLoader={creationLoader}
                    />
                  )}
                  <Text style={styles.timestamp}>
                    {formatDateTime(note?.created_at)}
                  </Text>
                </>
              )}
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
        </TouchableOpacity>

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

        {note?.subnotes?.length > 0 && (
          <Subnote
            list={note?.subnotes}
            setExpand={setExpand}
            expand={expand}
            hashFilter={hashFilter}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 8,
  },
  expandedContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
  },
  content: {
    marginLeft: 9,
    flex: 1,
  },
  date: {
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Primary-Medium",
    fontSize: 16,
    color: "#222",
    lineHeight: 24,
  },
  text: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "rgba(34, 34, 34, 0.9)",
    lineHeight: 22,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    paddingBottom: 4,
  },
  menu: {
    borderRadius: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "flex-start",
  },
  menuItemText: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    marginLeft: 12,
  },
  timestamp: {
    color: Colors.grey3,
    fontFamily: "Primary",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 8,
  },
});

export default memo(NotePreview);
