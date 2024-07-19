import Colors from "assets/Colors";
import {
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  useWindowDimensions,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactNativeModal from "react-native-modal";
import { AIModalSVG } from "assets/svg/AIModalSvg";
import { useAskAI,useAskAIHistory, useDeleteAskHistory, useGetAskChat, useUploadChatRecord, useVoiceChatResponse } from "queries/home";
import Touchable from "components/common/Touchable";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import typing from "assets/lottie/typing.json";
import chatLoader from "assets/lottie/chatLoader.json";
import { isIOS, screenHeight, screenWidth } from "utils/common";
import aiSuggestions from "utils/constants/ai-suggestions";
import { RootState } from "redux/store/store";
import CircularLoader from "components/common/loaders/circular-loader";
import { DrawerLayout } from "react-native-gesture-handler";
import { home } from "assets/svg/home";
import { formatDate, isSameDay } from "utils/format-date";
import { commonSvg } from "assets/svg/commonSvg";
import AudioPlayer from "./AudioPlayer";
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { cancelRecording, onRecord, stopRecording } from "func/home/record";
import { Audio } from "expo-av";
import ChatRecorder from "components/common/recording/chat-recorder";

type chatProps = {
  related_messages: [
    { id?:number,question: string; answer: string; answer2?: string | undefined,question_url?:string,answer_url?:string }
  ];
  user_id?: number;
  id?: number;
};
type AIProps = {
  setHideBg?: (v: boolean) => void;
}

export default forwardRef(({setHideBg=(v:boolean)=>{}}:AIProps, ref) => {
  const drawerRef=useRef<DrawerLayout>(null)
  const {userDetails,token} = useSelector(
    (state: any) => state.userDetails
  );
  
  const initChat: chatProps = {
    id: 0,
    user_id: 0,
    related_messages: [
      {
        question: "",
        answer: `Hi${token?(' '+userDetails?.name):''}, I am your personal AI.`,
        answer2: "What would you like to ask about your notes?",
        question_url:"",
        answer_url:"",
      },
    ],
  };

  const [visible, setVisible] = useState(false);
  const [suggLoaded, setSuggLoaded] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<chatProps>(initChat);
  const scrollRef = useRef<FlatList>(null);
  const [suggIndex, setSuggIndex] = useState(-2);
  const [drawerIndex, setDrawerIndex] = useState(-10);
  const [chatLoader,setChatLoader]=useState(false);
  const [duration,setDuration]=useState(0);
  const [isRecording,setIsRecording]=useState(false);
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const [audioLoader,setAudioLoader]=useState(false);
  const soundRef = useRef<any>(null);

  const getSuggestions = {data:{data:[aiSuggestions[suggIndex],aiSuggestions[suggIndex+1>=aiSuggestions.length?0:suggIndex+1]]}};
  // useSuggestions();
  const askAI = useAskAI(!token);
  const getAskHistory= useAskAIHistory();
  const askAIHistory=useMemo(()=>getAskHistory?.data?.pages?.flatMap((r:any)=>r?.data)??[],[getAskHistory])
  const getChat = useGetAskChat();
  const deleteChatHistory = useDeleteAskHistory();
  const uploadRecord=useUploadChatRecord();
  const getAnswer=useVoiceChatResponse();
  
  const getNewSugg = () => {
    setSuggLoaded(false)
    setTimeout(() => {
      if(suggIndex+2>=aiSuggestions.length)
        setSuggIndex(0)
      else
        setSuggIndex(suggIndex + 2);
      setSuggLoaded(true)
    }, 1000);
  }
  
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
          setHideBg(true)
        },
        close() {
          onClose()
        },
        toggle(){
          setVisible(!visible)
          setHideBg(!visible)
        },
        getNewSugg(){
          !visible&&getNewSugg()
        },
      };
    },
    [visible]
  );

  const scrollToEnd = () => 
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

  const onClose = () => {
    onCancelRecord()
    setVisible(false);
    setHideBg(false);
    setTimeout(() => {
      setChats(initChat);
      setChatStarted(false);
    }, 300);
  };

  const onDrawer = () => {
    setDrawerIndex(10)
    drawerRef.current?.openDrawer()
  }

  const onSuccessSendChat=(res:any) => {
    if(!!token){
      setChats({
        ...res?.data,
        related_messages: [...initChat.related_messages, ...res?.data?.related_messages],
      })
    }else{
      const temp:chatProps=chats;
      temp.related_messages[temp.related_messages?.length-1].answer=res?.data.answer;
      setChats({...temp,related_messages: [...temp.related_messages]});
    }
    scrollToEnd();
  }
  
  const onSend = (question: string) => {
    !chatStarted&&setChatStarted(true)
    const tempChats = chats;
    tempChats?.related_messages.push({ question, answer: "Typing" });
    setChats({ ...tempChats, related_messages: tempChats?.related_messages || [] });
    const data = chats?.id != 0 ? { question, id: chats.id } : { question };
    setInput("");
    scrollToEnd();
    askAI.mutate(data, {
      onSuccess: onSuccessSendChat,
      onError:()=>{
        tempChats?.related_messages.pop();
      }
    });
  };

  const onHistoryPress = async(id:any) => {
    setChatLoader(true)
    isRecording&&onCancelRecord()
    drawerRef.current?.closeDrawer()
    setChatStarted(true);
   await getChat.mutateAsync({id},{
    onSuccess:(res)=>{
      setChats({...res?.data,related_messages:[...initChat?.related_messages,...res?.data?.related_messages||[]]})
    }
   })
   setChatLoader(false)
  }

  const onNewChat = () => {
    setChats(initChat);
    setChatStarted(false);
  }

  const onDeleteHistory = (id:any) => {
    deleteChatHistory?.mutate({id},{
      onSuccess:()=>{
        getAskHistory.refetch()
      }
    })
  }
  
  const renderDrawer = () => {
    return (
      <View style={styles.history}>
        <FlatList
        data={askAIHistory}
        ListHeaderComponent={()=><Text style={[styles.historyText,{paddingHorizontal:20}]}>History</Text>}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        renderItem={({ item,index }) => (
          <View style={{}}>
            {(index==0||(index!=0&&!isSameDay(item?.created_at,askAIHistory[index-1]?.created_at)))&&
            <Text style={styles.date}>{formatDate(item?.created_at)}</Text>}
            <TouchableHighlight onPress={()=>onHistoryPress(item?.id)} underlayColor={Colors.greyWithOpacity(0.05)}>
              <View style={styles.selectHistory}>
              <Text style={styles.historyText} numberOfLines={1}>{item?.title}</Text>
              <Touchable onPress={()=>onDeleteHistory(item?.id)} style={{padding:8,marginRight:-8}}>
                <SvgXml xml={commonSvg.smallClose} />
              </Touchable>
              </View>
            </TouchableHighlight>
          </View>
        )}
        onEndReachedThreshold={0.5}
        onEndReached={()=>getAskHistory.hasNextPage&&getAskHistory.fetchNextPage()}
        />
      </View>
    );
  };

  const onRecordStart = async() => {
    setIsRecording(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    onRecord(setRec, setRecEnabled);
    activateKeepAwakeAsync()
  }
  const onCancelRecord = async() => {
    setIsRecording(false)
    await cancelRecording(rec,soundRef?.current);
    setRec(null);
    setRecEnabled(false);
  }

  const onStopRecord = (d:number) => {
    setIsRecording(false)
    // setDuration(d)
    deactivateKeepAwake()
    const file = rec?.getURI()||"";
    stopRecording(rec);
    setRec(null);
    !chatStarted&&setChatStarted(true)
    const tempChats = chats;
    tempChats?.related_messages.push({ question:"Typing", answer: "", question_url:file });
    setChats({ ...tempChats, related_messages: tempChats?.related_messages || [] });
    uploadRecord.mutate({audio:file,duration,id:chats?.id},{
      onSuccess:(data)=>{
        const mes=data?.data?.related_messages
        const id=mes[mes.length-1]?.id
        tempChats.related_messages[tempChats?.related_messages?.length-1]={ id:mes[mes?.length-1]?.id,question:mes[mes?.length-1]?.question, question_url:mes[mes?.length-1]?.question_url, answer: "Typing" ,answer_url:'file://'}
        setChats({ ...tempChats, related_messages: tempChats?.related_messages || [] });
        scrollToEnd()
        getAnswer.mutate({id},{
          onSuccess:(data)=>{
            onSuccessSendChat(data)
            setAudioLoader(false)
          }
        })
      },
    })
  }

  useEffect(() => {
    if (isRecording) {
      const timerId = setInterval(() => {
        setDuration(prevDuration => {
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
  }, [isRecording]);

  const {height}=useWindowDimensions()
  const top=height>690?64:99
  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"fadeInUp"}
      hideModalContentWhileAnimating={true}
      animationOut={"fadeOutDown"}
      // onBackdropPress={onClose}
      style={[styles.modalContainer, { bottom: keyboardShown ? 0 :(isIOS? top:94) }]}
      backdropOpacity={0.05}
      avoidKeyboard
      hasBackdrop={false}
      coverScreen={false}
    >
      <View style={styles.modal}>
        <View style={[styles.header1]}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
          {chatStarted&&<Touchable onPress={onNewChat} style={{ padding: 4, marginLeft: 12 }}>
            <SvgXml xml={AIModalSVG.newChat} />
          </Touchable>}
          <Touchable onPress={onClose} style={{ padding: 4, marginLeft: 12 }}>
            <SvgXml xml={AIModalSVG.close} />
          </Touchable>
          </View>
          <Touchable onPress={onDrawer} style={{ padding: 4, flexDirection:'row',alignItems:'center' }}>
            <SvgXml xml={AIModalSVG.history} />
            {/* <Text style={{fontFamily:'Primary',color:'#222',fontSize:14,marginLeft:8}}>History</Text> */}
          </Touchable>
        </View>
        {!chatLoader?
        <FlatList
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: chatStarted ? "flex-end" : "flex-start",
        }}
        data={chats?.related_messages || []}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        renderItem={({ item,index }) => (
          <View>
              {!!item?.question && 
              <ChatItem 
              text={item?.question} 
              isAI={false} 
              photo={userDetails?.photo_url}
              url={item?.question_url}/>}
              {!!item?.answer&&
              <ChatItem
                text={item?.answer}
                text2={item?.answer2 || undefined}
                isAI={true}
                url={item?.answer_url}
                photo={userDetails?.photo_url}
              />}
            </View>
        )}
        contentInset={{ bottom: 16 }}
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={()=>!chatStarted ?
          getSuggestions.data?.data?.length>0 &&(
            <View style={styles.suggestContainer}>
              <View style={[styles.row, { marginBottom: 4 }]}>
                <SvgXml xml={AIModalSVG.suggestion} />
                <Text style={styles.suggest}>Suggestions</Text>
                <Touchable onPress={getNewSugg} style={{padding:12}}>  
                  <SvgXml xml={AIModalSVG.refresh} />
                </Touchable>
              </View>
              {suggLoaded?
              getSuggestions.data?.data?.map((suggestion: any) => (
                <Btns
                  onPress={() => onSend(suggestion)}
                  txt={suggestion}
                  key={suggestion}
                />
              )):<View style={{marginTop:32,alignItems:'center'}}>
                <CircularLoader width={25} height={25} strokeWidth={3}/>
                </View>
              }
            </View>
          ):null}
        />:<View style={{marginTop:-50,alignItems:'center'}}>
        <CircularLoader width={25} height={25} strokeWidth={3}/>
        </View>}
        <View>
          <View style={styles.inputContainer}>
            {!isRecording?<>
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
              onPress={() => !!input?onSend(input):onRecordStart()}
            >
              <SvgXml xml={!!input?AIModalSVG.send:AIModalSVG.record} />
            </Touchable>
            </>
            :<View style={{width:'100%',marginLeft:-12,marginTop:0,justifyContent:'center'}}>
              <ChatRecorder
                totalDuration={'/00:20'}
                duration={duration}
                onCancel={onCancelRecord}
                onStopRecord={onStopRecord}
              />
            </View>}
          </View>
        </View>
        <View style={{position:'absolute',flex:1,zIndex:drawerIndex,top:0,width:'100%',height:'100%'}}>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={200}
          drawerPosition={'left'}
          drawerType="front"
          drawerBackgroundColor="#fff"
          overlayColor="transparent"
          renderNavigationView={renderDrawer}
          contentContainerStyle={{flex:1}}
          onDrawerClose={()=>setDrawerIndex(-10)}
          drawerContainerStyle={styles.drawer}
          />
        </View>
      </View>
    </ReactNativeModal>
  );
});

