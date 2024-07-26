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
import { fetchSingleRecording, isIOS, screenHeight } from "utils/common";
import * as Animatable from "react-native-animatable";
// import AskMeSomething from "components/ask-me-something";
import { Redirect, router } from "expo-router";
import useIAPInfo from "hooks/iap/useIAPInfo";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates";
import { Text } from "react-native";
import Colors from "assets/Colors";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import Animated from "react-native-reanimated";
import {
  setRecordingList,
  updateRecordingDetails,
} from "redux/reducers/recordingStates";
import NetInfo from "@react-native-community/netinfo";
import { LayoutAnimation } from "react-native";
import { setCanRecord } from "redux/reducers/userDetails";
import BannerAlert from "components/common/banner-alert";
import { analytics, db } from "../../../firebaseConfig";
import useLayoutAnim from "hooks/anim/useLayoutAnim";
import CircularLoader from "components/common/loaders/circular-loader";
import * as FileSystem from "expo-file-system";
import { saveVoiceNote } from "func/home/uploadAudioFb";
import { off, onValue, ref, remove } from "firebase/database";
import {
  RecordingStatus,
  RecordingStatusString,
} from "func/firebase/recording-event-listener";
import axiosApi from "services/api/axios-api";
import { NewNote, Note } from "types";

const recordSound = require("../../assets/sounds/record.wav");
const { height } = Dimensions.get("screen");
const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
};
const fadeOut = {
  from: { opacity: 1 },
  to: { opacity: 0 },
};

