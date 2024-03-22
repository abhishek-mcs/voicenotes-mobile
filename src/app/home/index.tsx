import {
  FlatList,
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
import { useCallback, useRef, useState } from "react";
import { RootState } from "redux/store/store";
import { useSelector } from "react-redux";
import Header from "components/home/header";
import NotePreview from "components/home/note-preview";
import AboutProduct from "components/home/about-product";
import AIModal from "components/home/AIModal";
import { Modalize } from "react-native-modalize";
import CreateModal from "components/home/CreateModal";
import SearchBar from "components/common/search-bar";
import { Audio } from "expo-av";
import BottomBar from "components/home/bottom-bar";
import { cancelRecording, onRecord, setupAudioRec, stopRecording } from "func/home/record";

export default function TabOneScreen() {
  // const pathname = usePathname();
  // const params = useGlobalSearchParams();
  // const router = useRouter();
  // const segments = useSegments();
  // const token = useSelector((state: RootState) => state.userDetails.token);
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
    txt: "",
    tags: [],
    tag: "",
  });

  // setupAudioRec(rec)

  const onAsk = () => {
    AIModalRef.current?.open();
  };
  const onCreate = () => {
    CreateModalRef.current?.open();
  };
  const onStartRecord = () => {
    onRecord(setRec,setRecEnabled);
  };
  const onStopRecord = () => {
    stopRecording(rec);
    setRec(null);
    setRecEnabled(false);
  };
  const onCancel = () =>{
    cancelRecording(rec)
    setRec(null);
    setRecEnabled(false);
  }

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
      <View style={styles.wrapper}>
        <Header isLogged={true} />
        <SearchBar
          searchParam={searchParam}
          setSearchText={setSearchText}
          setSearchEnabled={setSearchEnabled}
          setSearchParam={setSearchParam}
          searchEnabled={searchEnabled}
          type={"messages"}
        />
        <FlatList
          data={[1]}
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(itm, i) => `${i?.toString()}`}
          renderItem={renderItem}
          ListFooterComponent={<AboutProduct />}
        />
      </View>
      <BottomBar onAsk={onAsk} onCreate={onCreate} onRecord={onStartRecord} onStopRecord={onStopRecord} recEnabled={recEnabled} onCancel={onCancel}/>
      <CreateModal ref={CreateModalRef} />
      <AIModal ref={AIModalRef} />
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
