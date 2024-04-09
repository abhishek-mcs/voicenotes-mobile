import Colors from "assets/Colors";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactNativeModal from "react-native-modal";
import { AIModalSVG } from "assets/svg/AIModalSvg";
import { Skeleton } from "@rneui/themed";
import { Animated } from "react-native";
import { useAskAI, useSuggestions } from "queries/home";
import Touchable from "components/common/Touchable";
import { ScrollView } from "react-native";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import typing from "assets/lottie/typing.json";
import { isIOS } from "utils/common";

type chatProps = {
  messages: [
    { id?:number,question: string; answer: string; answer2?: string | undefined }
  ];
  user_id?: number;
  id?: number;
};

export default forwardRef((props, ref) => {
  const userName = useSelector(
    (state: any) => state.userDetails?.userDetails.name
  );
  const token = useSelector(
    (state: any) => state.userDetails?.token
  );

  const initChat: chatProps = {
    id: 0,
    user_id: 0,
    messages: [
      {
        question: "",
        answer: `Hi${token?(' '+userName):''}, I am your personal AI.`,
        answer2: "What would you like to ask about your notes?",
      },
    ],
  };

  const [visible, setVisible] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<chatProps>(initChat);
  const scrollRef = useRef<FlatList>(null);

  const getSuggestions = useSuggestions();
  const askAI = useAskAI(!token);

  useEffect(() => {
    const keyboardShown = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardShown(true)
    );
    const keyboardHide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardShown(false)
    );
    return () => {
      keyboardShown.remove();
      keyboardHide.remove();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        open() {
          setVisible(true);
        },
        close() {
          setVisible(false);
        },
        toggle(){
          setVisible(!visible)
        }
      };
    },
    [visible]
  );

  const scrollToEnd = () => 
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

  const onClose = () => {
    setVisible(false);
    setTimeout(() => {
      setChats(initChat);
      setChatStarted(false);
    }, 300);
  };

  const onSend = (question: string) => {
    !chatStarted&&setChatStarted(true)
    const tempChats = chats;
    tempChats?.messages.push({ question, answer: "Typing" });
    setChats({ ...tempChats, messages: tempChats?.messages || [] });
    const data = chats?.id != 0 ? { question, id: chats.id } : { question };
    setInput("");
    scrollToEnd();
    askAI.mutate(data, {
      onSuccess: (res) => {
        if(!!token){
          setChats({
            ...res?.data,
            messages: [...initChat.messages, ...res?.data?.messages],
          })
        }else{
          const temp:chatProps=chats;
          temp.messages[temp.messages?.length-1].answer=res?.data.answer;
          setChats({...temp,messages: [...temp.messages]});
        }
        scrollToEnd();
      },
      onError:()=>{
        tempChats?.messages.pop();
      }
    });
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      // onBackdropPress={onClose}
      style={[styles.modalContainer, { bottom: keyboardShown ? 50 : 118 }]}
      backdropOpacity={0.005}
      avoidKeyboard
      hasBackdrop={false}
      coverScreen={false}
    >
      <View style={styles.modal}>
        <View style={[styles.header1, !chatStarted ? styles.header2 : {}]}>
          <Touchable onPress={onClose} style={{ padding: 4, marginLeft: 12 }}>
            <SvgXml xml={AIModalSVG.close} />
          </Touchable>
          {/* <Touchable onPress={onHistory} style={{ padding: 4 }}>
            <SvgXml xml={AIModalSVG.history} />
          </Touchable> */}
        </View>
        <FlatList
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: chatStarted ? "flex-end" : "flex-start",
        }}
        data={chats?.messages || []}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        renderItem={({ item,index }) => (
          <View>
              {!!item?.question && <ChatItem text={item?.question} isAI={false} />}
              <ChatItem
                text={item?.answer}
                text2={item?.answer2 || undefined}
                isAI={true}
              />
            </View>
        )}
        contentInset={{ bottom: 16 }}
        contentInsetAdjustmentBehavior="always"
        />
        <View>
          {!chatStarted &&
          getSuggestions.data?.data?.length>0&& (
            <View style={styles.suggestContainer}>
              <View style={[styles.row, { marginBottom: 4 }]}>
                <SvgXml xml={AIModalSVG.suggestion} />
                <Text style={styles.suggest}>Suggestions</Text>
              </View>
              {getSuggestions.data?.data?.map((suggestion: any) => (
                <Btns
                  onPress={() => onSend(suggestion)}
                  txt={suggestion}
                  key={suggestion}
                />
              ))}
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              onTouchStart={e=>e?.stopPropagation()}
              onFocus={()=>scrollToEnd()}
              style={styles.input}
              scrollEnabled={false}
              placeholder="Ask anything about your notes..."
              placeholderTextColor={Colors.grey}
              multiline
              value={input}
              enablesReturnKeyAutomatically={true} 
              returnKeyType="send"
              autoCorrect={false}
              autoFocus={false}
              autoCapitalize="none"
              onChangeText={(text) => setInput(text)}
              onSubmitEditing={() => onSend(input)}
            />
            <Touchable
              style={styles.send}
              onPress={() => onSend(input)}
              disabled={input == ""}
            >
              <SvgXml xml={AIModalSVG.send} />
            </Touchable>
          </View>
        </View>
      </View>
    </ReactNativeModal>
  );
});

