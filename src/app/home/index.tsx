import {
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { View } from "../../components/common/Themed";
import {
  useGlobalSearchParams,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RootState } from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import Header from "components/home/header";
import NotePreview from "components/home/note-preview";
import AboutProduct from "components/home/about-product";
import AIModal from "components/home/CreateModal";
import { Modalize } from "react-native-modalize";
import CreateModal from "components/home/AIModal";
import SearchBar from "components/common/search-bar";
import { Audio } from "expo-av";
import BottomBar from "components/home/bottom-bar";
import {
  cancelRecording,
  onRecord,
  setupAudioRec,
  stopRecording,
} from "func/home/record";
import { useGuestToken } from "queries/auth";
import useGuestCreate from "hooks/auth/useGuestCreate";
import { useRecordings, useUploadRecord } from "queries/home";
import getBlob from "utils/get-blob";

export default function TabOneScreen() {
  // const pathname = usePathname();
  // const params = useGlobalSearchParams();
  // const router = useRouter();
  // const segments = useSegments();
  const token = useSelector((state: RootState) => state.userDetails.token);
  const guestToken = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );
  const createGuestUser = useGuestToken();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const AIModalRef = useRef<Modalize>();
  const CreateModalRef = useRef<Modalize>();
  const [editNote, setEditNote] = useState({
    title: "",
    transcript: "",
    tags: [],
    tag: "",
  });

  useGuestCreate(token, guestToken, createGuestUser, dispatch);

  const recordingQuery: any = useRecordings()
  const uploadRecord = useUploadRecord()
  const recordingList = useMemo(
    () => recordingQuery?.data?.pages?.flatMap((p: any) =>!!token?p.data?.data :p.data) || [],
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
    const formData=new FormData();
    const file = rec?.getURI();
    console.warn(file)
    const response = await fetch(file?file:'');
    if (response.ok) {
      // Convert the response data to a Blob object
      const audioBlob = await response.blob();
      formData.append("audio", audioBlob);
      formData.append("duration", d.toString());
      uploadRecord.mutate(
        formData,
        {
          onSuccess: (r) => {
            
          },
          onError: (r) => {
            console.log(r);
          },
        }
      );
    }
    stopRecording(rec);
    setRec(null);
    setRecEnabled(false);
  };
  const onCancel = () => {
    cancelRecording(rec);
    setRec(null);
    setRecEnabled(false);
  };

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NotePreview
        visible={visible}
        setVisible={setVisible}
        note={item}
        index={index}
        editNote={editNote}
        setEditNote={setEditNote}
      />
    ),
    [visible, editNote]
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.wrapper}>
          <Header isLogged={!!token} />
          {!isListEmpty && (
            <SearchBar
              searchParam={searchParam}
              setSearchText={setSearchText}
              setSearchEnabled={setSearchEnabled}
              setSearchParam={setSearchParam}
              searchEnabled={searchEnabled}
              type={"messages"}
            />
          )}
          <FlatList
            data={recordingList}
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(itm, i) => `${itm?.id + "-" + i?.toString()}`}
            renderItem={renderItem}
            ListFooterComponent={!token ? <AboutProduct /> : null}
          />
        </View>
        <CreateModal ref={CreateModalRef} />
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
