import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Alert, Animated, Image, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate, formatDateTime, isSameDay } from "utils/format-date";
import { Menu, MenuItem } from "react-native-material-menu";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Audio } from "expo-av";
import { useAddTitle, useAddTranscript, useCreate, useDeleteRecording, useGetAiCreation, useRecordings, useSaveEditedNote, useSignedUrl, useToggleStar } from "queries/home";
import { useQueryClient } from "react-query";
import { setStringAsync } from "expo-clipboard";
import ChatBuble from "components/common/chat-buble";
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
import * as wb from 'expo-web-browser';
import PublishedModal from "./published-modal";
import { deleteFromTempRecordings, setRecordingList, setTempRecordings } from "redux/reducers/recordingStates";
import listenAiCreate from "func/firebase/listen-ai-create";
import NoteButtons from "components/common/note-buttons";
import { ScrollView } from "react-native";
import { useGetRelatedRecording } from "queries/home/relatedNote";
import Subnote from "./subnote";
import creationContent from "utils/constants/creation-content";
import { useNetInfo } from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";
import threeDotLoader from 'assets/lottie/threeDotLoader.json'
import threeDotLoader2 from 'assets/lottie/threeDotLoader2.json'
import { Foundation } from '@expo/vector-icons';
import { addMenu } from "assets/svg/AddMenu";
import AttachmentViewer from "components/NotePreview/AttachmentViewer";
import ImageUploader from "components/NotePreview/ImageUploader";
import AddEditLinkInput from "components/NotePreview/AddEditLinkInput";
import AddEditLinkModal from "components/NotePreview/AddEditLinkInput";

