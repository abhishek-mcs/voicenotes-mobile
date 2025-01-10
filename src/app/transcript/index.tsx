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
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import ChatRecorder from "components/common/recording/chat-recorder";
import { SvgXml } from "react-native-svg";
import { Audio } from "expo-av";
import Swiper from "react-native-swiper";
import { useSelector } from "react-redux";
import { DrawerLayout } from "react-native-gesture-handler";
import {
  useAskAI,
  useFetchMeetingAskChats,
  useUploadChatRecord,
  useVoiceChatResponse,
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

const Transcript = () => {
  const { recording_id = "", isShared= '' }: any = useLocalSearchParams();
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
  const snackRef:any = useRef();

  const meetingAskAI = useFetchMeetingAskChats();
  const { setMeetingAskAIData } = useNoteContext();

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
    snackRef?.current?.show()
    const t=transcript?.replace(/<\/?b>/g, "")?.replace(/<br\/?>/g, "")
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

  const messages =
    transcript
      ?.split(/<br\s*\/?>\s*<br\s*\/?>/)
      ?.filter((message: any) => message.trim() !== "") || [];

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.header}>
        <View style={{ width: "20%" }} />
        <Text style={styles.headerText}>Transcript</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Touchable onPress={onCopy} style={[styles.rightHeader,{marginTop:2}]} activeOpacity={0.6}>
            <SvgXml xml={AIModalSVG.transcriptCopy} />
          </Touchable>
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
            const isSpeaker = message?.toLowerCase()?.includes('speaker')
            const [speaker, content] = message
              ?.replace(/<\/?b>/g, "") // Remove <b> tags
              ?.split(/:(.+)/) // Split on first colon only
              ?.map((part: any) => part?.trim())
              ?.filter(Boolean); // Remove empty strings

            return (
              <View key={index} style={{}}>
                <Text style={styles.messageText}>
                  {isSpeaker?
                  <>
                  <Text style={styles.speaker}>{speaker}: </Text>
                  <Text style={styles.content}>{content}</Text>
                  </>
                  :speaker
                  }
                </Text>
              </View>
            );
          })
        )}
      </KeyboardAwareScrollView>
      {isShared!='shared'&&
        <KeyboardStickyView
        style={styles.inputContainer}
        offset={{ opened: isIOS ? 24 : screenHeight / 100 }}
      >
        {!isRecording ? (
          <>
            <View style={styles.inputContentContainer}>
              <TextInput
                ref={textInputRef}
                onTouchStart={(e) => e?.stopPropagation()}
                onFocus={() => scrollToEnd()}
                scrollEnabled={false}
                style={styles.input}
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

              <Pressable
                style={[
                  styles.send,
                  { position: "absolute", right: 0, opacity: !input ? 0.5 : 1 },
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
                  width={26}
                  height={26}
                />
              </Pressable>
            </View>
            <Pressable style={styles.send} onPress={() => onRecordStart()}>
              <SvgXml
                xml={AIModalSVG.record
                  ?.replace("#1C1B1F", Colors.text)
                  ?.replace("#222222", Colors.bgColor3(0.1))}
                width={40}
                height={40}
              />
            </Pressable>
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
      </KeyboardStickyView>}
      <Snackbar
        ref={snackRef}
        message="Copied"
      />
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
          paddingTop: isIOS?0:60,
        },
        inputContainer: {
          paddingTop: 16,
          paddingBottom:isIOS?0:16,
          // borderTopWidth: 1,
          // borderTopColor: Colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 14,
          backgroundColor: Colors.bgColor8,
        },
        inputContentContainer: {
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          width: "85%",
          borderWidth: 1,
          borderColor: Colors.border,
          height: 40,
          borderRadius: 1000,
          paddingHorizontal: 12,
          backgroundColor: Colors.inputBg3,
        },
        input: {
          // marginRight: 8,x
          fontSize: 16,
          fontFamily: "Primary",
          color: Colors.text,
          width: "85%",
        },
        send: {
          // paddingVertical: 16,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 8,
          // alignSelf: "flex-end",
        },
        messageContainer: {
          marginBottom: 16,
        },
        messageText: {
          fontSize: 14,
          color: Colors.text,
          lineHeight: 28,
          fontFamily: 'Primary'
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
