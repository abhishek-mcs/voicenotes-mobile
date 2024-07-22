import {
  ActivityIndicator,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import SearchBar from "components/common/search-bar";
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
import { useAddTranscript, useRecordings, useUploadRecord } from "queries/home";
import { useQueryClient } from "react-query";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isIOS, screenHeight } from "utils/common";
import * as Animatable from "react-native-animatable"
import AskMeSomething from "components/ask-me-something";
import { Redirect, router } from "expo-router";
import useIAPInfo from "hooks/iap/useIAPInfo";
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates";
import onUploadRecord from "func/home/on-upload-record";
import { Text } from "react-native";
import Colors from "assets/Colors";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import Animated from "react-native-reanimated";
import { setRecordingList, setTempRecordings, updateRecordingStatus , updateRecordingDetails} from "redux/reducers/recordingStates";
import NetInfo from '@react-native-community/netinfo';
import { LayoutAnimation } from "react-native";
import { setCanRecord } from "redux/reducers/userDetails";
import BannerAlert from "components/common/banner-alert";
import { analytics, db } from "../../../firebaseConfig";
import useLayoutAnim from "hooks/anim/useLayoutAnim";
import CircularLoader from "components/common/loaders/circular-loader";
import * as FileSystem from 'expo-file-system';
import { saveVoiceNote } from "func/home/uploadAudioFb";
import { onValue, ref, remove } from "firebase/database";
import { RecordingStatus, RecordingStatusString } from "func/firebase/recording-event-listener";
import axiosApi from "services/api/axios-api";
// import * as MediaLibrary from 'expo-media-library';



const recordSound = require("../../assets/sounds/record.wav");
const {height}=Dimensions.get('screen')
const fadeIn={
  from:{opacity:0},to:{opacity:1}
}
const fadeOut={
  from:{opacity:1},to:{opacity:0}
}

