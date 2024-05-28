import {
  ActivityIndicator,
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
import { Redirect } from "expo-router";
import useIAPInfo from "hooks/iap/useIAPInfo";
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates";
import onUploadRecord from "func/home/on-upload-record";

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
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const createGuestUser = useGuestToken();
  const dispatch = useDispatch();
  const [rec, setRec] = useState<Audio.Recording | null>(null);
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

  useGuestCreate(token, guestToken, createGuestUser, dispatch);

  const recordingQuery = useRecordings(hashFilter=='All'?'':hashFilter)
  const uploadRecord = useUploadRecord()
  const addTranscriptRecord = useAddTranscript(true)
  const queryClient = useQueryClient();
  const [generateDummy,setGenerateDummy]=useState<any>(null)
  
  const recordingList = useMemo(
    () => recordingQuery?.data?.pages?.flatMap((p: any) =>!!token?(p?.data?.data) :(p?.data)) || [],
    [recordingQuery]
  );
  
  const isListEmpty = recordingList?.length == 0 || null;

  useIAPInfo()

  useEffect(()=>{
    checkRecordPermission()
    dispatch(setTempIsIAPPurchased(false))
  },[])
  // setupAudioRec(rec)

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
  const onStartRecord = async() => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    AIModalRef.current?.close()
    CreateModalRef.current?.close()
    // const {sound}= await Audio.Sound?.createAsync(recordSound,{shouldPlay:true,isLooping:false,volume:0.1})
    // soundRef.current=sound
    onRecord(setRec, setRecEnabled);
    activateKeepAwakeAsync()
  };
  const onStopRecord = async(d:number) => {
    const file = rec?.getURI()||"";
    stopRecording(rec);
    setRec(null);
    setRecEnabled(false);
    onUploadRecord({setGenerateDummy,queryClient,scrollRef,addTranscriptRecord,deactivateKeepAwake,file,uploadRecord,d})
      // await soundRef.current?.unloadAsync()
  };

  const onUploadRetry = () => {
    activateKeepAwakeAsync();
    const d=generateDummy?.audio?.data?.duration||0
    const file = generateDummy?.audio?.data?.url||"";
    onUploadRecord({setGenerateDummy,queryClient,scrollRef,addTranscriptRecord,deactivateKeepAwake,file,uploadRecord,d,isRetry:true})
  }

  useEffect(()=>{
    try{
      if(recordingQuery?.data&&!generateDummy&&recordingQuery?.data?.pages[0]?.data[0]?.transcript==null)
        recordingQuery.data.pages[0].data.data[0].transcript=''
    }catch{ }
  },[generateDummy])

  const onCancel = async() => {
    await cancelRecording(rec,soundRef?.current);
    setRec(null);
    setRecEnabled(false);
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
      />
    ),
    [isPlay,play,recordingList,audioLoading]
  );

  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [prevOffset, setPrevOffset] = useState(0);

  const handleScroll = (event:any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset >prevOffset && currentOffset > 0) {
      setIsSearchVisible(false);
    } else if (currentOffset < prevOffset && currentOffset > 0) {
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
          {/* <View style={{marginTop:(isIOS&&screenHeight>690)?0:10,backgroundColor:'transparent'}}> */}
          <Header isLogged={!!token}/>
          {!isListEmpty&&!!token && (
            <Animatable.View style={{zIndex:30,opacity:hideBackground?0:1,marginTop:10}} onTouchStart={(e)=>{e?.stopPropagation();setHideSearch(false)}} animation={isSearchVisible?fadeIn:fadeOut} duration={150} easing={Easing.ease} useNativeDriver={true}>
              <SearchBar style={{opacity:hideBackground?0:1}} hideView={hideSearch} setHide={setHideSearch} isSearchVisible={isSearchVisible}/>
            </Animatable.View>
          )}
          {/* </View> */}
          <FlatList
            ref={scrollRef}
            // bounces={false}
            style={{opacity:hideBackground?0:1}}
            data={
              recordingList?.length == 1
                ? recordingList[0] != undefined
                  ? (generateDummy?[generateDummy,...recordingList]:recordingList)
                  : []
                : (generateDummy?[generateDummy,...recordingList]:recordingList)
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
            renderItem={renderItem}
            onEndReachedThreshold={0.5}
            onEndReached={fetchNextPage}
            onRefresh={async()=>{
              setRefreshing(true);
              await recordingQuery.refetch()
              setRefreshing(false)
            }}
            refreshing={isRefreshing}
            ListFooterComponent={
              (!token&&recordingQuery.isFetched)? (
                <AboutProduct disable={false} />
              ) : null
            }
            ListEmptyComponent={() => recordingQuery.isLoading?(
              <View style={{flex:1,height:height-(insets.top+200),justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size={"small"} color={"#000"}/>
              </View>
            ):!!token?<AboutProduct disable={true} />:null}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: 18,
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