const ChatItem = ({ text = "", text2 = "", isAI = true }) => (
  <View style={styles.convoContentContainer}>
    <View style={{ flexDirection: "row" }}>
      <View style={styles.aiIcon}>
        <SvgXml xml={isAI ? AIModalSVG.ai : AIModalSVG.you} />
      </View>
      <Text style={styles.ai}>{isAI ? "AI" : "You"}</Text>
    </View>
    <View style={styles.aiChat}>
      <Text style={[styles.text]}>
        {text}
        {text=="Typing"&&<LottieView source={typing} autoPlay loop style={styles.lottie}/>}
      </Text>
      {!!text2 && <Text style={[styles.text, { marginTop: 8 }]}>{text2}</Text>}
    </View>
  </View>
);

const Btns = ({ txt = "", onPress = () => {} }) => (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={Colors.darkWithOpacity(0.05)}
    style={styles.btn}
  >
    <Text style={styles.btnTxt}>{txt}</Text>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  modalContainer: { justifyContent: "flex-end" },
  modal: {
    height: "70%",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 24,
    shadowColor: "#00000026",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.75 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: "Primary-Medium",
  },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  btw: { justifyContent: "space-between" },
  close: { marginTop: 12, position: "absolute", right: 16, top: 2 },
  desc: {
    marginBottom: 16,
    marginTop: 10,
    color: Colors.darkWithOpacity(0.5),
    fontSize: 14,
    fontFamily: "Primary",
    lineHeight: 20,
  },
  btn: {
    borderWidth: 1,
    borderColor: Colors.darkWithOpacity(0.1),
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  btnTxt: { fontSize: 14, fontFamily: "Primary", lineHeight: 20 },
  subTitle: {
    fontSize: 12,
    fontFamily: "Primary",
    color: Colors.grey,
    marginTop: 8,
    marginBottom: 12,
  },
  skeleton: { height: 34, borderRadius: 8, opacity: 0.2, marginTop: 12 },
  input: {
    // marginRight: 8,x
    fontSize: 16,
    fontFamily: "Primary",
    color: Colors.darkWithOpacity(0.9),
    textAlignVertical: "top",
    flexWrap: "wrap",
    width: "80%",
    lineHeight: 24,
    paddingTop:isIOS?13:16,
    paddingBottom:16
  },
  inputContainer: {
    minHeight: 60,
    borderTopWidth: 1,
    borderTopColor: Colors.darkWithOpacity(0.1),
    paddingLeft: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  send: {
    paddingVertical:16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    width: 72,
  },
  convoBar: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    borderBottomColor: Colors.darkWithOpacity(0.1),
    width: "100%",
    borderBottomWidth: 1,
  },
  back: {
    fontSize: 16,
    color: Colors.darkWithOpacity(1),
    fontFamily: "Primary",
  },
  convoContentContainer: { paddingBottom: 16, paddingHorizontal: 16 },
  ai: {
    fontSize: 14,
    color: Colors.grey,
    fontFamily: "Primary",
    marginLeft: 12,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: Colors.darkWithOpacity(1),
    fontFamily: "Primary",
    lineHeight: 24,
  },
  suggest: {
    fontFamily: "Primary",
    fontSize: 12,
    color: Colors.darkWithOpacity(0.5),
    marginLeft: 6,
  },
  aiIcon: {
    borderWidth: 1,
    borderColor: Colors.darkWithOpacity(0.1),
    borderRadius: 12,
    height: 32,
    width: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestContainer: { marginBottom: 24, marginHorizontal: 16 },
  aiChat: { marginLeft: 45, marginTop: -8 },
  header1: {
    height: 57,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkWithOpacity(0.1),
    marginBottom: 16,
  },
  header2: { marginBottom:0, borderBottomWidth: 0 },
  lottie:{width:15,height:10,alignSelf:'flex-end'}
});