export default () => {
  const insets = useSafeAreaInsets();
  const notePreviewRef = useRef<any>();
  const { hashFilter } = useSelector((state: RootState) => state.hash);
  const token = useSelector((state: RootState) => state.userDetails.token);
  const { canRecord } = useSelector((state: RootState) => state.userDetails);
  const [expandNote, setExpandNote] = useState(-1);
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
  const scrollRef = useRef<FlatList>(null);
  const soundRef = useRef<any>(null);
  const [hideSearch, setHideSearch] = useState(true);
  const [showAskMe, setShowAskMe] = useState(true);
  const [hideBackground, setHideBg] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [isOffline, setOffline] = useState(false);
  const [threadIndex, setThreadIndex] = useState(-1);
  const [recordingParentId, setRecordingParentId] = useState<string | null>(
    null
  );
  const bannerRef = useRef<any>(null);
  useGuestCreate(token, guestToken, createGuestUser, dispatch);

  const recordingQuery = useRecordings(hashFilter == "All" ? "" : hashFilter);

  const dispatchCanRecord = (val: boolean) =>
    dispatch(setCanRecord(val ?? true));

  const listenToFirebaseStatus = useCallback(
    (
      recordingId: string | number,
      temporaryRecordingId: string | null = null
    ) => {
      console.log("listening to firebase");
      const firebasePath = token
        ? "processStatuses/recording/"
        : "processStatuses/guest/recording/";
      const statusRef = ref(db, firebasePath + recordingId);

      let isProcessOver = false;
      onValue(statusRef, async (snapshot) => {
        if (snapshot.exists()) {
          const status = +snapshot.val();

          if (
            status !== RecordingStatus.TRANSCRIPT_FORMATTED &&
            status !== RecordingStatus.GENERATE_TITLE_FAILED &&
            status !== RecordingStatus.UPLOADED_FAILED &&
            status !== RecordingStatus.AUDIO_UPLOADED
          ) {
            return;
          }

          let updatedStatus = "uploading";
          if (status === RecordingStatus.AUDIO_UPLOADED) {
            updatedStatus = "processing";
            console.log("audio uploaded");
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: { status: updatedStatus },
                temporaryRecordingId,
              })
            );
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
          } else if (status === RecordingStatus.TRANSCRIPT_FORMATTED) {
            isProcessOver = true;
            console.log("formatted");
            const updatedNote = await fetchSingleRecording(recordingId);
            dispatch(
              updateRecordingDetails({
                recordingId,
                data: {
                  ...updatedNote.data,
                  status: "processed",
                  is_transcript_loading: false,
                },
              })
            );
            console.log("removing firebase listener");
            await remove(statusRef);
            off(statusRef);
            return;
          }
          console.log("Status = ", status, RecordingStatusString[status]);
        } else {
          console.log("Snapshot does not exist");
        }
      });
    },
    [token, dispatch]
  );

  // todo: fix the logic here
  useEffect(() => {
    if (recordingQuery.data) {
      const records =
        recordingQuery.data.pages.flatMap((p) =>
          token ? p.data.data : p.data
        ) || [];
      const modifiedRecords = records.map((rec) => ({
        ...rec,
        status: rec.status ?? "processed",
        subnotes: rec.subnotes.map((subnote) => ({
          ...subnote,
          status: subnote.status ?? "processed",
        })),
      }));
      dispatch(setRecordingList(modifiedRecords));
    }
  }, [recordingQuery.data, hashFilter, token, dispatch]);

  const isListEmpty = useMemo(
    () => recordingList?.length == 0 || null,
    [recordingList]
  );

  useIAPInfo();
  useEffect(() => {
    checkRecordPermission();
    dispatch(setTempIsIAPPurchased(false));
    NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
  }, []);

  const continueProcessing = async (note: Note, is_transcript_only = false) => {
    try {
      dispatch(
        updateRecordingDetails({
          recordingId: note.id,
          data: { is_transcript_loading: true },
        })
      );
      console.log("making request");
      const resp = await axiosApi.patch(`/recordings/${note.id}/continue`, {
        is_transcript_only,
      });
      listenToFirebaseStatus(note.id);
    } catch (error) {
      console.log("error in queing new transcript: ", error);
    }
  };

  const syncUpNote = async (note: Note) => {
    const retryUpload = async (note: Note) => {
      console.log("retrying upload for note: ", note.title);
      uploadVoiceNote(note);
    };

    const retryProcessing = async (note: Note) => {
      console.log("retrying processing");
      if (!note.transcript) {
        continueProcessing(note);
      }
    };

    if (
      note.status === "upload_failed" ||
      (note.status === "uploading" && note.recorded_at < Date.now() - 5 * 1000)
    ) {
      retryUpload(note);
    } else if (note.status === "processing_failed") {
      retryProcessing(note);
    }
  };

  useEffect(() => {
    if (isOffline) return;

    const notesToRetry = recordingList.filter(
      (rec) => rec?.status !== "processed"
    );
    console.log({ notesToRetry });
    for (const note of notesToRetry) {
      syncUpNote(note);
    }
  }, [isOffline]);

  const onAsk = () => {
    CreateModalRef.current?.close();
    AIModalRef.current?.toggle();
    AIModalRef.current?.getNewSugg();
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
    if (recEnabled && !repeat) {
      console.log("Recording already started.");
      if (parent_id) setRecordingParentId(parent_id);
      return;
    }
    AIModalRef.current?.close();
    CreateModalRef.current?.close();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    if (!canRecord) {
      bannerRef.current?.show();
      return;
    }
    setThreadIndex(index);
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
        data: { status: "uploading" },
        temporaryRecordingId,
      })
    );
    try {
      const response = await saveVoiceNote({
        audio: note.audio.data.url,
        duration: note.audio.data.duration,
        parent_id: note.parent_id ?? null,
        recorded_at: note.recorded_at,
      });
      const recordingId = response.recording.id;
      listenToFirebaseStatus(recordingId, temporaryRecordingId);
    } catch (error) {
      console.log("Error in network upload");
      dispatch(
        updateRecordingDetails({
          recordingId: null,
          data: { status: "upload_failed" },
          temporaryRecordingId,
        })
      );
    }
  };

  const onStopRecord = useCallback(
    async (duration: any, repeat = false) => {
      setRecEnabled(false);
      const uri = await stopRecording(rec);
      setRec(null);

      const temporaryRecordingId = Math.random().toString(36).substring(7);
      const newTemporaryRecording: NewNote = {
        id: temporaryRecordingId,
        audio: { data: { url: uri, duration } },
        isUploading: true,
        title: `New Recording`,
        transcript: null,
        recorded_at: new Date().getTime(),
        status: "uploading",
        audioUrl: uri,
        parent_id: recordingParentId ?? null,
      };

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
        setExpandNote(0);
        scrollRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }

      // upload a new note
      await uploadVoiceNote(newTemporaryRecording);

      if (!repeat) deactivateKeepAwake();
      analytics().logEvent("completed_recording");
    },
    [rec, recordingList, dispatch]
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
    console.log("fetching next page");
    recordingQuery.hasNextPage && recordingQuery.fetchNextPage();
  };

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NotePreview
        key={item?.title || item?.transcript}
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
      />
    ),
    [isPlay, play, audioLoading, expandNote]
  );

  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [prevOffset, setPrevOffset] = useState(0);

  useLayoutAnim([recordingList, isSearchVisible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await recordingQuery.refetch();
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

  const recordingParentNoteName = useMemo(() => {
    recordingList.find((note) => note?.id === recordingParentId)?.title ?? null;
  }, [recordingList, recordingParentId]);

  if (!token) return <Redirect href="/auth/landingPage/" />;
  return (
    <SafeAreaView
      style={[styles.container, hideBackground ? styles.hideBg : {}]}
    >
      <KeyboardAvoidingView
        behavior={isIOS ? "padding" : null}
        style={{ flex: 1 }}
        onTouchStart={(e) => {
          setHideSearch(true);
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.wrapper, hideBackground ? styles.hideBg : {}]}>
            <View
              style={{
                backgroundColor: hideBackground ? "transparent" : "#fff",
                paddingHorizontal: 18,
              }}
            >
              <Header isLogged={!!token} isOffline={isOffline} />
              <BannerAlert
                ref={bannerRef}
                snackHeight={52}
                onAction={() => bannerRef?.current?.close()}
                actionText="Close"
                message="Your daily recording limit has been exceeded. Please try again later."
              />
              {!isListEmpty && !!token && hashFilter != "shared" && (
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
                  <Animatable.View
                    style={{ zIndex: 1 }}
                    animation={isSearchVisible ? fadeIn : fadeOut}
                    duration={40}
                    easing={Easing.ease}
                    useNativeDriver={true}
                  >
                    <SearchBar
                      style={{ opacity: 1 }}
                      hideView={hideSearch}
                      setHide={setHideSearch}
                      isSearchVisible={isSearchVisible}
                    />
                  </Animatable.View>
                </Animated.View>
              )}
            </View>
            <FlatList
              ref={scrollRef}
              // bounces={false}
              style={{ opacity: hideBackground ? 0 : 1, marginTop: 12 }}
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
                hashFilter == "shared" ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: Colors.darkWithOpacity(0.05),
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 20,
                    }}
                  >
                    <SvgXml xml={home.share} />
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
                        You haven't shared any notes yet.
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Primary",
                          fontSize: 12,
                          color: Colors.darkWithOpacity(1),
                        }}
                      >
                        To share a note, just tap ‘... More’ in the notes
                        settings and select ‘Share’
                      </Text>
                    </View>
                  </View>
                ) : recordingList?.length == 0 && recordingQuery.isLoading ? (
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
              // automaticallyAdjustKeyboardInsets
              // keyboardShouldPersistTaps="handled"
            />
          </View>
          <CreateModal
            ref={CreateModalRef}
            recordingList={recordingList}
            fetchNextPage={fetchNextPage}
            setHideBg={setHideBg}
          />
          <AIModal ref={AIModalRef} setHideBg={setHideBg} />
          {/* {!recEnabled &&  showAskMe&& <AskMeSomething onClose={()=>setShowAskMe(false)}/>} */}
        </View>
      </KeyboardAvoidingView>
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
