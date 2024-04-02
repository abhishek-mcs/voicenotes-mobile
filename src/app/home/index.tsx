import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { View } from "../../components/common/Themed";
import { useCallback, useMemo, useRef, useState } from "react";
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import Header from "components/home/header";
import NotePreview from "components/home/note-preview";
import AboutProduct from "components/home/about-product";
import AIModal from "components/AIModal";
import { Modalize } from "react-native-modalize";
import CreateModal from "components/CreateModal";
import SearchBar from "components/common/search-bar";
import { Audio } from "expo-av";
import BottomBar from "components/home/bottom-bar";
import {
  cancelRecording,
  onRecord,
  stopRecording,
} from "func/home/record";
import { useGuestToken } from "queries/auth";
import useGuestCreate from "hooks/auth/useGuestCreate";
import { useAddTitle, useAddTranscript, useRecordings, useUploadRecord } from "queries/home";
import { useQueryClient } from "react-query";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CircularLoader from "components/common/loaders/circular-loader";
import { isIOS } from "utils/common";

const {height}=Dimensions.get('screen')

export default function TabOneScreen() {
  // const pathname = usePathname();
  // const params = useGlobalSearchParams();
  // const router = useRouter();
  // const segments = useSegments();
  const insets=useSafeAreaInsets()
  const notePreviewRef = useRef<any>();
  const {hashFilter} = useSelector((state: RootState) => state.hash);
  const token = useSelector((state: RootState) => state.userDetails.token);
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const createGuestUser = useGuestToken();
  const dispatch = useDispatch();
  const [searchParam, setSearchParam] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const AIModalRef = useRef<Modalize>();
  const CreateModalRef = useRef<Modalize>();
  const [isPlay,setIsPlay] = useState(-1)
  const [play,setPlay] = useState<Audio.Sound|null>()
  const [audioLoading, setAudioLoading] = useState(-1);
  const scrollRef = useRef<FlatList>(null);

  useGuestCreate(token, guestToken, createGuestUser, dispatch);

  const recordingQuery = useRecordings(hashFilter=='All'?'':hashFilter)
  const uploadRecord = useUploadRecord()
  const addTranscriptRecord = useAddTranscript()
  const addTitleRecord = useAddTitle()
  const queryClient = useQueryClient();
  
  const recordingList = useMemo(
    () => recordingQuery?.data?.pages?.flatMap((p: any) =>!!token?(p?.data?.data) :(p?.data)) || [],
    [recordingQuery]
  );
  
  const isListEmpty = recordingList?.length == 0 || true;
  // setupAudioRec(rec)

  const onAsk = () => {
    AIModalRef.current?.open();
  };
  const onCreate = () => {
    CreateModalRef.current?.open();
  };
  const onStartRecord = () => {
    onRecord(setRec, setRecEnabled);
  };
  const onStopRecord = async(d:number) => {
    const file = rec?.getURI()||"";
    stopRecording(rec);
    setRec(null);
    setRecEnabled(false);
      uploadRecord.mutate(
        {audio:file,duration:d},
        {
          onSuccess: (r) => {
            queryClient.invalidateQueries('all-recording');
            scrollRef.current?.scrollToOffset({animated: true, offset: 0});
            addTranscriptRecord.mutate(r?.data?.recording?.id,
              {
                onSuccess:async()=>{
                  queryClient.invalidateQueries('all-recording');
                  notePreviewRef.current?.onTriggerTranscript()
                  addTitleRecord.mutate(r?.data?.recording?.id,{
                    onSuccess:()=>{
                      queryClient.invalidateQueries('all-recording');
                      notePreviewRef.current?.onTriggerTitle()
                    }
                  })
                }
              });
          },
          onError: (r:any) => {
            console.log(r?.response?.data?.message);
          },
        }
      );
  };
  const onCancel = () => {
    cancelRecording(rec);
    setRec(null);
    setRecEnabled(false);
  };

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
      />
    ),
    [isPlay,play,recordingList,audioLoading]
  );

  return (
    <SafeAreaView style={styles.container} >
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.wrapper}>
          <Header isLogged={!!token} />
          {/* {!isListEmpty && (
            <SearchBar
              searchParam={searchParam}
              setSearchText={setSearchText}
              setSearchEnabled={setSearchEnabled}
              setSearchParam={setSearchParam}
              searchEnabled={searchEnabled}
              type={"messages"}
            />
          )} */}
          <FlatList
            ref={scrollRef}
            data={
              recordingList?.length == 1
                ? recordingList[0] != undefined
                  ? recordingList
                  : []
                : recordingList
            }
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
            renderItem={renderItem}
            onEndReachedThreshold={0.5}
            onEndReached={fetchNextPage}
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
          />
        </View>
        <CreateModal ref={CreateModalRef} recordingList={recordingList} fetchNextPage={fetchNextPage} />
        <AIModal ref={AIModalRef} />
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
});
