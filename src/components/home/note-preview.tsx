import Colors from "assets/Colors";
import { home } from "assets/svg/home";
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
  useAddTitle,
  useAddTranscript,
  useCreate,
  useDeleteRecording,
  useGetAiCreation,
  useRecordings,
  useSaveEditedNote,
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
import { isIOS, screenWidth } from "utils/common";
import { Link, router, useRouter } from "expo-router";
import { CreateModalSvg } from "assets/svg/CreateModal";
import AiCreatedView from "./ai-created-view";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { MAIN_URL } from "services/api/api-constants";
import { useUnpublishRecording } from "queries/home/share";
import * as wb from "expo-web-browser";
import PublishedModal from "./published-modal";
import {
  deleteFromTempRecordings,
  setRecordingList,
  setTempRecordings,
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
      hideIcons = false,
      onDeleteCallBack = () => {},
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
    const [relatedNoteLoading, setRelatedNoteLoading] = useState(false);
    const [titleLoading, setTitleLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
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
    const addTitleRecord = useAddTitle();
    const signedURL = useSignedUrl();
    const createAI = useCreate();
    const addTranscript = useAddTranscript();
    const unPublishRecording = useUnpublishRecording();
    const relatedNotes = useGetRelatedRecording(index ?? 0);
    const NetInfo = useNetInfo();

    const isUploadingFailed =
      !!note?.audio?.data?.url && note.isUploading == false;

    useEffect(() => {
      if (triggerTypingTranscript == 0 && !note?.transcript)
        setTriggerTypingTranscript(0.02);
    }, [note?.transcript]);

    useEffect(() => {
      if (triggerTypingTitle == 0 && !note?.title) setTriggerTypingTitle(0.02);
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
        params: { index, id: note?.id, note: JSON.stringify(note) },
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
      setTitleLoading(true);
      hideMoreOption();
      // dispatch(updateTitle({title:'',index}))
      await addTitleRecord.mutateAsync(note?.id);
      setTitleLoading(false);
    };

    const onReGenerateTranscript = async () => {
      setTranscriptLoading(true);
      hideMoreOption();
      // dispatch(updateTranscript({transcript:'',index}))
      await addTranscript.mutateAsync(note?.id);
      setTranscriptLoading(false);
    };

    const onRetry = async () => {
      if (isUploadingFailed) {
        setUploadLoading(true);
        await onUploadRetry(note).catch(() => {
          const temp = [...tempRecordings];
          temp[index] = {
            ...temp[index],
            isUploading: false,
            is_audio_corrupted: false,
            error: null,
          };
          dispatch(setTempRecordings([...temp]));
        });
        setUploadLoading(false);
      } else {
        console.warn("Retry transcript");
        setTranscriptLoading(true);
        // dispatch()
        await addTranscript
          .mutateAsync(note?.id, {
            onSuccess: async () => {
              setTranscriptLoading(false);
              await addTitleRecord.mutateAsync(note?.id);
            },
            onError: () => {
              setTranscriptLoading(false);
            },
          })
          .catch(() => {
            setTranscriptLoading(false);
          });
      }
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
              if (note?.id) {
                setDeleteLoading(true);
                await deleteRecord.mutateAsync("").catch(() => {
                  setDeleteLoading(false);
                });
                setDeleteLoading(false);
                onDeleteCallBack();
              } else dispatch(deleteFromTempRecordings(note));
            },
          },
        ]
      );
    };
    const onPlaybackStatusUpdate = async (status: any) => {
      if (status?.isLoaded && !status?.isPlaying && status?.didJustFinish) {
        // Audio playback has finished
        setIsPlay(-1);
        await play?.unloadAsync();
        setPlay(null);
      } else if (status?.isPlaying) {
        setAudioLoading(-1);
      }
    };

    const onPlaySet = async (res: any) => {
      try {
        setIsPlay(index);
        const { sound } = await Audio.Sound.createAsync(
          { uri: res.data?.url || "" },
          { shouldPlay: true, isLooping: false },
          onPlaybackStatusUpdate
        );
        setPlay(sound);
      } catch {}
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
        if (isPlay != index) {
          setAudioLoading(index);
          if (!!note?.audio?.data?.url) {
            onPlaySet(note?.audio);
          }
          if (note.audioUrl?.length) {
            onPlaySet(note.audioUrl);
          } else {
            console.log("going for signedurl");
            signedURL.mutate(note?.id, {
              onSuccess: async (r) => {
                onPlaySet(r);
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

    const formattedDuration = (duration = 0) => 0;

    // const creationList = useMemo(() => note?.creations, [list]);

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
      if (note?.related_notes?.length == 0 && !!note?.transcript) {
        setRelatedNoteLoading(true);
      }
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
      console.log(note);
      console.log(note.audio);

      console.log("Audio URL  = ", note?.audio?.data?.url);

      let audioUrl = "";
      if (note?.audio?.data?.url) {
        audioUrl = note?.audio?.data?.url;
      } else {
        const resp = await signedURL.mutateAsync(note?.id);
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

        let fileUri = audioUrl;

        if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
          const fileName = `audio_${Date.now()}.mp3`;
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

    const renderButtons = () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonContainer}
      >
        <NoteButtons
          text="Add"
          onPress={() => setShowAddMenu(true)}
          icon={addMenu.add}
        />
        <NoteButtons text="Edit" onPress={onEdit} icon={home.edit} />
        <NoteButtons text="Tag" onPress={onGotoAddTag} icon={home.hash1} />
        <NoteButtons
          text="Create"
          onPress={showCreateOption}
          icon={home.create}
        />
        <NoteButtons text="Share" onPress={onShareNote} icon={home.share1} />
        <NoteButtons text="More" onPress={showMoreOption} icon={home.more} />
      </ScrollView>
    );

    const renderMoreMenu = () => (
      <Menu
        visible={moreOption}
        onRequestClose={hideMoreOption}
        style={styles.menu}
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
          // anchor={}
          onRequestClose={closeAddMenu}
          style={isIOS ? styles.menuAttachIOS : styles.menuAttachAndroid}
          animationDuration={150}
        >
          {!isSubnote && (
            <MenuItem style={styles.menuItem} onPress={onThreadNote}>
              <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                <Foundation name="record" size={24} color="red" />
                <Text style={styles.menuItemTxt}>Thread a Note</Text>
              </View>
            </MenuItem>
          )}
          <MenuItem
            style={styles.menuItem}
            onPress={() => {
              setShowImagePicker(true);
              closeAddMenu();
            }}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={addMenu.camera} />
              <Text style={styles.menuItemTxt}>Photo</Text>
            </View>
          </MenuItem>
          <MenuItem
            style={styles.menuItem}
            onPress={() => {
              setShowLinkEditModal(true);
              closeAddMenu();
            }}
          >
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml style={{ marginLeft: 4 }} xml={addMenu.link} />
              <Text style={[styles.menuItemTxt, { marginLeft: 14 }]}>Link</Text>
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
          animationDuration={150}
        >
          <MenuItem style={styles.menuItem} onPress={() => onCreate("summary")}>
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={CreateModalSvg.summary} />
              <Text style={styles.menuItemTxt}>Summarize</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={() => onCreate("points")}>
            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
              <SvgXml xml={CreateModalSvg.points} />
              <Text style={styles.menuItemTxt}>Main points</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={() => onCreate("todo")}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.todo} />
              <Text style={styles.menuItemTxt}>To-do list</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={() => onCreate("blog")}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.blog} />
              <Text style={styles.menuItemTxt}>Blog post</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={() => onCreate("tweet")}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.tweet} />
              <Text style={styles.menuItemTxt}>Tweet</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={() => onCreate("email")}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.email} />
              <Text style={styles.menuItemTxt}>Email</Text>
            </View>
          </MenuItem>
        </Menu>
      );
    };

    const renderCreations = () => {
      if (!token) return;

      return (
        <>
          {creationLoader && (
            <AiLoader
              text={creationContent[createType]}
              style={{ marginTop: 8 }}
              size={14}
            />
          )}

          {note.creations?.map((itm: any, i: number) => (
            <AiCreatedView
              id={itm?.id}
              type={itm?.type}
              date={itm?.created_at}
              content={itm?.content?.data}
              key={i}
            />
          ))}
        </>
      );
    };

    const renderRelatedNotes = () => {
      if (!note?.related_notes?.length) return null;
      return (
        note?.transcript && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 12,
                color: "#0D0D0D",
              }}
            >
              Related Notes
            </Text>
            <View
              style={{
                marginTop:
                  note?.related_notes?.length == 0 && relatedNoteLoading
                    ? 8
                    : 3,
              }}
            >
              {note?.related_notes?.length == 0 && relatedNoteLoading ? (
                <CircularLoader width={16} height={16} />
              ) : (
                note?.related_notes?.map((item: any) => {
                  return (
                    <Touchable
                      onPress={() => {
                        router.push({
                          pathname: "/RelatedNotes/",
                          params: { id: item?.id },
                        });
                      }}
                      activeOpacity={0.6}
                      key={item?.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.grey3,
                          fontFamily: "Primary-Medium",
                          fontSize: 12,
                          width: screenWidth / 8,
                        }}
                      >
                        {formatDate(item?.created_at, false, true)}
                      </Text>
                      <Text
                        style={{
                          color: Colors.black2,
                          fontFamily: "Primary-Medium",
                          fontSize: 12,
                          width: screenWidth / 1.6,
                        }}
                        numberOfLines={1}
                      >
                        {item?.title}
                      </Text>
                    </Touchable>
                  );
                })
              )}
            </View>
          </View>
        )
      );
    };

    const refreshNoteAfterAttachmentChange = async () => {
      await queryClient.invalidateQueries("all-recording");
    };

    return (
      <View>
        <TouchableOpacity
          onPress={onExpand}
          style={[
            styles.container,
            expand === index && !isSingle && styles.expandedContainer,
          ]}
        >
          {!isSubnote && (
            <Text style={styles.date}>{formatDate(note?.created_at)}</Text>
          )}
          <View style={styles.row}>
            <TouchableOpacity onPress={onPlay}>
              <SvgXml xml={isPlay === index ? home.pause : home.play} />
            </TouchableOpacity>
            <View style={styles.content}>
              <View style={{ flexDirection: "row" }}>
                <ChatBubble style={styles.title} message={note?.title} />

                <Text>Status: {note?.status}</Text>
              </View>

              {!!note?.transcript && transcriptLoading && note?.title ? (
                <AiLoader
                  text={`Creating transcript from your voice`}
                  style={{ marginTop: 0 }}
                  size={14}
                />
              ) : (
                !!note?.transcript && (
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
                )
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
                  {renderMoreMenu()}
                  {renderAddMenu()}
                  {renderCreateMenu()}
                  {renderRelatedNotes()}
                  {renderCreations()}
                </>
              )}

              <Text style={styles.timestamp}>
                {formatDateTime(note?.created_at)}
              </Text>
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

const TagsList = ({ note, onPress }: any) => {
  console.log(note.tags);

  return (
    note?.tags?.length > 0 && (
      <View style={[styles.row, { flexWrap: "wrap" }]}>
        {note?.tags?.map((tag: any, i: number) => (
          <Text
            key={i}
            style={styles.tag}
            onPress={() => onPress(tag)}
            suppressHighlighting
          >
            {"#" + tag?.name}
          </Text>
        ))}
      </View>
    )
  );
};

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

export default NotePreview;
