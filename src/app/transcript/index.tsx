import {
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isAndroid, isIOS, screenHeight, screenWidth } from "utils/common";
import Header from "components/AIModal/header";
import { useNoteContext, useTheme } from "context";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import ChatRecorder from "components/common/recording/chat-recorder";
import { SvgXml } from "react-native-svg";
import { Audio } from "expo-av";
import Swiper from "react-native-swiper";
import { useDispatch, useSelector } from "react-redux";
import { DrawerLayout } from "react-native-gesture-handler";
import {
  useFetchMeetingAskChats,
} from "queries/home";
import * as Haptics from "expo-haptics";
import { cancelRecording, onRecord, stopRecording } from "func/home/record";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useDialog } from "context/DialogContext";
import { AIModalSVG } from "assets/svg/AIModalSvg";
import { RootState } from "redux/store/store";
import AiLoader from "components/common/loaders/ai-loader";
import { setStringAsync } from "expo-clipboard";
import Touchable from "components/common/Touchable";
import Snackbar from "components/common/snackbar";
import MoreOptions from "components/common/more-options";
import { home } from "assets/svg/home";

const Transcript = () => {
  const { recording_id = "", isShared = "", index = 0 }: any = useLocalSearchParams();
  const styles = useStyles();
  const { Colors, isLightMode } = useTheme();
  const { currentlyOpenedMeetingTranscript } = useSelector(
    (state: RootState) => state?.recordingStates
  );
  const transcript = currentlyOpenedMeetingTranscript;
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const soundRef = useRef<any>(null);
  const textInputRef = useRef<TextInput>(null);
  const { showDialog }: any = useDialog();
  const snackRef: any = useRef();
  const dispatch = useDispatch()

  const meetingAskAI = useFetchMeetingAskChats();
  const { setMeetingAskAIData, meetingAskAIData }:any = useNoteContext();

  useFocusEffect(
    useCallback(() => {
      if (!!recording_id) {
        const rec_id = JSON.parse(recording_id);
        meetingAskAI?.mutate(rec_id, {
          onSuccess: (data) => {
            setMeetingAskAIData(data?.data);
          },
        });
      }
    }, [recording_id])
  );

  useEffect(() => {
    // InteractionManager.runAfterInteractions(() => {
    //   textInputRef?.current && textInputRef?.current?.focus();
    // });
    const keyboardShown = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardShown(true)
    );
    const keyboardHide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardShown(false);
      isAndroid && textInputRef?.current?.blur();
    });

    return () => {
      keyboardShown.remove();
      keyboardHide.remove();
      setMeetingAskAIData(null);
    };
  }, []);

  const scrollToEnd = useCallback(
    () =>
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 600),
    [scrollRef]
  );

  const onSend = (question: string) => {
    Keyboard.dismiss();
    setMeetingAskAIData((prev: any) => {
      const data = { question, id: prev?.id };
      return { ...prev, data, isAudio: false };
    });
    setInput("");
    setTimeout(() => {
      router.push("/transcript/TranscriptAskAI");
    }, 600);
  };

  const onRecordStart = async () => {
    setIsRecording(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    onRecord(setRec, setRecEnabled, isLightMode, showDialog);
    activateKeepAwakeAsync();
  };

  const onCancelRecord = async () => {
    setIsRecording(false);
    await cancelRecording(rec, soundRef?.current);
    setRec(null);
    setRecEnabled(false);
  };

  const onStopRecord = async (d: number) => {
    setIsRecording(false);
    // setDuration(d)
    deactivateKeepAwake();
    const file = (await stopRecording(rec)) ?? "";
    setRec(null);
    setMeetingAskAIData((prev: any) => ({
      ...prev,
      isAudio: true,
      data: { audio: file, duration: d, id: prev?.id },
    }));
    setTimeout(() => {
      router.push("/transcript/TranscriptAskAI");
    }, 600);
  };

  const onCopy = async () => {
    snackRef?.current?.show();
    const t = transcript?.replace(/<\/?b>/g, "")?.replace(/<br\/?>/g, "");
    if (transcript) await setStringAsync(t);
  };

  useEffect(() => {
    if (isRecording) {
      const timerId = setInterval(() => {
        setDuration((prevDuration) => {
          const newDuration = prevDuration + 1000;
          if (newDuration >= 20000) {
            onStopRecord(newDuration);
            return 0;
          }
          return newDuration;
        }); // Update duration every second
      }, 1000);

      return () => {
        clearInterval(timerId);
        setDuration(0);
      }; // Cleanup the interval on component unmount
    }
  }, [isRecording, rec]);

  const onEdit = () => {
    router.navigate({
      pathname: "/edit-note/",
      params: { index, id: recording_id },
    });
  };

  const messages =
    transcript
      ?.split(/<br\s*\/?>\s*<br\s*\/?>/)
      ?.filter((message: any) => message.trim() !== "") || [];

  const hasHistory = meetingAskAIData?.related_messages?.length>0

  const moreOptions = [
    {
      title: "Edit",
      systemIcon: "square.and.pencil",
      androidIcon: "pencil-outline",
      onPress: onEdit,
    },
    {
      title: "Copy link",
      systemIcon: "doc.text",
      androidIcon: "content-copy",
      onPress: onCopy,
    },
  ]

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.header}>
        <View style={{ width: "20%" }} />
        <Text style={styles.headerText}>Transcript</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* <Touchable
            onPress={onCopy}
            style={[styles.rightHeader, { marginTop: 2 }]}
            activeOpacity={0.6}
          >
            <SvgXml xml={AIModalSVG.transcriptCopy} />
          </Touchable> */}
          <MoreOptions options={moreOptions} style={{height:30,width:30,position:'relative'}}>
            <View style={{height:29,width:29,zIndex:1000,borderRadius:100,backgroundColor:Colors.inputBg2,justifyContent:"center",alignItems:'center'}}>
              <SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/>
            </View>
          </MoreOptions>
          <Pressable onPress={() => router?.back()} style={styles.rightHeader}>
            <SvgXml
              xml={AIModalSVG.close?.replace("#1C1B1F", Colors.askClose)}
            />
          </Pressable>
        </View>
      </View>
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
        extraKeyboardSpace={-200}
      >
        {!transcript ? (
          <AiLoader
            text={
              "Processing transcript with timestamps, speaker identification, and generating insights."
            }
            style={{ marginTop: 0 }}
            size={14}
          />
        ) : (
          messages.map((message: any, index: number) => {
            // Split each message into speaker and content
            const isSpeaker = message?.toLowerCase()?.includes("speaker");
            const [speaker, content] = message
              ?.replace(/<\/?b>/g, "") // Remove <b> tags
              ?.split(/:(.+)/) // Split on first colon only
              ?.map((part: any) => part?.trim())
              ?.filter(Boolean); // Remove empty strings

            return (
              <View key={index} style={{}}>
                <Text style={styles.messageText}>
                  {isSpeaker ? (
                    <>
                      <Text style={styles.speaker}>{speaker}: </Text>
                      <Text style={styles.content}>{content}</Text>
                    </>
                  ) : (
                    speaker
                  )}
                </Text>
              </View>
            );
          })
        )}
      </KeyboardAwareScrollView>
      {isShared != "shared" && (
        <KeyboardStickyView
          style={styles.inputContainer}
          offset={{ opened: isIOS ? 34 : screenHeight/4 , closed: isIOS? 16 : 0 }}
        >
          {!isRecording ? (
            <>
              <View style={styles.inputContentContainer}>
                <TextInput
                  ref={textInputRef}
                  onTouchStart={(e) => e?.stopPropagation()}
                  onFocus={() => scrollToEnd()}
                  scrollEnabled={false}
                  style={[styles.input,{width:hasHistory?'80%':'85%'}]}
                  placeholder="Ask a question..."
                  placeholderTextColor={Colors.text11}
                  multiline={false}
                  value={input}
                  enablesReturnKeyAutomatically={true}
                  returnKeyType="send"
                  autoCorrect={true}
                  autoFocus={false}
                  autoCapitalize="none"
                  onChangeText={(text) => setInput(text)}
                  onSubmitEditing={() => onSend(input)}
                />

<View style={{flexDirection:'row', width: '100%',justifyContent:"flex-end", marginTop:8}}>
                {hasHistory&&
                <Pressable
                  style={[
                    styles.send,
                    {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={() => router.push("/transcript/TranscriptAskAI")}
                >
                  <SvgXml
                    xml={AIModalSVG.history
                      ?.replace("#0E3934", Colors.text6)
                      ?.replace(
                        'height="32"',
                        'height="32" transform="rotate(-90, 16, 16)"'
                      )}
                    width={30}
                    height={30}
                  />
                </Pressable>}
              <Pressable style={styles.send} onPress={() => onRecordStart()}>
                <SvgXml
                  xml={AIModalSVG.record
                    ?.replace("#1C1B1F", Colors.text)
                    ?.replace("#222222", Colors.bgColor3(0.1))}
                  width={30}
                  height={30}
                />
              </Pressable>
                <Pressable
                  style={[
                    styles.send,
                    {
                      opacity: !input ? 0.5 : 1,
                    },
                  ]}
                  disabled={!input}
                  onPress={() => onSend(input)}
                >
                  <SvgXml
                    xml={AIModalSVG.send
                      ?.replace("#0E3934", Colors.text6)
                      ?.replace(
                        'height="32"',
                        'height="32" transform="rotate(-90, 16, 16)"'
                      )}
                    width={30}
                    height={30}
                  />
                </Pressable>
                </View>
              </View>
            </>
          ) : (
            <View
              style={{
                width: "100%",
                paddingRight: 12,
                marginTop: 0,
                justifyContent: "center",
                height: 60,
              }}
            >
              <ChatRecorder
                totalDuration={"/00:20"}
                duration={duration}
                onCancel={onCancelRecord}
                onStopRecord={onStopRecord}
                recording={rec}
              />
            </View>
          )}
        </KeyboardStickyView>
      )}
      <Snackbar ref={snackRef} message="Copied" />
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        modalContainer: {
          flex: 1,
          backgroundColor: Colors.bgColor8,
          paddingTop: isIOS ? 0 : 60,
        },
        inputContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: Colors.bgColor8,
        },
        inputContentContainer: {
          justifyContent: "space-between",
          flex: 1,
          minHeight: 92,
          borderRadius: 16,
          paddingLeft: 12,
          paddingRight: 4,
          paddingBottom: 4,
          paddingTop: 12,
          backgroundColor: Colors.darkWithOpacity(0.05),
        },
        input: {
          maxHeight: 140,
          paddingRight: 12,
          fontSize: 16,
          fontFamily: "Primary",
          color: Colors.text,
        },
        send: {
          padding: 8,
          alignItems: "center",
          justifyContent: "center",
        },
        messageContainer: {
          marginBottom: 16,
        },
        messageText: {
          fontSize: 14,
          color: Colors.text,
          lineHeight: 28,
          fontFamily: "Primary",
        },
        speaker: {
          fontFamily: "Primary-Bold",
        },
        content: {
          fontFamily: "Primary",
        },

        headerText: {
          fontFamily: "Primary-Semibold",
          fontSize: 16,
          color: Colors.blackWithOpacity(1),
          width: "50%",
          textAlign: "center",
        },
        rightHeader: { padding: 4 },

        header: {
          flexDirection: "row",
          alignItems: "center",
          height: 50,
          paddingHorizontal: 12,
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
      }),
    [Colors]
  ); // Recreate styles when Colors change
};

export default Transcript;