export default forwardRef(({
  note,
  onUploadRetry,
  hashFilter,
  expand,
  setExpand,
  isSingle = false,
  isSubnote = false,
  list, index, isPlay, setIsPlay, play, setPlay, audioLoading, setAudioLoading, hideIcons = false, onDeleteCallBack = () => { },
  onStartRecord = (obj: {parent_id: string | null, repeat : boolean | null }) => { },
}: any, ref) => {
  const route = useRouter()
  const [editNote, setEditNote] = useState(note)
  const [tag, setTag] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [moreOption, setMoreOption] = useState(false);
  const [createOption, setCreateOption] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [isPublished, setIsPublished] = useState(note?.is_published ?? false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [isNoteJustMadePrivate, setIsNoteJustMadePrivate] = useState(false);
  const [creationLoader, setCreationLoader] = useState(false);
  const [triggerTypingTitle, setTriggerTypingTitle] = useState(0);
  const [triggerTypingTranscript, setTriggerTypingTranscript] = useState(0);
  const [createType, setCreateType] = useState('summary')
  const [relatedNoteLoading, setRelatedNoteLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showLinkEditModal, setShowLinkEditModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{ id: string; url: string } | null>(null);
  const [attachments, setAttachments] = useState([]);

  const dispatch = useDispatch()

  const { token } = useSelector((state: RootState) => state.userDetails)
  const { tempRecordings } = useSelector((state: RootState) => state.recordingStates);

  const queryClient = useQueryClient();
  const deleteRecord = useDeleteRecording(note?.id)
  const addTitleRecord = useAddTitle()
  const signedURL = useSignedUrl()
  const createAI = useCreate()
  const getAiCreation = useGetAiCreation()
  const addTranscript = useAddTranscript()
  const unPublishRecording = useUnpublishRecording()
  const recordingQuery = useRecordings(hashFilter == 'All' ? '' : hashFilter)
  const relatedNotes = useGetRelatedRecording(index ?? 0)
  const NetInfo = useNetInfo()

  const isUploadingFailed = (!!note?.audio?.data?.url && note.isUploading == false)

  useEffect(() => {
    if (triggerTypingTranscript == 0 && !note?.transcript)
      setTriggerTypingTranscript(2)
  }, [note?.transcript])

  useEffect(() => {
    if (triggerTypingTitle == 0 && !note?.title)
      setTriggerTypingTitle(2)
  }, [note?.title])

  useEffect(()=>{
    setAttachments(note?.attachments)
  },[note?.attachments])

  const hideMoreOption = () => setMoreOption(false);
  const showMoreOption = () => setMoreOption(true);
  const hideCreateOption = () => setCreateOption(false);
  const showCreateOption = () => setCreateOption(true);
  const closeAddMenu = ()=>setShowAddMenu(false)

  const onEdit = () =>{
    // router.navigate({ pathname: '/edit-note/', params: { note:JSON.stringify(note) ,index} })
    router.navigate({ pathname: '/edit-note/', params: { index, id: note?.id,note:JSON.stringify(note)} })

  }
  const onGotoAddTag = () => {
    hideMoreOption()
    setTimeout(() => {
      const tags = note?.tags?.flatMap((tag: any) => tag?.name)
      route.push({ pathname: "/add-tags/", params: { tagsArray: JSON.stringify(tags), recording_id: note?.id } })
    }, 500);
  }

  const getCreation = async (id: number) => {
    await queryClient.refetchQueries('all-recording')
    isSingle && await queryClient.resetQueries('single-recording')
    setCreationLoader(false)
  }

  const onCreate = async (type = 'summary') => {
    setCreateType(type)
    setCreationLoader(true)
    hideCreateOption()
    await createAI.mutateAsync({ recording_id: note?.id, type }, {
      onSuccess: async (r) => {
        await listenAiCreate({ id: r?.data?.id, getCreation })
      },
      onError: () => setCreationLoader(false)
    })
  }

  const onGenerateTitle = async () => {
    setTitleLoading(true)
    hideMoreOption();
    // dispatch(updateTitle({title:'',index}))
    await addTitleRecord.mutateAsync(note?.id)
    setTitleLoading(false)
  }

  const onReGenerateTranscript = async () => {
    setTranscriptLoading(true)
    hideMoreOption();
    // dispatch(updateTranscript({transcript:'',index}))
    await addTranscript.mutateAsync(note?.id)
    setTranscriptLoading(false)
  }

  const onRetry = async () => {
    if (isUploadingFailed) {
      setUploadLoading(true)
      await onUploadRetry(note).catch(() => {
        const temp = [...tempRecordings]
        temp[index] = { ...temp[index], isUploading: false, is_audio_corrupted: false}
        dispatch(setTempRecordings([...temp]))
      })
      setUploadLoading(false)
    } else {
      note.transcript = ''
      note.title = null
      await addTranscript.mutateAsync(note?.id, {
        onSuccess: async () => await addTitleRecord.mutateAsync(note?.id)
      })
    }
  }
  
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
              setShareVisible(false)
              setTimeout(() => {
                if (wasPublic) {
                  setIsNoteJustMadePrivate(true);
                } else {
                  setIsNoteJustMadePrivate(false);
                }
                setIsPublished((t:any)=>!t)
              }, 50);
              await queryClient.invalidateQueries('all-recording')
            } catch (e) {
              console.info("error in toggle publish", e);
            } finally {
              setPublishLoading(false);
              setTimeout(() => {
                setShareVisible(true)
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
      setIsNoteJustMadePrivate(false)
    }, 50);
  }

  const onShareNote = () => {
    hideMoreOption();
    setTimeout(() => {
      setShareVisible(true)
    }, 500);
  }

  const onCopy = async (content = '') => {
    hideMoreOption();
    await setStringAsync(content);
    setShareVisible(false)
  }
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

    Alert.alert('', 'Are you sure you want to delete?', [
      {
        text: 'No',
        style: 'cancel'
      },
      {
        text: 'Yes',
        onPress: async () => {
          if (isUploadingFailed)
            dispatch(deleteFromTempRecordings(note))
          else {
            await deleteRecord.mutateAsync('')
            onDeleteCallBack()
          }
        }
      }
    ])
  }
  const onPlaybackStatusUpdate = async (status: any) => {
    if (status?.isLoaded && !status?.isPlaying && status?.didJustFinish) {
      // Audio playback has finished
      setIsPlay(-1)
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
        onPlaybackStatusUpdate,
      );
      setPlay(sound);
    } catch { }
  }

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
      setIsPlay(-1)
      await play?.unloadAsync()
      setPlay(null)
      if (isPlay != index) {
        setAudioLoading(index);
        if (!!note?.audio?.data?.url) {
          onPlaySet(note?.audio)
        } else {
          signedURL.mutate(note?.id, {
            onSuccess: async (r) => {
              onPlaySet(r)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  useEffect(() => {
    if (!note?.public_slug) {
      setIsPublished(false)
    }
  }, [note?.public_slug]);

  useEffect(() => {
    setEditNote(note); // Update editNote when the note prop changes
  }, [note]);

  const formattedDuration = (duration = 0) => new Date(duration).toISOString().substring(14, 19);

  const creationList = useMemo(() => note?.creations, [list])

  const isLongTranscript=!!note?.transcript&&note?.transcript?.length>520?true:false
  let opacity = new Animated.Value(1);

  const onExpand = async () => {
    setShowImagePicker(false)
    setShowLinkEditModal(false)
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
      setRelatedNoteLoading(true)
      await relatedNotes.mutateAsync(note?.id)
      setTimeout(() => {
        setRelatedNoteLoading(false)
      }, 3000);
    }
  }

  useEffect(()=>{
    if(expand>-1&&isLongTranscript){
      opacity.setValue(0)
      Animated.timing(opacity,{
        duration:270,
        toValue:1,
        useNativeDriver:true
      }).start()
    }
  },[expand])

  const onThreadNote = () => {
    onStartRecord({parent_id: note.id})
    closeAddMenu()
  }

  const slug = note.public_slug || ""
  
  const refreshNoteAfterAttachmentChange =async ()=>{
    await queryClient.refetchQueries('all-recording')
  }

  return (
    <View>
      <Touchable onPress={onExpand} activeOpacity={1} style={[styles.container, (expand == index && !isSingle) ? { backgroundColor: '#f7f7f7', borderRadius: isSubnote ? 12 : 0, } : {}]}>
        {!isSubnote && (index == 0 || (index != 0 && !isSameDay(note?.created_at, list[index - 1]?.created_at))) &&
          <Text style={styles.date}>{formatDate(note?.created_at)}</Text>}
        <View style={{ flexDirection: "row" }}>
          <View style={[{ alignItems: 'flex-start' }]}>
            {audioLoading == index ?
              <CircularLoader />
              : <Touchable onPress={onPlay}>
                <SvgXml xml={isPlay == index ? home.pause : home.play} />
              </Touchable>}
            <View style={styles.timeLine} />
          </View>
          <View style={{ marginLeft: 9, flex: 1, marginTop: -3 }}>
            {(!!note?.title&&note?.title?.length>0&&titleLoading==false) ?
              // <Touchable onPress={()=>{
              //   router.push({pathname:"/RelatedNotes/",params:{id:note?.id}});}}>
              <ChatBuble style={styles.title} message={note?.title} triggerAnimation={triggerTypingTitle} disableGenerating={() => setTriggerTypingTitle(0)} />
              // </Touchable>
              : isUploadingFailed ? note?.is_audio_corrupted? <Text style={[styles.title, { color: '#ff4538' }]}>{note?.error||''}</Text>
                  :<Text style={styles.title}>{`New recording (${formattedDuration(note?.audio?.data?.duration)})`}</Text>
                : note?.transcript === null ? <Text style={[styles.title, { color: '#ff4538' }]}>There was an error generating your transcript.{note?.transcript}</Text>
                  : <AiLoader text={note?.isUploading ? `Uploading your audio` : `Creating ${!note?.transcript ? 'transcript' : 'title'} from your voice`} style={{ marginTop: -5 }} />
            }
            {isUploadingFailed && !note?.is_audio_corrupted &&
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <SvgXml xml={home.wait} style={{ marginTop: 8, marginRight: 8 }} />
                <Text style={[styles.text, { color: Colors.grey3, fontFamily: 'Primary-Italic', width: screenWidth / 1.3 }]} numberOfLines={2}>{`Synced and transcribed when you’re back online.`}</Text>
              </View>}
            {((!note?.transcript && note?.title) || transcriptLoading) ? <AiLoader text={`Creating transcript from your voice`} style={{ marginTop: 0 }} size={14} />
              : !!note?.transcript && <ChatBuble lines={expand == index ? 10000 : 4} style={styles.text} message={note?.transcript?.replaceAll(/<br\/?>/g, '\n')?.trimEnd()} continueGenerating={!note?.title} triggerAnimation={triggerTypingTranscript} disableGenerating={() => setTriggerTypingTranscript(0)} />}
            <Animated.View style={{flex:1,opacity:expand==index?opacity:1}}><TagsList note={note} onPress={(tag: any) => dispatch(setTagsFilter(tag?.name))} /></Animated.View>


            {attachments?.length> 0 &&<AttachmentViewer 
              attachments={attachments} 
              onAttachmentUpdate={refreshNoteAfterAttachmentChange}
              onEditLink={(linkItem)=>{
                setShowLinkEditModal(true)
                setEditingLink(linkItem)
              }}
              />}


            {expand == index && <>
              {!hideIcons && note?.transcript != null && !note?.isUploading &&
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.row, { marginLeft: -6, paddingTop: 16, paddingBottom: 4, paddingLeft: 2, }]}>
                  {hashFilter != 'shared' &&
                    <>
                    { <Menu
                          visible={showAddMenu}
                          anchor={<NoteButtons text="Add" onPress={()=>setShowAddMenu(true)} disabled={!note?.transcript} icon={addMenu.add} />}
                          onRequestClose={closeAddMenu}
                          style={styles.menu}
                          animationDuration={150}
                        >
                        {!isSubnote &&  <MenuItem style={styles.menuItem} onPress={onThreadNote}>
                            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                              <Foundation name="record" size={24} color="red" />
                              <Text style={styles.menuItemTxt}>Thread a Note</Text>
                            </View>
                          </MenuItem>}
                          <MenuItem style={styles.menuItem} onPress={()=>{
                            setShowImagePicker(true)
                            closeAddMenu()}}>
                            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                              <SvgXml xml={addMenu.camera} />
                              <Text style={styles.menuItemTxt}>Photos</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => {
                            setShowLinkEditModal(true)
                            closeAddMenu()
                          }}>
                            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                              <SvgXml style={{marginLeft: 4}} xml={addMenu.link} />
                              <Text style={styles.menuItemTxt}>Link</Text>
                            </View>
                          </MenuItem>
                      </Menu>}


                      {showImagePicker && <ImageUploader 
                        showImagePicker={showImagePicker} 
                        setShowImagePicker={setShowImagePicker} 
                        setAttachments={setAttachments}
                        onAttachmentUpdate = {refreshNoteAfterAttachmentChange}
                        noteId={note?.id}
                        />}

                      <AddEditLinkModal
                        noteId={note?.id}
                        onAttachmentUpdate={refreshNoteAfterAttachmentChange}
                        editingLink={editingLink}
                        isVisible={showLinkEditModal}
                        onClose={() => {
                          setShowLinkEditModal(false)
                          setEditingLink(null)
                        }}/>

                      <NoteButtons text="Edit" onPress={onEdit} icon={home.edit} disabled={!note?.transcript} />
                      <NoteButtons icon={home.hash1} text="Tag" onPress={onGotoAddTag} />
                      
                      {
                        <Menu
                          visible={createOption}
                          anchor={<NoteButtons text="Create" onPress={showCreateOption} disabled={!note?.transcript} icon={home.create} />}
                          onRequestClose={hideCreateOption}
                          style={isIOS?styles.menuIOS:styles.menu}
                          animationDuration={150}
                        >
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('summary')}>
                            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                              <SvgXml xml={CreateModalSvg.summary} />
                              <Text style={styles.menuItemTxt}>Summarize</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('points')}>
                            <View style={[styles.row, { width: screenWidth / 2.8 }]}>
                              <SvgXml xml={CreateModalSvg.points} />
                              <Text style={styles.menuItemTxt}>Main points</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('todo')}>
                            <View style={styles.row}>
                              <SvgXml xml={CreateModalSvg.todo} />
                              <Text style={styles.menuItemTxt}>To-do list</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('blog')}>
                            <View style={styles.row}>
                              <SvgXml xml={CreateModalSvg.blog} />
                              <Text style={styles.menuItemTxt}>Blog post</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('tweet')}>
                            <View style={styles.row}>
                              <SvgXml xml={CreateModalSvg.tweet} />
                              <Text style={styles.menuItemTxt}>Tweet</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={() => onCreate('email')}>
                            <View style={styles.row}>
                              <SvgXml xml={CreateModalSvg.email} />
                              <Text style={styles.menuItemTxt}>Email</Text>
                            </View>
                          </MenuItem>
                        </Menu>}
                      <NoteButtons icon={home.share1} text="Share" onPress={onShareNote} />
                    </>
                    
                    }
                  {
                 
                    <Menu
                      visible={moreOption}
                      anchor={
                        <NoteButtons text="More" style={hashFilter != 'shared' ? {} : { marginLeft: 0 }} onPress={showMoreOption} icon={home.more} />
                      }
                      onRequestClose={hideMoreOption}
                      style={isIOS?styles.menuIOS:styles.menu}
                      animationDuration={150}
                    >
                      {hashFilter != 'shared' ?
                        <>
                          <MenuItem style={styles.menuItem} onPress={() => onCopy(note?.transcript ?? '')}>
                            <View style={styles.row}>
                              <SvgXml xml={home.copy} />
                              <Text style={styles.menuItemTxt}>Copy note</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={onGenerateTitle}>
                            <View style={[styles.row]}>
                              <SvgXml xml={home.generate} />
                              <Text style={styles.menuItemTxt}>Regenerate title</Text>
                            </View>
                          </MenuItem>
                          <MenuItem style={styles.menuItem} onPress={onReGenerateTranscript}>
                            <View style={[styles.row]}>
                              <SvgXml xml={home.retry} />
                              <Text style={styles.menuItemTxt}>Regenerate transcript</Text>
                            </View>
                          </MenuItem>
                          {!!token && <MenuItem style={styles.menuItem} onPress={onDelete}>
                            <View style={styles.row}>
                              <SvgXml xml={home.deleteGrey} style={{marginLeft: 2}} />
                              <Text style={styles.menuItemTxt}>Delete</Text>
                            </View>
                          </MenuItem>}
                        </>
                        :
                        <>
                          <MenuItem style={[styles.menuItem, { paddingLeft: 0 }]} onPress={() => onCopy(MAIN_URL + '/s/' + note?.public_slug)}>
                            <Text style={styles.menuItemTxt}>Copy link</Text>
                          </MenuItem>
                          <MenuItem style={[styles.menuItem, { paddingLeft: 0 }]} onPress={togglePublish}>
                            <Text style={styles.menuItemTxt}>Unpublish</Text>
                          </MenuItem>
                        </>
                        }
                    </Menu>}
                </ScrollView>}
              {isIOS ? <Menu
                visible={shareVisible}
                anchor={null}
                onRequestClose={() => setShareVisible(false)}
                animationDuration={1}
                style={{ borderRadius: 12, width: isPublished ? screenWidth / 1.2 : 'auto' }}
              >
                <MenuItem style={{ padding: 16, width: '100%', height: '100%' }} disabled={true} >
                  {isNoteJustMadePrivate?
                    <View style={{ width: screenWidth / 1.2 }}>
                        <View style={[styles.row]}>
                          <SvgXml xml={CreateModalSvg.plane} />
                          <Text style={{ fontSize: 14, fontFamily: 'Primary-Semibold', color: Colors.darkWithOpacity(1), lineHeight: 19.2, marginLeft: 8, width: screenWidth / 1.2 }}>
                            Your note is now private
                          </Text>
                        </View>
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                          <Touchable activeOpacity={0.5} onPress={onPrivateOk} style={{ backgroundColor: Colors.darkWithOpacity(1), alignSelf: 'flex-start', borderRadius: 12, padding: 12, paddingHorizontal: 16 }}>
                            <Text style={{ color: Colors.whiteWithOpacity(1), fontFamily: 'Primary-Semibold', fontSize: 12, marginLeft: 4 }}>Ok</Text>
                          </Touchable>
                        </View>
                      </View>
                      :isPublished?
                      <View style={{ width: screenWidth / 1.2 }}>
                        <View style={[styles.row]}>
                          <SvgXml xml={CreateModalSvg.unlock} />
                          <Text style={{ fontSize: 14, fontFamily: 'Primary-Semibold', color: Colors.darkWithOpacity(1), lineHeight: 19.2, marginLeft: 8, width: screenWidth / 1.2 }}>
                            Your shareable link is ready
                          </Text>
                        </View>
                        <Text onPress={() => wb.openBrowserAsync(MAIN_URL + '/s/' + note?.public_slug)} suppressHighlighting style={{ fontSize: 14, fontFamily: 'Primary', color: Colors.primary, textDecorationLine: 'underline', marginTop: 4, width: screenWidth / 1.2 }}>
                          {MAIN_URL + '/s/' + note?.public_slug}
                        </Text>
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                          <Touchable activeOpacity={0.5} onPress={() => onCopy(MAIN_URL + '/s/' + note?.public_slug)} style={{ backgroundColor: Colors.darkWithOpacity(1), alignSelf: 'flex-start', borderRadius: 12, padding: 12, paddingHorizontal: 16, width: 100, alignItems: 'center' }}>
                            <View style={styles.row}>
                              <SvgXml xml={CreateModalSvg.publishCopy} />
                              <Text style={{ color: Colors.whiteWithOpacity(1), fontFamily: 'Primary-Semibold', fontSize: 12, marginLeft: 4 }}>{'Copy link'}</Text>
                            </View>
                          </Touchable>
                          <Touchable activeOpacity={0.5} onPress={togglePublish} style={{ backgroundColor: Colors.darkWithOpacity(0.05), alignSelf: 'flex-start', borderRadius: 12, padding: 12, paddingHorizontal: 16, marginLeft: 12, width: 100, alignItems: 'center' }}>
                            {/* {publishLoading ? */}
                              {/* <LottieView source={threeDotLoader} autoPlay={publishLoading} loop={publishLoading} style={{ width: 30, height: 15 }} /> */}
                               <Text style={{ color: Colors.darkWithOpacity(1), fontFamily: 'Primary-Semibold', fontSize: 12 }}>Unpublish</Text>
                            {/* } */}
                          </Touchable>
                        </View>
                      </View>
                  :<View>
                      <Text style={{ fontSize: 14, fontFamily: 'Primary-Semibold', color: Colors.darkWithOpacity(1), lineHeight: 19.2 }}>
                        Are you sure you want to share this note?
                      </Text>
                      <View style={{ marginVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Touchable disabled={publishLoading} activeOpacity={0.5} onPress={togglePublish} style={{ backgroundColor: Colors.darkWithOpacity(1), alignSelf: 'flex-start', borderRadius: 12, padding: 12, paddingHorizontal: 16, width: 60, alignItems: 'center' }}>
                          {publishLoading ?
                            <LottieView source={threeDotLoader2} autoPlay loop style={{ width: 30, height: 15 }} />
                            : <Text style={{ color: Colors.whiteWithOpacity(1), fontFamily: 'Primary-Semibold', fontSize: 12 }}>Yes</Text>}
                        </Touchable>
                        <Touchable activeOpacity={0.5} onPress={() => { setShareVisible(false); setPublishLoading(false) }} style={{ backgroundColor: Colors.darkWithOpacity(0.05), alignSelf: 'flex-start', borderRadius: 12, padding: 12, paddingHorizontal: 16, marginLeft: 12, width: 60, alignItems: 'center' }}>
                          <Text style={{ color: Colors.darkWithOpacity(1), fontFamily: 'Primary-Semibold', fontSize: 12 }}>No</Text>
                        </Touchable>
                      </View>
                      <View style={[styles.row, { alignItems: 'flex-start' }]}>
                        <SvgXml xml={CreateModalSvg.info} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey, lineHeight: 16 }}>
                          {` Anyone with the link will have access to this voice note.`}
                        </Text>
                      </View>
                    </View>
                  }
                </MenuItem>
              </Menu>
                : 
                
                
                <PublishedModal 
                  slug={slug} 
                  visible={shareVisible} 
                  isPublished={isPublished} 
                  onPressCancel={() => setShareVisible(false)} 
                  onPressDone={togglePublish} 
                  isLoading={publishLoading}
                  isNoteJustMadePrivate ={isNoteJustMadePrivate}
                  setIsNoteJustMadePrivte={setIsNoteJustMadePrivate}
                  hideModal={() => setShareVisible(false)} 
                />
                }





              {((note?.transcript == null && note?.isUploading == undefined) || isUploadingFailed) &&
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 }}>
                  {NetInfo.isConnected && !note.is_audio_corrupted &&
                    <NoteButtons text="Retry" onPress={onRetry} icon={home.retryUpload} isLoading={uploadLoading||transcriptLoading} />}
                  <NoteButtons style={note.is_audio_corrupted ? {marginLeft: -4}:{}} text="Delete" onPress={onDelete} icon={home.delete} /> 
                </View>}
              {/* related notes */}
              {(!!note?.transcript && (note?.related_notes?.length > 0 || relatedNoteLoading)) &&
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontFamily: 'Primary-Semibold', fontSize: 12, color: '#0D0D0D' }}>
                    Related Notes
                  </Text>
                  <View style={{ marginTop: (note?.related_notes?.length == 0 && relatedNoteLoading) ? 8 : 3 }}>
                    {(note?.related_notes?.length == 0 && relatedNoteLoading) ?
                      <CircularLoader width={16} height={16} />
                      : note?.related_notes?.map((item: any) => {
                        return (
                          <Touchable onPress={() => { router.push({ pathname: "/RelatedNotes/", params: { id: item?.id } }); }} activeOpacity={0.6} key={item?.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Text style={{ color: Colors.grey3, fontFamily: 'Primary-Medium', fontSize: 12, width: screenWidth / 8 }}>{formatDate(item?.created_at, false, true)}</Text>
                            <Text style={{ color: Colors.black2, fontFamily: 'Primary-Medium', fontSize: 12, width: screenWidth / 1.6 }} numberOfLines={1}>{item?.title}</Text>
                          </Touchable>
                        )
                      })
                    }
                  </View>
                </View>}
              {!!token && creationLoader && <AiLoader text={creationContent[createType]} style={{ marginTop: 8 }} size={14} />}
              {!!token && creationList?.map((itm: any, i: number) => (
                <AiCreatedView id={itm?.id} type={itm?.type} date={itm?.created_at} content={itm?.content?.data} key={i} />
              ))}
              <View style={{ flex: 1, alignItems: 'flex-end', marginTop: 8 }}>
                <Text style={{ color: Colors.grey3, fontFamily: 'Primary', fontSize: 10 }}>{formatDateTime(note?.created_at)}</Text>
              </View>
            </>}
          </View>
        </View>
      </Touchable>
      {note?.subnotes?.length > 0 &&
        <Subnote
          list={note?.subnotes}
          onUploadRetry={onUploadRetry}
          setExpand={setExpand}
          expand={expand}
          hashFilter={hashFilter}
        />}
    </View>
  );
});


