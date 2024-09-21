import {
  ActivityIndicator,
  Animated,
  DeviceEventEmitter,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { View } from "../../components/common/Themed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import Header from "components/home/header";
import NotePreview from "components/home/note-preview";
import AboutProduct from "components/home/about-product";
import AIModal from "components/AIModal";
import CreateModal from "components/CreateModal";
import SearchBar, { heightIn, heightOut } from "components/common/search-bar";
import { Audio } from "expo-av";
import BottomBar from "components/home/bottom-bar";
import {
  cancelRecording,
  checkRecordPermission,
  onRecord,
  stopRecording,
} from "func/home/record";
import { useGuestToken } from "queries/auth";
import useGuestCreate from "hooks/auth/useGuestCreate";
import { useGetTags, useRecordings, useStreak } from "queries/home";
import { useQueryClient } from "react-query";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSingleRecording, isIOS, screenHeight } from "utils/common";
// import AskMeSomething from "components/ask-me-something";
import { Redirect, router, useNavigation } from "expo-router";
import useIAPInfo from "hooks/iap/useIAPInfo";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Text } from "react-native";
import Colors from "assets/Colors";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import {
  setRecordingList,
  setTempRecordingData,
  setTriggerTypingTitle,
  setTriggerTypingTranscript,
  updateRecordingDetails,
  updateTempRecordingData,
} from "redux/reducers/recordingStates";
import NetInfo from "@react-native-community/netinfo";
import { setCanRecord } from "redux/reducers/userDetails";
import BannerAlert from "components/common/banner-alert";
import { analytics, db } from "../../../firebaseConfig";
import { saveVoiceNote } from "func/home/uploadAudioFb";
import { off, onValue, ref, remove, update } from "firebase/database";
import {  RecordingStatus,} from "func/firebase/recording-event-listener";
import axiosApi from "services/api/axios-api";
import { NewNote, Note } from "types";
import { combineRecordings, removeExtraOldAudios } from "utils/audioUtils";
import useWatchNetInfo from "hooks/watch/useWatchNetInfo";
import CustomModal from "components/common/custom-modal";
import RelatedNotes from "app/RelatedNotes";
import { setRelatedNoteId } from "redux/reducers/relatedNoteStates";
import * as FileSystem from 'expo-file-system';
import useLayoutAnim from "hooks/anim/useLayoutAnim";
import CircularLoader from "components/common/loaders/circular-loader";
import usePremiumPrompt from "hooks/iap/usePremiumPrompt"
import TagButtons from "components/home/tag-buttons";
import { setHashTags } from "redux/reducers/hashSlice";
import Streaks from "components/streaks";
import { NativeEventEmitter, NativeModules } from 'react-native';
import QuickActions from 'react-native-quick-actions';
import * as Linking from 'expo-linking';

const DOCUMENT_FOLDER = `${FileSystem.documentDirectory}`;

const { height } = Dimensions.get("screen");
const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
};
const fadeOut = {
  from: { opacity: 1 },
  to: { opacity: 0 },
};

const KeyboardAvoidView:any = KeyboardAvoidingView;

