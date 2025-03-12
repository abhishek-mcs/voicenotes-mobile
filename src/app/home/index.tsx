import {
  Animated,
  DeviceEventEmitter,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import Header from "components/home/header";
import NotePreview from "components/home/note-preview";
import AboutProduct from "components/home/about-product";
import { Audio } from "expo-av";
import BottomBar from "components/home/bottom-bar";
import {
  cancelRecording,
  checkRecordPermission,
  onRecord,
  saveRecording,
  stopRecording,
} from "func/home/record";
import { useGuestToken } from "queries/auth";
import { useGetTags, useHighlights, useRecordings, useStreak } from "queries/home";
import { useQueryClient } from "react-query";
import { Dimensions } from "react-native";
import { isIOS, screenHeight } from "utils/common";
import { Redirect, router } from "expo-router";
import useIAPInfo from "hooks/iap/useIAPInfo";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import {
  setCreateRecordingList,
  setRecordingList,
  setTempRecordingData,
  updateRecordingDetails,
  updateTempRecordingData,
} from "redux/reducers/recordingStates";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { setCanRecord, setToken } from "redux/reducers/userDetails";
import { analytics, } from "../../../firebaseConfig";
import { saveVoiceNote } from "func/home/uploadAudioFb";
import axiosApi, { setAuthToken } from "services/api/axios-api";
import { NewNote, Note } from "types";
import { combineRecordings, removeExtraOldAudios } from "utils/audioUtils";
import useWatchNetInfo from "hooks/watch/useWatchNetInfo";
import CustomModal from "components/common/custom-modal";
import RelatedNotes from "app/RelatedNotes";
import { setRelatedNoteId } from "redux/reducers/relatedNoteStates";
import CircularLoader from "components/common/loaders/circular-loader";
import usePremiumPrompt from "hooks/iap/usePremiumPrompt"
import TagButtons from "components/home/tag-buttons";
import { setHashTags, setHashTagsData, setPinnedTags, setPinnedTagsData } from "redux/reducers/hashSlice";
import Streaks from "components/streaks";
import { NativeEventEmitter, NativeModules } from 'react-native';
import QuickActions from 'react-native-quick-actions';
import { useLocalSearchParams } from "expo-router";
import { useNoteContext, useTheme } from "context";
import SearchComponent from "components/search-component";
import Review from "components/common/Review";
import { incrementCounter, shouldPromptNow } from "utils/cache";
import { StatusBar } from "react-native";
import { useDialog } from "context/DialogContext";
import * as Sentry from '@sentry/react-native';
import { useFirebaseRecordingListener } from "hooks/firebase-listeners/useFirebaseRecordingListener";
import { stopSilentBackgroundService } from "services/background";
import { createTempRecDetails } from "utils/createTempRecDetails";
import * as FileSystem from "expo-file-system";
import { isTaskRegistered, registerBackgroundTask } from "services/backgroundFetchHelperiOS";
import ExpandableCalendar from "components/home/Calendar";
import { BlurView } from "expo-blur";

const { height } = Dimensions.get("screen");

const KeyboardAvoidView:any = KeyboardAvoidingView;

const Home = () => {
  const { ActionModule } = NativeModules;
  const actionEmitter = new NativeEventEmitter(ActionModule);
  const notePreviewRef = useRef<any>();
  const {hashFilter,pinnedTags,pinnedTagsData,hashTagsData} = useSelector((state: RootState) => state.hash);
  const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
  const {isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
  const {canRecord} = useSelector((state: RootState) => state.userDetails);
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const { recordingList } = useSelector(
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
  const soundRef = useRef<any>(null);
  const [calendar, showCalendar] = useState(false);
  const [hideSearch, setHideSearch] = useState(true);
  const [showAskMe, setShowAskMe] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isOffline, setOffline] = useState(false);
  const [review, askReview] = useState(false)
  const [splitCount, setSplitCount] = useState(0);
  const [recordingParentId, setRecordingParentId] = useState<string | null>(
    null
  );
  const {relatedNoteId} = useSelector((state: RootState) => state.relatedNoteStates);
  const queryClient = useQueryClient();
  // const bannerRef=useRef<any>(null)
  const isBeliever = (userDetails?.subscription_status || isTempIAPPurchased);
  const { showPremiumPage, checkAndShowPremium } = usePremiumPrompt(isBeliever,!!token);
  const streaksRef=useRef(null)
  const streaks=useStreak(token)
  const highlights = useHighlights(token)

  const getTags=useGetTags()
  const { action, file }:any = useLocalSearchParams();
  // const action = useMemo(() => params?.action, [params?.action]);
  const {setTriggerTypingTitle,setTriggerTypingTranscript,expandNote,setExpandNote,noteListScrollRef} = useNoteContext()
  const { Colors,isLightMode } = useTheme()
  const styles = useStyles()
  const {showDialog}:any = useDialog()

  const { listenToFirebaseStatus, onTextNoteSave } = useFirebaseRecordingListener()

  useWatchNetInfo()
  
  const recordingQuery = useRecordings(hashFilter == "All" ? "" : hashFilter);

  const dispatchCanRecord = (val: boolean) =>
    dispatch(setCanRecord((val)));

  useEffect(()=>{
    StatusBar.setBarStyle(isLightMode?'dark-content':'light-content')
  },[isLightMode])

  const deepLinkListener = async() => {
    if (!!file) {
      setAuthToken(token,false,netinfo)
      // Handle file processing (e.g., upload or play audio)
      const fileURI = await saveRecording(file,true)??''
      console.log("moved file to cache", fileURI)
      const MAX_SIZE_MB = 35 * 1024 * 1024;
      const fileInfo:any = await FileSystem.getInfoAsync(fileURI);
      if (fileInfo?.size > MAX_SIZE_MB ) {
        console.warn(`❌ File is too large! Maximum allowed size is ${MAX_SIZE_MB}MB.`);
        showDialog('','Your file is too large (over 35 MB). Please choose a smaller file to continue.')
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri:file });
      const status = await sound.getStatusAsync();
      let d:number = 0;
      if (status?.isLoaded&&status?.durationMillis) {
        console.log("Audio duration (ms):", status.durationMillis);
        d = status.durationMillis;
      }
      if(fileURI&&isBeliever){
        const tempRecordingDetails = createTempRecDetails({uri:fileURI,duration:d})
        dispatch(setTempRecordingData(tempRecordingDetails))
        dispatch(setRecordingList([tempRecordingDetails, ...recordingList]));
        uploadVoiceNote(tempRecordingDetails)
      }else{
        setTimeout(() => {
          checkAndShowPremium()
        }, 1000);
      }
    }
  }

  useEffect(() => {
    (async function(){
      await deepLinkListener()
    })()
  }, [file]);
  
  useEffect(() => {
    if(getTags?.data?.data&&Array.isArray(getTags?.data?.data)){
      const tags=(getTags?.data?.data?.filter((t: any) => t?.name !== 'starred') ?? [])
      dispatch(setHashTagsData(tags))
      const tagNames=tags.flatMap((t:any)=>t?.name)??[];
      dispatch(setHashTags(tagNames))
      const pTagsData=(tags.filter((t:any)=>t?.is_pinned==1)??[]);
      dispatch(setPinnedTagsData(pTagsData))
      const pTags=pTagsData.flatMap((t:any)=>t?.name)??[]
      dispatch(setPinnedTags(pTags))
    }
  }, [getTags?.data?.data]);


  useEffect(() => {
    Sentry.setUser({ email: userDetails?.email });
    const tokenSubscription = actionEmitter.addListener('sendToken', () => {
      // console.log("React Native: Send token started");
      NativeModules.TokenBridge.sendTokenToWatch(token);
    });

    const startRecordSubscription = actionEmitter.addListener('onStartRecord', () => {
      // console.log("React Native: Recording started");
      setTimeout(() => {
        onStartRecord({repeat: false, parent_id: recordingParentId});
      }, 500)
    });

    const askAISubscription = actionEmitter.addListener('askAI', () => {
      // console.log("React Native: AI asked");
      setTimeout(() => {
        onAsk();
      }, 500)
    });

    const searchNoteSubscription = actionEmitter.addListener('searchNote', () => {
      // console.log("React Native: Search Note started");
      router.push("/search");
    });

    const textNoteSubscription = actionEmitter.addListener('addToTextNote', (event) => {
      console.log("React Native: Text Note started");
      const noteContent = event?.content;
      router.push({
        pathname: "/text-note",
        params: { content: noteContent }, // Pass the content as a parameter
      });
    });

    return () => {
      startRecordSubscription.remove();
      askAISubscription.remove();
      searchNoteSubscription.remove();
      textNoteSubscription.remove();
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
        // console.log('Performing action for Ask AI');
        setTimeout(() => {
          onAsk();
        }, 500)
        break;
      case 'record':
        // console.log('Performing action for Recording');
        setTimeout(() => {
          onStartRecord({repeat: false, parent_id: recordingParentId});
        }, 500)
        break;
      case 'search':
        // console.log('Performing action for Search');
        router.push("/search");
        break;
      default:
        // console.log('No matching shortcut action');
    }
  };

  useEffect(() => {
    // console.log(action);
    const actionName = (action || '')?.split('-')[0]
      switch (actionName) {
        case 'ask':
          if (recEnabled) break; 
          setTimeout(() => {
            onAsk();
          }, 500);
          break;
        case 'record':
          if (recEnabled) break; 
          setTimeout(() => {
            onStartRecord({repeat: false, parent_id: recordingParentId});
          }, 500)
          break;
        case 'searchDeeplink':
          if (recEnabled) break; 
          router.push("/search")
          break;
      }
  }, [action]);

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

  useIAPInfo();
  useEffect(() => {
    checkRecordPermission();
    NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
  }, []);

  const continueProcessing = async (note: Note, is_transcript_only = false,summary_id=null) => {
    try {
      const isProcessFailed=(note?.title=="New Recording"||!note?.title)&&!note?.transcript
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: isProcessFailed?{status:"processing",is_transcript_loading:false}:{ is_transcript_loading: note?.id },
        })
      );
      // console.log("making request");

      if(!!summary_id){
        const resp = await axiosApi.post(`/ai-create/${summary_id}/regenerate`)
      }else{
        const resp = await axiosApi.patch(`/recordings/${note.id}/continue`, {
          is_transcript_only,
        });
      }
      // else{
      // }

      await listenToFirebaseStatus(note.id,null,is_transcript_only,summary_id);
    } catch (error) {
      // console.log("error in queing new transcript: ", error);
    }
  };

  const syncUpNote = async (note: Note) => {
    const retryUpload = async (note: Note) => {
      console.log("retrying upload for note: ", note.audio.data.url);
      !note?.audio?.data?.url && Sentry.captureMessage("retrying upload for note: "+note?.audio?.data?.url,"error")
      if(note?.recording_type == 3)
        await onTextNoteSave(note);
      else
        await uploadVoiceNote(note).catch(()=>{});
    };

    const retryProcessing = async (note: Note) => {
      // console.log("retrying processing");
      if (!note.transcript) {
        continueProcessing(note);
      }
    };
    // console.log('retry',note.status)

    if (
      note.status === "upload_failed" ||
      (note.status === "uploading" && (note.recorded_at ?? note.created_at) < Date.now() - 5 * 1000)
    ) {
      // console.log('retry uploading')
      retryUpload(note);
    } else if (note.status === "processing_failed"||note.status === "process_failed") {
      // console.log('retry processing')
      retryProcessing(note);
    }
  };

  const syncRecordingAndSubnotes = async (recording: Note) => {
    if (recording.status !== "processed") {
      await syncUpNote(recording);
    }
    
    if (recording?.subnotes && Array.isArray(recording?.subnotes)) {
      for (const subnote of recording?.subnotes) {
        if (subnote?.status !== "processed") {
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

  useEffect(() => {
    if (isOffline) return;
  
    syncAllRecordings();
  }, [isOffline]);

  useEffect(()=>{
    (async function(){
      if(isIOS){
        const isReg = await isTaskRegistered('bg-upload-all');
        if(isReg)
          registerBackgroundTask('bg-upload-all',syncAllRecordings,300)
      }
    })()
  },[]);

  const onAsk = async() => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    // CreateModalRef.current?.close();
    // AIModalRef.current?.toggle();
    // AIModalRef.current?.getNewSugg();
    router.push("/ask-my-ai");
  };
  const onCreate = async() => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    router.push('/create')
    // CreateModalRef.current?.onReset();
    // AIModalRef?.current?.close();
    // CreateModalRef.current?.toggle();
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
      // console.log("Recording already started.");
      if (parent_id) setRecordingParentId(parent_id);
      return;
    }
    AIModalRef.current?.close();
    // CreateModalRef.current?.close();
    if (!canRecord) {
      return;
    }
    setRecordingParentId(parent_id);
    onRecord(setRec, setRecEnabled,isLightMode,showDialog);
    activateKeepAwakeAsync();
    analytics().logEvent("started_recording");
    setTriggerTypingTitle(null)
    setTriggerTypingTranscript(null)
  };

  const onPause = async (paused: boolean) => {
    paused
      ? await rec?.pauseAsync().finally(() => {
          // console.log("paused");
        })
      : await rec?.startAsync().finally(() => {
          // console.log("resumed");
        });
  };

  const uploadVoiceNote = async (note: NewNote, continueUpload = false) => {
    const temporaryRecordingId = note.id;

    // await startSilentBackgroundService('upload');

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
      //   // console.log('parent_id: ',parent_id)
      // }
      await saveVoiceNote({
        audio: note.audio.data.url,
        duration: note.audio.data.duration,
        parent_id: note?.parent_id ??null,
        recorded_at: note.recorded_at,
        temp_id:note.temp_id,
      }).then(async(response)=>{
        const recordingId = response.recording.id;
        // console.log(recordingId,'recording id')
        if(continueUpload && !recordingParentId) setRecordingParentId(recordingId)
        // console.log("audio uploaded waiting for process");
        dispatch(
          updateRecordingDetails({
            recordingId,
            data: { status: "processing" },
            temporaryRecordingId,
          })
        );
        dispatch(updateTempRecordingData("processing"));
        await listenToFirebaseStatus(recordingId, temporaryRecordingId);
      }).catch((e)=>{
        dispatch(
          updateRecordingDetails({
            recordingId: note.id,
            data: { status: "upload_failed" },
            temporaryRecordingId,
          })
        );
      });
      setTimeout(() => {
        // console.log("removing old recordings to save memory");
        removeExtraOldAudios(recordingList, dispatch);
      }, 4000);
      await queryClient.resetQueries('streaks');
      if(!continueUpload) await stopSilentBackgroundService()
    } catch (error) {
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
      !recordingParentId&&setExpandNote(-1)
      setRecEnabled(false);
      let uri = await stopRecording(rec);
      setRec(null);

      const newTemporaryRecording: NewNote = createTempRecDetails({uri,duration,parentId:recordingParentId})

      if (!recordingParentId) {
        dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));
      } else {
        const newRecordingList = recordingList.map((recording: any) => {
          if (recording.id === recordingParentId) {
            return {
              ...recording,
              subnotes: [...(recording?.subnotes || []), newTemporaryRecording],
            };
          }
          return recording;
        });
        dispatch(setTempRecordingData(newTemporaryRecording));
        dispatch(setRecordingList(newRecordingList));
      }

      if (!repeat&&!recordingParentId) {
        noteListScrollRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
      if(repeat) {
        // setSplitCount(splitCount+1);
        onStartRecord({repeat:true,parent_id:recordingParentId??null});
      }

      await incrementCounter()
      if(await shouldPromptNow()) askReview(true)

      // upload a new note
      await uploadVoiceNote(newTemporaryRecording, repeat);

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
      recordingQuery.hasNextPage && console.log("fetching next page");
    // }
  };

  useEffect(()=>{
    if(hashFilter==""){
      dispatch(setCreateRecordingList(recordingList))
    }
  },[recordingList,hashFilter])

  useEffect(()=>{
      setTriggerTypingTitle(null)
      setTriggerTypingTranscript(null)
  },[hashFilter])
  
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
        setExpand={(v:any) =>{
          setExpandNote(v)
        }}
        onStartRecord={onStartRecord}
        listenToFirebaseStatus={listenToFirebaseStatus}
        isOffline={isOffline}
        scrollRef={noteListScrollRef}
      />
    ),
    [isPlay, play, audioLoading, expandNote,isOffline]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await recordingQuery.refetch().catch(()=>{});
    // setIsPlay(-1)
    // setPlay(null)
    setRefreshing(false);
  };

  const netinfo = useNetInfo()

  // useGetToken()

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarHeight = 40; // Adjust based on your search bar height
  const headerHeight=50;

  const searchBarScale = scrollY.interpolate({
    inputRange: [0, searchBarHeight/2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const searchBarHeightAnimated = scrollY.interpolate({
    inputRange: [0, isIOS?searchBarHeight:150],
    outputRange: [searchBarHeight, 0],
    extrapolate: 'clamp',
  });
  const borderColor = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [Colors.grey2WithOpacity(0),Colors.grey2WithOpacity(0.3)],
    extrapolate: 'clamp',
  })

  const recordingParentNoteName = useMemo(() => {
    return recordingList.find((note) => note?.id === recordingParentId)?.title ?? null;
  }, [recordingList, recordingParentId]);

  const isDefaultHash=hashFilter==""||hashFilter=="starred"||hashFilter=="shared"||hashFilter=="All"||pinnedTags?.includes(hashFilter)

  const filteredRecordingList=hashFilter==""?recordingList:recordingList?.filter(item => item.status === "processed");
  const isRecordListLoading=(filteredRecordingList?.length == 0 ||!isDefaultHash)&&
  (recordingQuery.isFetching ||
    recordingQuery?.isLoading ||
    recordingQuery?.isRefetching)

  const scale=useRef(new Animated.Value(1))
  const searchTranslateY=useRef(new Animated.Value(0)).current
  const [searchFocused,setSearchFocus]=useState(false)
  const onSearchAnim=(isFocus=false)=>{
    Animated.parallel([
      Animated.timing(scale.current, {
        duration: 150,
        toValue: isFocus?0:1, // Scale down
        useNativeDriver: false,
        easing: Easing.linear,
      }),
      Animated.timing(searchTranslateY, {
        duration: 150,
        toValue: isFocus?-90:0, // Translate up
        useNativeDriver: false,
        easing: Easing.linear,
      }),
    ]).start();
    setSearchFocus(isFocus)
  }

  if (!token) return <Redirect href="/auth/landingPage" />;
  return (
    <SafeAreaView
      style={[styles.container]}
    >
      <Review visible={review} onClose={() => askReview(false)} />
      <KeyboardAvoidView
        behavior={isIOS ? "padding" : null}
        style={{ flex: 1 }}
        onTouchStart={(e: any) => {
          setHideSearch(true);
        }}
      >
        <View style={{ flex: 1,backgroundColor:Colors.bgColor }}>
          <View style={[styles.wrapper]}>
            <Animated.View
              style={{
                backgroundColor:  Colors.bgColor,
                paddingHorizontal: 12,
                paddingBottom: 12,
                borderBottomWidth: 0.3,
                borderBottomColor: borderColor,
              }}
            >
              <Header
                isLogged={!!token}
                isOffline={isOffline}
                streaks={streaks}
                streaksRef={streaksRef}
                onCalendarToggled={() => showCalendar(!calendar)}
                scrollY={scrollY}
                scale={scale.current}
              />
              {/* <BannerAlert
                ref={bannerRef}
                snackHeight={52}
                onAction={() => bannerRef?.current?.close()}
                actionText="Close"
                message="Your daily recording limit has been exceeded. Please try again later."
              /> */}
              {!!token && (
                <Animated.View
                  style={{
                    // opacity: hideBackground ? 0 : 1,
                    marginTop: isIOS ? 0 : 10,
                  }}
                  // onTouchEnd={() => !hideBackground && router.push("/search/")}
                  onTouchStart={(e) => {
                    e?.stopPropagation();
                    setHideSearch(false);
                  }}
                >
                  <Animated.View
                    style={[
                      { zIndex: 1 },
                      {
                        height: searchFocused?screenHeight:searchBarHeightAnimated,
                        transform: [{ scaleY: searchBarScale }],
                      },
                    ]}
                  >
                    <SearchComponent
                      onFocus={()=>onSearchAnim(true)}
                      onBlur={()=>onSearchAnim(false)}
                      searchHeight={searchBarHeight}
                      searchTranslateY={searchTranslateY}
                      // scrollY={scrollY}
                      // style={{ opacity: 1 }}
                      // hideView={hideSearch}
                      // setHide={setHideSearch}
                      // isSearchVisible={isSearchVisible}
                    />
                  </Animated.View>
                </Animated.View>
              )}
            </Animated.View>
            <Animated.FlatList
                ref={noteListScrollRef}
                ListHeaderComponent={
                  <TagButtons isDefaultHash={isDefaultHash} hashFilter={hashFilter} pinnedTags={pinnedTags} pinnedTagsData={pinnedTagsData} tagsData={hashTagsData}/>
                }
                // bounces={false}
                data={isRecordListLoading?[]:filteredRecordingList??[]}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
                refreshControl={
                <RefreshControl 
                  onRefresh={onRefresh} 
                  refreshing={isRefreshing}
                  tintColor={Colors.refresh}
                  colors={[isIOS?Colors.refresh:Colors.refresh1]}
                  />
                }
                scrollEventThrottle={16}
                style={{backgroundColor:Colors.bgColor}}
                contentContainerStyle={{ paddingBottom: 300,backgroundColor:Colors.bgColor }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
                renderItem={renderItem}
                onEndReachedThreshold={0.2}
                onEndReached={fetchNextPage}
                initialNumToRender={10}
                ListFooterComponent={
                  !token && recordingQuery.isFetched ? (
                    <AboutProduct disable={false} />
                  ) : recordingQuery?.isRefetching&&!isRecordListLoading ? (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 20,
                        backgroundColor:Colors.bgColor
                      }}
                    >
                      <CircularLoader />
                    </View>
                  ) : null
                }
                ListEmptyComponent={() =>
                  hashFilter == "shared" || hashFilter == "starred" ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: Colors.bgColor,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        // borderRadius: 12,
                        marginTop: 20,
                      }}
                    >
                      <SvgXml
                        xml={
                          hashFilter == "shared"
                            ? home.share?.replace("#0D0D0D",Colors.emptyShare)
                            : home?.emptyStarred?.replace("#0D0D0D",Colors.emptyShare)
                        }
                      />
                      <View
                        style={{
                          marginLeft: 16,
                          backgroundColor: "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Primary-Medium",
                            fontSize: 14,
                            color: Colors.text1,
                            marginBottom: 4,
                          }}
                        >
                          You haven't{" "}
                          {hashFilter == "shared" ? "shared" : "starred"} any
                          notes yet.
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Primary",
                            fontSize: 12,
                            color: Colors.text1,
                            width: "70%",
                          }}
                        >
                          {hashFilter == "shared"
                            ? "To share a note, expand the note, just tap ‘... More’ in the notes settings and select Share"
                            : `To star a note, expand the note, choose the ‘#Tag’ option and select ‘*starred’.`}
                        </Text>
                      </View>
                    </View>
                  ) : isRecordListLoading ? (
                      <View
                      style={{
                        height: height - 500,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 50,
                        backgroundColor:Colors.bgColor
                      }}
                    >
                      <CircularLoader strokeWidth={3} />
                    </View>
                  ) : (filteredRecordingList?.length == 0 && !!token&&hashFilter=='') ? (
                    <AboutProduct disable={true} />
                  ) : null
                }
              />
          </View>
          {/* <CreateModal
            ref={CreateModalRef}
            recordingList={recordingList}
            fetchNextPage={fetchNextPage}
            setHideBg={setHideBg}
          /> */}
          {/* <AIModal ref={AIModalRef} setHideBg={setHideBg} /> */}

          {/* streak modal */}
          <Streaks data={streaks?.data?.data || []} ref={streaksRef} />
          {/* {!recEnabled &&  showAskMe&& <AskMeSomething onClose={()=>setShowAskMe(false)}/>} */}
        </View>
      </KeyboardAvoidView>
      <BottomBar
        recordingParentNoteName={recordingParentNoteName}
        setRecordingParentId={setRecordingParentId}
        parentId={recordingParentId}
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
      <Modal
        transparent
        visible={calendar}
        animationType="fade"
      >
        <BlurView style={{ flex: 1 }} tint={isLightMode ? "light" : "dark"} intensity={50}>
          <Pressable onPress={() => showCalendar(false)} style={styles.calendarHeader}>
            <Pressable onPress={() => showCalendar(false)} style={styles.button}>
              <SvgXml xml={home.calendar?.replace(/#717171/g,Colors.refresh)} />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings/")} style={styles.button}>
              <SvgXml xml={home.settings?.replace(/#717171/g,Colors.refresh)} />
            </Pressable>
          </Pressable>
          <Pressable onPress={() => showCalendar(false)} style={{flex: 6, alignItems: 'center'}}>
            <ExpandableCalendar highlightsData={highlights?.data?.data} data={streaks?.data?.data || []} />
          </Pressable>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Colors.bgColor,
  },
  wrapper: {
    paddingVertical: isIOS ? 0 : 32,
    backgroundColor:Colors.bgColor
  },
  calendarHeader: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 12,
    marginTop: 30,
  },
  button: {
    height: 38,
    width: 38,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
}), [Colors]); // Recreate styles when Colors change
};

export default Home