const TagsList = ({ note, onPress }: any) =>
  note?.tags?.length > 0 ? (
    <View style={[styles.row, { flexWrap: 'wrap' }]}>
      {note?.tags?.map((tag: any, i: number) =>
        <Text
          key={i}
          style={styles.tag}
          onPress={() => onPress(tag)}
          suppressHighlighting>
          {'#' + tag?.name}
        </Text>)}
    </View>
  ) : null;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 8, paddingTop: 14 },

 
  attachmentContainer: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '50%',
    height: 50,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  linkText: {
    marginLeft: 10,
    color: '#007AFF',
    flex: 1,
  },

  row: { flexDirection: "row", alignItems: "center" },
  btw: { justifyContent: "space-between" },
  timeLine: {
    width: 1,
    backgroundColor: Colors.primaryWithOpacity(0.1),
    marginTop: 8,
    flex: 1,
    alignSelf: 'center'
  },
  title: {
    fontWeight: "500",
    fontFamily: "Primary-Medium",
    fontSize: 16,
    color: "#222",
    lineHeight: 24,
  },
  text: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "rgba(34, 34, 34, 0.9)",
    lineHeight: isIOS ? 23 : 22,
    marginTop: 4,
    marginLeft: 0
  },
  menu: {
    borderRadius: 12,
    paddingBottom: 0
  },
  menuIOS:{
    marginTop:40,
    borderRadius: 12,
    paddingBottom: 0
  },
  menuPress: {
    height: 25,
    width: 35,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4
  },
  menuItem: { paddingLeft: isIOS ? 20 : 0, borderRadius: 12, overflow: "hidden", width: '100%', padding: 0, marginVertical: -6 },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 12,
  },
  tagInput: { color: Colors.darkWithOpacity(0.9), fontFamily: "Primary", flex: 1 },
  tag: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'Primary',
    color: '#717171',
    marginTop: 4,
    marginRight: 4,
    marginLeft: 0
  },
  date: {
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: isIOS ? 14 : 12,
    marginBottom: 8,
  },
  tagWrap: {
    backgroundColor: Colors.primaryWithOpacity(0.1),
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8
  },
  retry: { paddingHorizontal: 16, height: 36, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.darkWithOpacity(0.05), alignSelf: 'flex-start', marginTop: 0, borderRadius: 30 },
  retryTxt: { marginLeft: 2, fontFamily: 'Primary', fontSize: 12, color: '#222', marginTop: -2 }
});