export default ()=> {
  const insets=useSafeAreaInsets()
  const notePreviewRef = useRef<any>();
  const {hashFilter} = useSelector((state: RootState) => state.hash);
  const token = useSelector((state: RootState) => state.userDetails.token);
  const {canRecord} = useSelector((state: RootState) => state.userDetails);
  const [expandNote,setExpandNote] = useState(-1)
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const {recordingList} = useSelector((state: RootState) => state.recordingStates);
  const createGuestUser = useGuestToken();
  const dispatch = useDispatch();
  const [rec, setRec] = useState<Audio.Recording | any>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const AIModalRef = useRef<any>();
  const CreateModalRef = useRef<any>();
  const [isPlay,setIsPlay] = useState(-1)
  const [play,setPlay] = useState<Audio.Sound|null>()
  const [audioLoading, setAudioLoading] = useState(-1);
  const scrollRef = useRef<FlatList>(null);
  const soundRef = useRef<any>(null);
  const [hideSearch,setHideSearch]=useState(true)
  const [showAskMe,setShowAskMe]=useState(true)
  const [hideBackground,setHideBg]=useState(false)
  const [isRefreshing,setRefreshing]=useState(false)
  const [uploading,setUploading]=useState(0)
  const [isOffline,setOffline]=useState(false)
  const [finalNotesListToShow,setFinalNotesListToShow]=useState([])
  const bannerRef=useRef<any>(null)

  useGuestCreate(token, guestToken, createGuestUser, dispatch);

  const recordingQuery = useRecordings(hashFilter=='All'?'':hashFilter)
  const uploadRecord = useUploadRecord()
  const addTranscriptRecord = useAddTranscript(true)
  const queryClient = useQueryClient();

  // const generateDummy=tempRecordings;
  
  const setGenerateDummy=(val:any)=>dispatch(setTempRecordings(val))
  const setReduxRecordingList=(val:any)=>dispatch(setRecordingList(val))
  const dispatchCanRecord=(val:boolean)=>dispatch(setCanRecord(val??true))

  const listenToFirebaseStatus = useCallback((recordingId: string | number, temporaryRecordingId: string) => {
    console.log('listening to firebase');
    const firebasePath = token ? "processStatuses/recording/" : "processStatuses/guest/recording/";
    const statusRef = ref(db, firebasePath + recordingId);

    onValue(statusRef, async (snapshot) => {
      if (snapshot.exists()) {
        const status = +snapshot.val();
        console.log("Status = ", status, RecordingStatusString[status]);

        let updatedStatus = 'uploading';
        if (status === RecordingStatus.AUDIO_UPLOADED) updatedStatus = 'processing';
        else if (status === RecordingStatus.UPLOADED_FAILED) updatedStatus = 'upload_failed';
        else if (status === RecordingStatus.FORMAT_TRANSCRIPT_FAILED) updatedStatus = 'processing_failed';

        if (status === RecordingStatus.TRANSCRIPT_FORMATTED) {
          const updatedNote = await fetchSingleRecording(recordingId);
          dispatch(updateRecordingDetails({recordingId, data: {...updatedNote.data, status: 'processed'}}));
          remove(statusRef);
        }else{
          dispatch(updateRecordingStatus({recordingId, updatedStatus, temporaryRecordingId}));
        }
      }
    });
  }, [token, dispatch]);
  
  useEffect(() => {
    if (recordingQuery.data) {
      const records = recordingQuery.data.pages.flatMap(p => token ? p.data.data : p.data) || [];
      const modifiedRecords = records.map(rec => ({
        ...rec,
        status: rec.status ?? 'processed'
      }));
      dispatch(setRecordingList(modifiedRecords));
    }
  }, [recordingQuery.data, hashFilter, token, dispatch]);

  
  const isListEmpty = recordingList?.length == 0 || null;

  useIAPInfo()
  useEffect(()=>{
    checkRecordPermission()
    dispatch(setTempIsIAPPurchased(false))
    NetInfo.addEventListener(state => {
      setOffline(!state.isConnected)
    })
  },[])

  useEffect(()=>{
    // if(!isOffline&&!!generateDummy&&generateDummy?.length>0&&uploading==0){
    //   batchRetryUpload()
    // }
  },[isOffline])


 


  const onAsk = () => {
    CreateModalRef.current?.close()
    AIModalRef.current?.toggle();
    AIModalRef.current?.getNewSugg()
  };
  const onCreate = () => {
    CreateModalRef.current?.onReset();
    AIModalRef?.current?.close()
    CreateModalRef.current?.toggle();
  };
  const onStartRecord = async(repeat=false) => {
    if (recEnabled&&!repeat){
      console.log('Recording already started.');
      return;
    }
    AIModalRef.current?.close()
    CreateModalRef.current?.close()
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    if(!canRecord){
      bannerRef.current?.show()
      return
    }
    // const {sound}= await Audio.Sound?.createAsync(recordSound,{shouldPlay:true,isLooping:false,volume:0.1})
    // soundRef.current=sound
    onRecord(setRec, setRecEnabled);
    activateKeepAwakeAsync()
    analytics().logEvent('started_recording')
  };



  const fetchSingleRecording = async (id: any) => {
    console.log('refetching single recording: ', id);
    const resp = await axiosApi.get(`/recordings/${id}`)
    console.log(resp.data);
    return resp
  }

  const onStopRecord = useCallback(async (duration: any, repeat = false) => {
    setRecEnabled(false);
    const uri = await stopRecording(rec);
    setRec(null);

    const temporaryRecordingId = Math.random().toString(36).substring(7);
    const newTemporaryRecording = {
      id: temporaryRecordingId,
      audio: { data: { url: uri, duration } },
      isUploading: true,
      title: `New Recording`,
      transcript: null,
      recorded_at: new Date().toISOString(),
      status: 'uploading',
    };

    dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));

    if (!repeat) {
      setExpandNote(0);
      scrollRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }

    const response = await saveVoiceNote({ audio: uri, duration });
    const recordingId = response.recording.id;

    listenToFirebaseStatus(recordingId, temporaryRecordingId);

    if (!repeat) deactivateKeepAwake();
    analytics().logEvent('completed_recording');
  }, [rec, recordingList, dispatch]);
  
  const onUploadRetry = async(note:any) => {
    return new Promise(async(resolve, reject) => {
    const d=note?.audio?.data?.duration||0
    const file = note?.audio?.data?.url||"";
    await onUploadRecord({setGenerateDummy,setUploading,setReduxRecordingList,recordingList,generateDummy,queryClient,scrollRef,addTranscriptRecord,file,uploadRecord,d,dispatchCanRecord,isRetry:true})
      .then(()=>resolve('success'))
      .catch((error)=>reject('error: '+ error))
    })
  }

  const batchRetryUpload = async () => {
    if (generateDummy && generateDummy.length > 0) {
      const temp = generateDummy.map((item:any) => ({ ...item, isUploading: true, error: null, is_audio_corrupted: false }));
      setGenerateDummy([...temp]);

      for (let i = temp.length - 1; i >= 0; i--) {
        try {
          await onUploadRetry(temp[i]); 
          temp.splice(i, 1);
          setGenerateDummy([...temp]);
          setUploading(prevUploading => prevUploading - 1);
        } catch (error) {
          console.log(`Upload failed for item ${i}:`, error);
          temp[i] = { ...temp[i], isUploading: false };
          setGenerateDummy([...temp]);
        }
      }
    } 
  };  

  // useEffect(()=>{
  //   try{
  //     if(recordingQuery?.data&&!generateDummy&&recordingQuery?.data?.pages[0]?.data[0]?.transcript==null)
  //       recordingQuery.data.pages[0].data.data[0].transcript=''
  //   }catch{ }
  // },[generateDummy])

  const onCancel = async() => {
    await cancelRecording(rec,soundRef?.current);
    setRec(null);
    setRecEnabled(false);
    analytics().logEvent('cancelled_recording')
  };

  useEffect(() => {
    return rec?()=>{
      cancelRecording(rec,soundRef.current);
      setRec(null);
      setRecEnabled(false);
    }:undefined
  },[])
  
  const fetchNextPage=() =>recordingQuery.hasNextPage&&recordingQuery.fetchNextPage()

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NotePreview
        key={item?.title||item?.transcript}
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
        onUploadRetry={onUploadRetry}
        hashFilter={hashFilter}
        expand={expandNote}
        setExpand={()=>setExpandNote(index==expandNote?-1:index)}
      />
    ),
    [isPlay,play,audioLoading,expandNote]
  );

  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [prevOffset, setPrevOffset] = useState(0);

  useLayoutAnim([recordingList,isSearchVisible])

  const onRefresh=async()=>{
    setRefreshing(true);
    await recordingQuery.refetch()
    // if(!!generateDummy&&generateDummy?.length>0){
    //   batchRetryUpload()
    // }
    setRefreshing(false)
  }

  const handleScroll = (event:any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset >prevOffset && currentOffset > 0) {
      setIsSearchVisible(false);
    } else if (currentOffset < prevOffset && currentOffset > 10) {
      setIsSearchVisible(true);
    }
    setPrevOffset(currentOffset);
  };
  if(!token)
      return <Redirect href="/auth/landingPage/" />
  return (
    <SafeAreaView style={[styles.container,hideBackground?styles.hideBg:{}]}>
      <KeyboardAvoidingView behavior="padding" style={{flex:1}} onTouchStart={e=>{setHideSearch(true);}}>
      <View style={{ flex: 1}}>
        <View style={[styles.wrapper,hideBackground?styles.hideBg:{}]}>
          <View style={{backgroundColor:hideBackground?'transparent':'#fff',paddingHorizontal:18}}>
          <Header isLogged={!!token} isOffline={isOffline}/>
          <BannerAlert
            ref={bannerRef}
            snackHeight={52}
            onAction={()=>bannerRef?.current?.close()}
            actionText="Close"
            message="Your daily recording limit has been exceeded. Please try again later."
          />
          {!isListEmpty&&!!token &&hashFilter!='shared'&& (
            <Animated.View style={{opacity:hideBackground?0:1,marginTop:isIOS?0:10}} onTouchEnd={()=>!hideBackground&&router.push('/search/')} onTouchStart={(e)=>{e?.stopPropagation();setHideSearch(false)}}>
              <Animatable.View style={{zIndex:1}} animation={isSearchVisible?fadeIn:fadeOut} duration={40} easing={Easing.ease} useNativeDriver={true}>
                <SearchBar style={{opacity:1}} hideView={hideSearch} setHide={setHideSearch} isSearchVisible={isSearchVisible}/>
              </Animatable.View>
            </Animated.View>
          )}
          </View>
          <FlatList
            ref={scrollRef}
            // bounces={false}
            style={{opacity:hideBackground?0:1,marginTop:12}}
            data={recordingList}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
            renderItem={renderItem}
            onEndReachedThreshold={0.5}
            onEndReached={fetchNextPage}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            ListFooterComponent={
              (!token&&recordingQuery.isFetched)? (
                <AboutProduct disable={false} />
              ) : recordingQuery?.isRefetching?
              <View style={{alignItems:'center',justifyContent:'center',marginTop:20}}>
                <CircularLoader/>
              </View>:null
            }
            ListEmptyComponent={() => hashFilter=='shared'?
            <View style={{flexDirection:'row',alignItems:'center',backgroundColor:Colors.darkWithOpacity(0.05),paddingHorizontal:24,paddingVertical:12,borderRadius:12,marginTop:20}}>
              <SvgXml xml={home.share} />
              <View style={{marginLeft:16,backgroundColor:'transparent'}}>
                <Text style={{fontFamily:'Primary-Medium',fontSize:14,color:Colors.darkWithOpacity(1),marginBottom:4}}>You haven't shared any notes yet.</Text>
                <Text style={{fontFamily:'Primary',fontSize:12,color:Colors.darkWithOpacity(1)}}>To share a note, just tap ‘... More’ in the notes settings and select ‘Share’</Text>
              </View>
            </View>
              :(recordingList?.length==0&&recordingQuery.isLoading)?(
              <View style={{flex:1,height:height-(insets.top+200),justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size={"small"} color={"#000"}/>
              </View>
            ):(recordingList?.length==0&&!!token)?<AboutProduct disable={true} />:null}
            // automaticallyAdjustKeyboardInsets
            // keyboardShouldPersistTaps="handled"
          />
        </View>
        <CreateModal ref={CreateModalRef} recordingList={recordingList} fetchNextPage={fetchNextPage} setHideBg={setHideBg}/>
        <AIModal ref={AIModalRef} setHideBg={setHideBg}/>
       {showAskMe&& <AskMeSomething onClose={()=>setShowAskMe(false)}/>}
      </View>
      </KeyboardAvoidingView>
      <BottomBar
        onAsk={onAsk}
        onCreate={onCreate}
        onRecord={onStartRecord}
        onStopRecord={onStopRecord}
        recEnabled={recEnabled}
        onCancel={onCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {
    // paddingHorizontal: 18,
    paddingVertical:isIOS?0:32
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
  hideBg:{backgroundColor:'#F4F6F6'}
});