const ChatItem = ({ text = "", text2 = "", url="", isAI = true,photo='' }) => {
  const [expand,setExpand]=useState(false)
  if(!!url){
  return (
  <Pressable onPress={()=>setExpand(!expand)} style={[styles.convoContentContainer,!isAI?{alignSelf:'flex-end',alignItems:'flex-end'}:{}]}>
    {text=='Typing'?
    <LottieView source={chatLoader} autoPlay loop style={{width:40,height:40,marginLeft:!isAI?0:30,marginRight:!isAI?30:0,bottom:-25,transform:[{scaleX:isAI?1:-1}]}}/>
    :<View style={{backgroundColor:isAI?Colors.primary:Colors.darkWithOpacity(0.05),padding:16,borderRadius:12,width:'85%'}}>
      <AudioPlayer isAI={isAI} url={url}/>
      <Text style={{color:isAI?Colors.whiteWithOpacity(0.5):Colors.grey,fontFamily:'Primary', fontSize:14,lineHeight:19}} numberOfLines={expand?1000:2}>{text?.trimEnd()}</Text>
    </View>}
    <View style={[styles.aiIcon,{width:20,height:20,marginTop:10,borderRadius:100,borderWidth:isAI?1:0}]}>
        {!isAI&&!!photo? 
        <Image source={{uri:photo}} style={{width:20,height:20,borderRadius:100}}/>
        :<SvgXml xml={isAI ? AIModalSVG.aiSmall : AIModalSVG.youSmall} style={{borderRadius:100}}/>}
      </View>
  </Pressable>
)}
else{
return (
  <View style={styles.convoContentContainer}>
    <View style={{ flexDirection: "row" }}>
      <View style={styles.aiIcon}>
        {!isAI&&!!photo? 
        <Image source={{uri:photo}} style={{width:30,height:30,borderRadius:9}}/>
        :<SvgXml xml={isAI ? AIModalSVG.ai : AIModalSVG.you} />}
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
)}}

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
  modalContainer: { justifyContent: "flex-end", bottom: 40 },
  modal: {
    height:isIOS? screenHeight>690?'88%':'80%':'75%',
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 24,
    shadowColor: "#00000026",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.75 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 2,
    overflow:'hidden'
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
    // lineHeight: 24,
    paddingTop:16,
    paddingBottom:16,
    minHeight:24
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
    fontFamily: "Primary-Medium",
    fontSize: 12,
    color: Colors.darkWithOpacity(1),
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
  suggestContainer: { marginBottom: 24, marginHorizontal: 16,marginTop:screenHeight>690?150:50 },
  aiChat: { marginLeft: 45, marginTop: -8 },
  header1: {
    height: 57,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent:'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkWithOpacity(0.1),
    marginBottom: 16,
  },
  header2: { marginBottom:0, borderBottomWidth: 0 },
  lottie:{width:15,height:10,alignSelf:'flex-end'},
  drawer:{
  shadowColor: "#00000026",
  shadowOpacity: 0.9,
  shadowOffset: { width: 0, height: 0.75 },
  shadowRadius: 1.5,
  zIndex: 10,
  elevation: 2,
},
historyText:{fontFamily:'Primary',fontSize:14,color:'#222',maxWidth:'80%'},
history:{paddingVertical:20},
date:{fontFamily:'Primary',fontSize:12,color:Colors.darkWithOpacity(0.5),marginTop:16,marginBottom:12,paddingHorizontal:20},
selectHistory:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:4,marginBottom:8,paddingHorizontal:20}
});