export default () => {
  const { ActionModule } = NativeModules;
  const actionEmitter = new NativeEventEmitter(ActionModule);
  const insets = useSafeAreaInsets();
  const notePreviewRef = useRef<any>();
  const {hashFilter} = useSelector((state: RootState) => state.hash);
  const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
  const {canRecord} = useSelector((state: RootState) => state.userDetails);
  const [expandNote,setExpandNote] = useState(-1)
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const { recordingList,tempRecordingData } = useSelector(
    (state: RootState) => state.recordingStates
  );
  const createGuestUser = useGuestToken();
  const dispatch = useDispatch();
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const AIModalRef = useRef<any>();
  const CreateModalRef = useRef<any>();
  const [isPlay, setIsPlay] = useState(-1);
  const [play, setPlay] = useState<Audio.Sound | null>();
  const [audioLoading, setAudioLoading] = useState(-1);
  const scrollRef = useRef<FlatList>(null);
  const soundRef = useRef<any>(null);
  const [hideSearch, setHideSearch] = useState(true);
  const [showAskMe, setShowAskMe] = useState(true);
  const [hideBackground, setHideBg] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isOffline, setOffline] = useState(false);
  const [splitCount, setSplitCount] = useState(0);
  const [recordingParentId, setRecordingParentId] = useState<string | null>(
    null
  );
  const {relatedNoteId} = useSelector((state: RootState) => state.relatedNoteStates);
  const queryClient = useQueryClient();
  const bannerRef=useRef<any>(null)
  const isBeliever = (userDetails?.subscription_status || isTempIAPPurchased);
  const { showPremiumPage, checkAndShowPremium } = usePremiumPrompt(isBeliever,!!token);
  const streaksRef=useRef(null)
  const streaks=useStreak(token)

  const getTags=useGetTags()

  useGuestCreate(token, guestToken, createGuestUser, dispatch);
  useWatchNetInfo()
  const recordingQuery = useRecordings(hashFilter == "All" ? "" : hashFilter);

  const dispatchCanRecord = (val: boolean) =>
    dispatch(setCanRecord(val ?? true));


  useEffect(() => {
    if(getTags?.data?.data&&Array.isArray(getTags?.data?.data)){
      const tags=(getTags?.data?.data?.flatMap((t:any)=>t?.name)??[])
      .filter((name: string) => name !== 'starred') ?? [];;
      dispatch(setHashTags(tags))
    }
  }, [getTags?.data?.data]);

  const listenToFirebaseStatus = useCallback(
    (
      recordingId: string | number,
      temporaryRecordingId: string | null = null
    ) => {
      // console.log("listening to firebase");
      const firebasePath = token
        ? "processStatuses/recording/"
        : "processStatuses/guest/recording/";
      const statusRef = ref(db, firebasePath + recordingId);

      onValue(statusRef, async (snapshot) => {
        if (snapshot.exists()) {
          const status = +snapshot.val();

          // if (
          //   status !== RecordingStatus.TRANSCRIPT_FORMATTED &&
          //   status !== RecordingStatus.GENERATE_TITLE_FAILED &&
          //   status !== RecordingStatus.UPLOADED_FAILED &&
          //   status !== RecordingStatus.AUDIO_UPLOADED
          // ) {
          //   return;
          // }
          let updatedStatus = "uploading";
          if (status === RecordingStatus.AUDIO_UPLOADED||status === RecordingStatus.PROCESSING_AUDIO) {
            updatedStatus = "processing";
            console.log("audio uploaded");
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: { status: updatedStatus },
                temporaryRecordingId,
              })
            );
            dispatch(updateTempRecordingData(updatedStatus));
          } else if (status === RecordingStatus.UPLOADED_FAILED) {
            updatedStatus = "upload_failed";
            console.log("audio uploaded failed");
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: { status: updatedStatus },
                temporaryRecordingId,
              })
            );
            dispatch(updateTempRecordingData(updatedStatus));
          } else if (status === RecordingStatus.GENERATE_TITLE_FAILED) {
            updatedStatus = "processing_failed";
            console.log("title geneation failed;waiting");
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: { status: updatedStatus },
                temporaryRecordingId,
              })
            );
            dispatch(updateTempRecordingData(updatedStatus));
          } else if (status === RecordingStatus.GENERATE_TRANSCRIPT_FAILED) {
            updatedStatus = "processing_failed";
            console.log("transcript geneation failed;waiting");
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: { status: updatedStatus },
                temporaryRecordingId,
              })
            );
            dispatch(updateTempRecordingData(updatedStatus));
          } else if (status === RecordingStatus.PROCESS_COMPLETED||status===RecordingStatus.TITLE_GENERATED) {
            const isProcessOver = true;
            updatedStatus = "processed";
            console.log("formatted");
            const updatedNote = await fetchSingleRecording(recordingId);
            console.log("updated note: ",updatedNote.data.title)
            dispatch(setTriggerTypingTranscript(recordingId))
            dispatch(setTriggerTypingTitle(recordingId))
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: {
                  ...updatedNote.data,
                  status: updatedStatus,
                  is_transcript_loading: false,
                },
              })
            );
            dispatch(updateTempRecordingData(updatedStatus));
            dispatchCanRecord(updatedNote.data?.can_record_more);
            console.log("removing firebase listener");
            await remove(statusRef);
            off(statusRef);
            setTimeout(() => {
              !updatedNote.data?.parent_id&&setExpandNote(0);
            }, 600);
            return;
          }
        } else {
          console.log("Snapshot does not exist");
        }
      });
    },
    [token, dispatch]
  );

  useEffect(() => {
    const startRecordSubscription = actionEmitter.addListener('onStartRecord', () => {
      console.log("React Native: Recording started");
      setTimeout(() => {
        onStartRecord({repeat: false, parent_id: recordingParentId});
      }, 500)
    });

    const askAISubscription = actionEmitter.addListener('askAI', () => {
      console.log("React Native: AI asked");
      setTimeout(() => {
        onAsk();
      }, 500)
    });

    const searchNoteSubscription = actionEmitter.addListener('searchNote', () => {
      console.log("React Native: Search Note started");
      router.push("/search/");
    });

    return () => {
      startRecordSubscription.remove();
      askAISubscription.remove();
      searchNoteSubscription.remove();
    };
  }, []);

  useEffect(() => {
   
    QuickActions.setShortcutItems([
      {
        type: 'record',
        title: 'Record',
        icon: 'record_shortcut',
        userInfo: {
          url: 'voicenotes://record', // Optional, only for Android
        },
      },
      
      {
        type: 'askAI',
        title: 'Ask AI',
        icon: 'ask_shortcut',
        userInfo: {
          url: 'voicenotes://ask', // Optional, only for Android
        },
      },
      {
        type: 'search',
        title: 'Search',
        icon: 'search_shortcut',
        userInfo: {
          url: 'voicenotes://search', // Optional, only for Android
        },
      },
    ]);
  
    QuickActions.popInitialAction()
      .then((item) => {
        if (item) {
          handleShortcutAction(item.type);
        }
      })
      .catch(err => {
        console.error('Error processing initial action: ', err);
      });
  
      DeviceEventEmitter.addListener("quickActionShortcut", data => {
        handleShortcutAction(data.type);
      });
      
      return () => {
        QuickActions.clearShortcutItems();
        DeviceEventEmitter.removeAllListeners();
      };

  }, []);

  const handleShortcutAction = (type: string) => {
    switch (type) {
      case 'askAI':
        console.log('Performing action for Ask AI');
        setTimeout(() => {
          onAsk();
        }, 500)
        break;
      case 'record':
        console.log('Performing action for Recording');
        setTimeout(() => {
          onStartRecord({repeat: false, parent_id: recordingParentId});
        }, 500)
        break;
      case 'search':
        console.log('Performing action for Search');
        router.push("/search/");
        break;
      default:
        console.log('No matching shortcut action');
    }
  };

  useEffect(() => {
    const handleDeepLink = (event: { url: any; }) => {
      console.log("event: ", event.url);

      switch (event.url) {
        case 'voicenotes://ask':
          console.log('Performing action for Ask AI');
          setTimeout(() => {
            onAsk();
          }, 500)
          break;
        case 'voicenotes://record':
          console.log('Performing action for Recording');
          setTimeout(() => {
            onStartRecord({repeat: false, parent_id: recordingParentId});
          }, 500)
          break;
        case 'voicenotes://search':
          console.log('Performing action for Search');
          setTimeout(() => {
            router.push("/search/");
          }, 500)
          break;
        default:
          console.log('No matching shortcut action');
      }
    };

    // Add event listener for deep linking
    Linking.addEventListener('url', handleDeepLink);

    // Handle if the app was opened via a deep link initially
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
  }, []);

  useEffect(() => {
    if (recordingQuery.data) {
      const serverRecords =
        recordingQuery.data.pages.flatMap((p) =>
          token ? p.data.data : p.data
        ) || [];

      let finalList = combineRecordings(recordingList, serverRecords);
      dispatch(setRecordingList(finalList));
    }
  }, [recordingQuery.data, hashFilter, token, dispatch]);

  const isListEmpty = useMemo(
    () => recordingList?.length == 0 || null,
    [recordingList]
  );

  useIAPInfo();
  useEffect(() => {
    checkRecordPermission();
    NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
  }, []);

  const continueProcessing = async (note: Note, is_transcript_only = false) => {
    try {
      const isProcessFailed=(note?.title=="New Recording"||!note?.title)&&!note?.transcript
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: isProcessFailed?{status:"processing",is_transcript_loading:false}:{ is_transcript_loading: true },
        })
      );
      console.log("making request");
      await axiosApi.patch(`/recordings/${note.id}/continue`, {
        is_transcript_only,
      });
      listenToFirebaseStatus(note.id);
    } catch (error) {
      console.log("error in queing new transcript: ", error);
    }
  };

  const syncUpNote = async (note: Note) => {
    const retryUpload = async (note: Note) => {
      console.log("retrying upload for note: ");
      await uploadVoiceNote(note).catch(()=>{});
    };

    const retryProcessing = async (note: Note) => {
      console.log("retrying processing");
      if (!note.transcript) {
        continueProcessing(note);
      }
    };

    if (
      note.status === "upload_failed" ||
      (note.status === "uploading" && (note.recorded_at ?? note.created_at) < Date.now() - 5 * 1000)
    ) {
      retryUpload(note);
    } else if (note.status === "processing_failed") {
      retryProcessing(note);
    }
  };

  useEffect(() => {
    if (isOffline) return;
  
    const syncRecordingAndSubnotes = async (recording: Note) => {
      if (recording.status !== "processed") {
        await syncUpNote(recording);
      }
      
      if (recording.subnotes && Array.isArray(recording.subnotes)) {
        for (const subnote of recording.subnotes) {
          if (subnote.status !== "processed") {
            await syncUpNote(subnote); // Pass true to indicate it's a subnote
          }
        }
      }
    };
  
    const syncAllRecordings = async () => {
      for (const recording of recordingList) {
        await syncRecordingAndSubnotes(recording);
      }
    };
  
    syncAllRecordings();
  }, [isOffline]);

  const onAsk = () => {
    CreateModalRef.current?.close();
    // AIModalRef.current?.toggle();
    // AIModalRef.current?.getNewSugg();
    router.push("/ask-my-ai/");
  };
  const onCreate = () => {
    CreateModalRef.current?.onReset();
    AIModalRef?.current?.close();
    CreateModalRef.current?.toggle();
  };
  const onStartRecord = async ({
    repeat = false,
    parent_id = null,
    index = -1,
  }: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    if (recEnabled && !repeat) {
      console.log("Recording already started.");
      if (parent_id) setRecordingParentId(parent_id);
      return;
    }
    AIModalRef.current?.close();
    CreateModalRef.current?.close();
    if (!canRecord) {
      bannerRef.current?.show();
      return;
    }
    setRecordingParentId(parent_id);
    onRecord(setRec, setRecEnabled);
    activateKeepAwakeAsync();
    analytics().logEvent("started_recording");
  };

  const onPause = async (paused: boolean) => {
    paused
      ? await rec?.pauseAsync().finally(() => {
          console.log("paused");
        })
      : await rec?.startAsync().finally(() => {
          console.log("resumed");
        });
  };

  const uploadVoiceNote = async (note: NewNote) => {
    const temporaryRecordingId = note.id;

    dispatch(
      updateRecordingDetails({
        recordingId: note.id,
        data: { status:isOffline?"upload_failed": "uploading" },
        temporaryRecordingId,
      })
    );
    try {
      // let parent_id = note.parent_id;
      // if(note?.isSubnote&&!note?.parent_id){
      //   parent_id=recordingList.find((rec)=>rec.temp_id==note.temp_parent_id)?.id??null;
      //   console.log('parent_id: ',parent_id)
      // }
      const response = await saveVoiceNote({
        audio: note.audio.data.url,
        duration: note.audio.data.duration,
        parent_id: note?.parent_id ??null,
        recorded_at: note.recorded_at,
      });
      const recordingId = response.recording.id;
      // if(response.recording?.parent_id){
      //   setRecordingParentId(recordingId)
      // }else{
      //   setRecordingParentId(null)
      // }
      listenToFirebaseStatus(recordingId, temporaryRecordingId);
      setTimeout(() => {
        console.log("removing old recordings to save memory");
        removeExtraOldAudios(recordingList, dispatch);
      }, 2500);
      await queryClient.resetQueries('streaks');
    } catch (error) {
      console.log("Error in network upload");
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: { status: "upload_failed" },
          temporaryRecordingId,
        })
      );
    }
  };

  const onStopRecord = useCallback(
    async (duration: any, repeat = false) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => {}
      );
      checkAndShowPremium()
      setExpandNote(-1)
      setRecEnabled(false);
      const uri = await stopRecording(rec);
      setRec(null);

      const temporaryRecordingId = Math.random().toString(36).substring(7);
      const newTemporaryRecording: NewNote = {
        id: temporaryRecordingId,
        temp_id:temporaryRecordingId,
        audio: { data: { url: uri, duration } },
        isUploading: true,
        title: `New Recording`,
        transcript: null,
        recorded_at: new Date().getTime(),
        status: "uploading",
        internalUrl: uri,
        parent_id: recordingParentId ?? null,
        // isSubnote:splitCount>0,
        // temp_id:temporaryRecordingId,
        // temp_parent_id:recordingList[0]?.id??null
      };

      dispatch(setTempRecordingData(newTemporaryRecording))
      if (!recordingParentId) {
        dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));
      } else {
        const newRecordingList = recordingList.map((recording) => {
          if (recording.id === recordingParentId) {
            return {
              ...recording,
              subnotes: [...(recording.subnotes || []), newTemporaryRecording],
            };
          }
          return recording;
        });
        dispatch(setRecordingList(newRecordingList));
      }

      if (!repeat) {
        scrollRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
      if(repeat) {
        // setSplitCount(splitCount+1);
        onStartRecord({repeat:true,parent_id:recordingParentId??null});
      }
      // upload a new note
      await uploadVoiceNote(newTemporaryRecording);

      if (!repeat) deactivateKeepAwake();
      analytics().logEvent("completed_recording");
    },
    [rec, recordingList, dispatch,recordingParentId,splitCount]
  );

  const onCancel = async () => {
    await cancelRecording(rec, soundRef?.current);
    setRec(null);
    setRecEnabled(false);
    analytics().logEvent("cancelled_recording");
  };

  useEffect(() => {
    return rec
      ? () => {
          cancelRecording(rec, soundRef.current);
          setRec(null);
          setRecEnabled(false);
        }
      : undefined;
  }, []);

  const fetchNextPage = () => {
    // if(recordingList?.length>10){
      recordingQuery.hasNextPage && recordingQuery.fetchNextPage();
      console.log("fetching next page");
    // }
  };

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NotePreview
        key={item.id ?? item.temporaryRecordingId}
        ref={notePreviewRef}
        note={item}
        index={index}
        list={recordingList}
        isPlay={isPlay}
        setIsPlay={setIsPlay}
        play={play}
        setPlay={setPlay}
        audioLoading={audioLoading}
        setAudioLoading={setAudioLoading}
        continueProcessing={continueProcessing}
        syncUpNote={syncUpNote}
        hashFilter={hashFilter}
        expand={expandNote}
        setExpand={() => setExpandNote(index == expandNote ? -1 : index)}
        onStartRecord={onStartRecord}
        listenToFirebaseStatus={listenToFirebaseStatus}
        isOffline={isOffline}
      />
    ),
    [isPlay, play, audioLoading, expandNote,isOffline]
  );

  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [prevOffset, setPrevOffset] = useState(0);

  useLayoutAnim([isSearchVisible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await recordingQuery.refetch().catch(()=>{});
    // setIsPlay(-1)
    // setPlay(null)
    setRefreshing(false);
  };

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > prevOffset && currentOffset > 0) {
      setIsSearchVisible(false);
    } else if (currentOffset < prevOffset && currentOffset > 10) {
      setIsSearchVisible(true);
    }
    setPrevOffset(currentOffset);
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarHeight = 30; // Adjust based on your search bar height

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, searchBarHeight/2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const searchBarHeightAnimated = scrollY.interpolate({
    inputRange: [0, searchBarHeight],
    outputRange: [searchBarHeight, 0],
    extrapolate: 'clamp',
  });

  const recordingParentNoteName = useMemo(() => {
    return recordingList.find((note) => note?.id === recordingParentId)?.title ?? null;
  }, [recordingList, recordingParentId]);

  if (!token) return <Redirect href="/auth/landingPage/" />;
  return (
    <SafeAreaView
      style={[styles.container, hideBackground ? styles.hideBg : {}]}
    >
      <KeyboardAvoidView
        behavior={isIOS ? "padding" : null}
        style={{ flex: 1 }}
        onTouchStart={(e:any) => {
          setHideSearch(true);
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.wrapper, hideBackground ? styles.hideBg : {}]}>
            <Animated.View
              style={{
                backgroundColor: hideBackground ? "transparent" : "#fff",
                paddingHorizontal: 12,
              }}
            >
              <Header isLogged={!!token} isOffline={isOffline} streaks={streaks} streaksRef={streaksRef} scrollY={scrollY}/>
              <BannerAlert
                ref={bannerRef}
                snackHeight={52}
                onAction={() => bannerRef?.current?.close()}
                actionText="Close"
                message="Your daily recording limit has been exceeded. Please try again later."
              />
              { !!token && (
                <Animated.View
                  style={{
                    opacity: hideBackground ? 0 : 1,
                    marginTop: isIOS ? 0 : 10,
                  }}
                  onTouchEnd={() => !hideBackground && router.push("/search/")}
                  onTouchStart={(e) => {
                    e?.stopPropagation();
                    setHideSearch(false);
                  }}
                >
                  <Animated.View
                    style={[{ zIndex: 1 },{ height: searchBarHeightAnimated,transform: [{scaleY:searchBarOpacity}] }]}
                  >
                    <SearchBar
                      style={{ opacity: 1 }}
                      hideView={hideSearch}
                      setHide={setHideSearch}
                      isSearchVisible={isSearchVisible}
                    />
                  </Animated.View>
                </Animated.View>
              )}
            </Animated.View>
            {recordingList?.length == 0 && (recordingQuery.isFetching||recordingQuery?.isLoading||recordingQuery?.isRefetching) ? (
                  <View
                    style={{
                      height: height-500,
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop:100
                    }}
                  >
                    <CircularLoader strokeWidth={3} />
                  </View>)
              :<Animated.FlatList
              ref={scrollRef}
              ListHeaderComponent={()=><TagButtons hashFilter={hashFilter}/>}
              // bounces={false}
              style={{ opacity: hideBackground ? 0 : 1, marginTop: 12 }}
              data={recordingList}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false}
              )}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingBottom: 300 }}
              showsVerticalScrollIndicator={false}
              keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
              renderItem={renderItem}
              onEndReachedThreshold={0.2}
              onEndReached={fetchNextPage}
              onRefresh={onRefresh}
              initialNumToRender={3}
              refreshing={isRefreshing}
              ListFooterComponent={
                !token && recordingQuery.isFetched ? (
                  <AboutProduct disable={false} />
                ) : recordingQuery?.isRefetching ? (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 20,
                    }}
                  >
                    <CircularLoader />
                  </View>
                ) : null
              }
              ListEmptyComponent={() =>
                (hashFilter == "shared" ||hashFilter == "starred")? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: Colors.darkWithOpacity(0.05),
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      // borderRadius: 12,
                      marginTop: 20,
                    }}
                  >
                    <SvgXml xml={hashFilter == "shared"?home.share:home?.emptyStarred} />
                    <View
                      style={{ marginLeft: 16, backgroundColor: "transparent" }}
                    >
                      <Text
                        style={{
                          fontFamily: "Primary-Medium",
                          fontSize: 14,
                          color: Colors.darkWithOpacity(1),
                          marginBottom: 4,
                        }}
                      >
                        You haven't {hashFilter == "shared"?'shared':"starred"} any notes yet.
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Primary",
                          fontSize: 12,
                          color: Colors.darkWithOpacity(1),
                          width:"70%"
                        }}
                      >
                        {hashFilter == "shared"?"To share a note, expand the note, just tap ‘... More’ in the notes settings and select Share"
                        :`To star a note, expand the note, choose the ‘#Tag’ option and select ‘*starred’.`}
                      </Text>
                    </View>
                  </View>
                ) : recordingList?.length == 0 && recordingQuery.isFetching ? (
                  <View
                    style={{
                      flex: 1,
                      height: height - (insets.top + 200),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size={"small"} color={"#000"} />
                  </View>
                ) : recordingList?.length == 0 && !!token ? (
                  <AboutProduct disable={true} />
                ) : null
              }
            />}
          </View>
          {/* <CreateModal
            ref={CreateModalRef}
            recordingList={recordingList}
            fetchNextPage={fetchNextPage}
            setHideBg={setHideBg}
          /> */}
          {/* <AIModal ref={AIModalRef} setHideBg={setHideBg} /> */}

        {/* streak modal */}
        <Streaks data={streaks?.data?.data||[]} ref={streaksRef}/>
          {/* {!recEnabled &&  showAskMe&& <AskMeSomething onClose={()=>setShowAskMe(false)}/>} */}
        </View>
      </KeyboardAvoidView>
      <BottomBar
        recordingParentNoteName={recordingParentNoteName}
        setRecordingParentId={setRecordingParentId}
        onAsk={onAsk}
        onCreate={onCreate}
        onRecord={onStartRecord}
        onStopRecord={onStopRecord}
        recEnabled={recEnabled}
        onCancel={onCancel}
        showAskMe={showAskMe}
        setShowAskMe={setShowAskMe}
        onPause={onPause}
        rec={rec}
      />
        {/* related notes single page */}
        <CustomModal visible={!!relatedNoteId}>
          <RelatedNotes
            id={relatedNoteId}
            onBack={() => dispatch(setRelatedNoteId(null))}
            onStartRecord={onStartRecord}
            continueProcessing={continueProcessing}
            syncUpNote={syncUpNote}
          />
        </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {
    paddingVertical: isIOS ? 0 : 32,
  },
  tab: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 64,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 60,
    alignItems: "center",
    shadowColor: "#00000026",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    zIndex: 10,
    elevation: 5,
    padding: 12,
    justifyContent: "space-between",
  },
  tabItem: {
    height: 40,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#2222220D",
    overflow: "hidden",
  },
  tabItemText: {
    fontFamily: "Primary-Bold",
    fontSize: 14,
    color: "#000",
    marginLeft: 8,
    fontWeight: "700",
  },
  hideBg: { backgroundColor: "#F4F6F6" },
});
