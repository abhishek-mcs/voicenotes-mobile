import {
  FlatList,
  Image,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
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
  useCallback,
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
import { useDispatch, useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import typing from "assets/lottie/typing.json";
import chatLoader from "assets/lottie/chatLoader.json";
import { isAndroid, isIOS, screenHeight, screenWidth } from "utils/common";
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
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
import { setStringAsync } from "expo-clipboard";
import { setRelatedNoteId } from "redux/reducers/relatedNoteStates";
import Swiper from 'react-native-swiper'
import Header from "./header";
import { useTheme } from "context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type chatItemProps={ id?:number,question?: string; answer?: string; answer2?: string | undefined,question_url?:string,answer_url?:string }
type chatProps = {
  related_messages: chatItemProps[];
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
    related_messages: [],
  };

  const [visible, setVisible] = useState(false);
  const [suggLoaded, setSuggLoaded] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<chatProps>(initChat);
  const scrollRef = useRef<ScrollView>(null);
  const [suggIndex, setSuggIndex] = useState(-2);
  const [drawerIndex, setDrawerIndex] = useState(-10);
  const [chatLoader,setChatLoader]=useState(false);
  const [duration,setDuration]=useState(0);
  const [isRecording,setIsRecording]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(0);
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [recEnabled, setRecEnabled] = useState<boolean>(false);
  const [audioLoader,setAudioLoader]=useState(false);
  const soundRef = useRef<any>(null);
  const textInputRef = useRef<TextInput>(null);
  const swiperRef = useRef<Swiper>(null)
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()

  const getSuggestions = {data:{data:[aiSuggestions[suggIndex],aiSuggestions[suggIndex+1>=aiSuggestions.length?0:suggIndex+1]]}};
  // useSuggestions();
  const askAI = useAskAI(!token);
  const getAskHistory= useAskAIHistory();
  const askAIHistory=useMemo(()=>getAskHistory?.data?.pages?.flatMap((r:any)=>r?.data)??[],[getAskHistory])
  const getChat = useGetAskChat();
  const deleteChatHistory = useDeleteAskHistory();
  const uploadRecord=useUploadChatRecord();
  const getAnswer=useVoiceChatResponse();
  const AIModalSVGIcons:any = AIModalSVG 
  
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
    InteractionManager.runAfterInteractions(()=>{
      textInputRef?.current&&textInputRef?.current?.focus();
    })
    const keyboardShown = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardShown(true)
    );
    const keyboardHide = Keyboard.addListener("keyboardWillHide", () =>{
      setKeyboardShown(false)
      isAndroid&&textInputRef?.current?.blur();
    }
    );
    getNewSugg()
    return () => {
      keyboardShown.remove();
      keyboardHide.remove();
    };
  }, []);

  // useImperativeHandle(
  //   ref,
  //   () => {
  //     return {
  //       open() {
  //         setVisible(true);
  //         setHideBg(true)
  //       },
  //       close() {
  //         onClose()
  //       },
  //       toggle(){
  //         setVisible(!visible)
  //         setHideBg(!visible)
  //       },
  //       getNewSugg(){
  //         !visible&&getNewSugg()
  //       },
  //     };
  //   },
  //   [visible]
  // );

  const scrollToEnd = useCallback(() => 
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 600),[scrollRef])

  const onClose = () => {
    onCancelRecord()
    setVisible(false);
    setHideBg(false);
    setTimeout(() => {
      setChats(initChat);
      setChatStarted(false);
    }, 300);
    router.back()
  };

  const onDrawer = () => {
    setDrawerIndex(10)
    drawerRef.current?.openDrawer()
  }

  const onSuccessSendChat=(res:any) => {
    if(!!token){
      setChats({
        ...res?.data,
        related_messages: [ ...res?.data?.related_messages],
      })
    }else{
      // const temp:chatProps=chats;
      // temp.related_messages[temp?.related_messages?.length-1].answer=res?.data.answer;
      // setChats({...temp,related_messages: [...temp?.related_messages]});
    }
    scrollToEnd();
  }
  
  const onSend = (question: string) => {
    !chatStarted&&setChatStarted(true)
    const tempChats = chats;
    tempChats?.related_messages?.push({ question, answer: "Searching" });
    setChats({ ...tempChats, related_messages: tempChats?.related_messages || [] });
    const data = chats?.id != 0 ? { question, id: chats.id } : { question };
    setInput("");
    scrollToEnd();
    setTimeout(() => {
      tempChats.related_messages[tempChats?.related_messages?.length-1].answer="Typing"
      setChats({...tempChats})
      askAI.mutate(data, {
        onSuccess: onSuccessSendChat,
        onError:()=>{
          tempChats?.related_messages?.pop();
        }
      });
    }, 1000);
  };

  const onHistoryPress = async(id:any) => {
    setChatLoader(true)
    isRecording&&onCancelRecord()
    drawerRef.current?.closeDrawer()
    setChatStarted(true);
   await getChat.mutateAsync({id},{
    onSuccess:(res)=>{
      setChats({...res?.data,related_messages:[...res?.data?.related_messages||[]]})
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
    onRecord(setRec, setRecEnabled,isLightMode);
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
    tempChats?.related_messages?.push({ question:"Typing", answer: "", question_url:file });
    setChats({ ...tempChats, related_messages: tempChats?.related_messages || [] });
    uploadRecord.mutate({audio:file,duration:d,id:chats?.id},{
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
  }, [isRecording,rec]);

  const handleSegmentChange = (index: number) => {
    setSelectedIndex(index);
    setTimeout(() => {
      swiperRef.current?.scrollTo(index, true);
    }, 0);
  };

  return (
    <SafeAreaView style={[styles.modalContainer,{backgroundColor:selectedIndex==0?Colors.bgColor4:Colors.bgColor8},isIOS?{}:{backgroundColor:Colors.bgColor8}]}>
        <Header type="ask" title="Ask AI" chatStarted={chatStarted} selectedIndex={selectedIndex} onNewChat={onNewChat} onDrawer={onDrawer}/>
        <KeyboardAvoidingView
          style={[{ flex: 1}]}
          behavior={"padding"}
          keyboardVerticalOffset={isIOS ? 64 :0} // Adjust based on header height
        >        
          {!chatLoader ? (
            <KeyboardAwareScrollView bottomOffset={62}
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                justifyContent: chatStarted ? "flex-end" : "flex-start",
                paddingVertical: 16
              }}>
                {(chats?.related_messages||[])?.map((item:any, index:number) => (
                <View key={`${index}`}>
                  {!!item?.question && (
                    <ChatItem
                      text={item?.question}
                      isAI={false}
                      photo={userDetails?.photo_url}
                      url={item?.question_url}
                    />
                  )}
                  {!!item?.answer && (
                    <ChatItem
                      text={item?.answer}
                      text2={item?.answer2 || undefined}
                      isAI={true}
                      url={item?.answer_url}
                      photo={userDetails?.photo_url}
                      sources={item?.source}
                    />
                  )}
                </View>
              ))}
                {chats?.related_messages?.length==0&&
                <View style={{ marginLeft: 20 }}>
                  <SvgXml
                    xml={AIModalSVG.askAILogo?.replace(/#0E3934/g,Colors.askLogo).replace('fill-opacity="0.1"',isLightMode?'fill-opacity="0.1"':'fill-opacity="0.3"')}
                    style={{ marginVertical: 16 }}
                  />
                  <Text
                    style={[
                      styles.headerText,
                      { fontSize: 18, width: "auto", textAlign: "left" },
                    ]}
                  >
                    Ask about your notes.
                  </Text>
                </View>}
                {!chatStarted
                  ? getSuggestions.data?.data?.length > 0 && (
                      <View style={styles.suggestContainer}>
                        <View style={[styles.row, { marginBottom: 4 }]}>
                          <Text style={styles.suggest}>Suggestions</Text>
                          <Touchable
                            onPress={getNewSugg}
                            style={styles.refresh}
                            activeOpacity={1}
                          >
                            <SvgXml
                              xml={AIModalSVG.refresh?.replace('black',Colors.blackWithOpacity(1))}
                              style={{ marginBottom: 2 }}
                            />
                          </Touchable>
                        </View>
                        {suggLoaded ? (
                          getSuggestions.data?.data?.map((suggestion: any) => (
                            <Btns
                              onPress={() => onSend(suggestion)}
                              txt={suggestion}
                              key={suggestion}
                            />
                          ))
                        ) : (
                          <View style={{ marginTop: 32, alignItems: "center" }}>
                            <CircularLoader
                              width={25}
                              height={25}
                              strokeWidth={3}
                            />
                          </View>
                        )}
                      </View>
                    )
                  : null
              }
            </KeyboardAwareScrollView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop:isIOS?0:screenHeight/2.5
              }}
            >
              <CircularLoader width={25} height={25} strokeWidth={3} />
            </View>
          )}
            <View
              style={[
                styles.inputContainer,
                // {position:'absolute',bottom:0,zIndex:100,left:0,right:0},
                keyboardShown ? { minHeight: 97 } : {},
              ]}
            >
              {!isRecording ? (
                <>
                  <TextInput
                    ref={textInputRef}
                    onTouchStart={(e) => e?.stopPropagation()}
                    onFocus={() => scrollToEnd()}
                    style={styles.input}
                    scrollEnabled={false}
                    placeholder="Ask a question..."
                    placeholderTextColor={Colors.text2}
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
                  <Touchable
                    style={styles.send}
                    onPress={() => (!!input ? onSend(input) : onRecordStart())}
                  >
                    <SvgXml
                      xml={!!input ? AIModalSVG.send : AIModalSVG.record?.replace('#1C1B1F',Colors.askClose)?.replace('#222222',Colors.text1)}
                    />
                  </Touchable>
                </>
              ) : (
                <View
                  style={{
                    width: "100%",
                    marginLeft: -12,
                    marginTop: 0,
                    justifyContent: "center",
                    height: 97,
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
            </View>
          <View
            style={{
              position: "absolute",
              flex: 1,
              zIndex: drawerIndex,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <DrawerLayout
              ref={drawerRef}
              drawerWidth={200}
              drawerPosition={"left"}
              drawerType="front"
              drawerBackgroundColor={Colors.whiteWithOpacity(1)}
              overlayColor="transparent"
              renderNavigationView={renderDrawer}
              contentContainerStyle={{ flex: 1 }}
              onDrawerClose={() => setDrawerIndex(-10)}
              drawerContainerStyle={styles.drawer}
            />
          </View>
          </KeyboardAvoidingView>
          </SafeAreaView>
  );
});

const ChatItem = ({ text = "", text2 = "", url="", isAI = true,photo='',sources=[] }) => {
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()
  const [expand,setExpand]=useState(false)
  const [copy,setCopy]=useState('Copy')
  const dispatch=useDispatch()

  const onCopy = async()=>{
      setCopy('Copied')
      await setStringAsync(text||'');
      setTimeout(() => {
          setCopy('Copy')
      }, 1000);
  }

  const goToSource=(id:string)=>{
    dispatch(setRelatedNoteId(id))
    router?.back()
  }

  if(!!url){
  return (
  <Pressable onPress={()=>setExpand(!expand)} style={[styles.convoContentContainer,!isAI?{alignSelf:'flex-end',alignItems:'flex-end'}:{},{paddingHorizontal:16,marginBottom:13}]}>
    {text=="Typing"?
    <LottieView source={chatLoader} autoPlay loop style={{width:40,height:40,bottom:-25,transform:[{scaleX:isAI?1:-1}]}}
    colorFilters={[
      { keypath: 'Ellipse 1', color: Colors.bgColor6 },
      { keypath: "chat 3 dots three loading message bubble", color: Colors.bgColor6 },
      { keypath: 'chat 3 dots three loading message bubble.First', color: Colors.text5 },
      { keypath: 'chat 3 dots three loading message bubble.Second', color: Colors.text5 },
      { keypath: 'chat 3 dots three loading message bubble.Last', color: Colors.text5 },
  ]}/>
    :<View style={[styles.audioChat,styles.shadow,{backgroundColor:isAI?Colors.primaryDark2:isIOS?Colors.bgColor15(0.5):Colors.bgColor15(1)},isAI?{}:{borderWidth:isLightMode?0:1,borderColor:Colors.bgColor13(0.1)}]}>
      <AudioPlayer isAI={isAI} url={url}/>
      <Text style={{color:isAI?Colors.bgColor13(isLightMode?0.5:1):Colors.text9,fontFamily:'Primary', fontSize:14,lineHeight:19}} numberOfLines={expand?1000:2}>{text?.trimEnd()}</Text>
    </View>}
  </Pressable>
)}
else{
return (
  <View style={[styles.convoContentContainer,{alignSelf:isAI?'flex-start':'flex-end'}]}>
    <View style={[styles.aiChat,isAI?styles.aiChatStyle:styles.userChatStyle,(text=="Typing"||text=='Searching')?{paddingVertical:8}:{}]}>
      <Text style={[styles.text,{position:"relative"}]}>
        {text}
        {(text=="Typing"||text=='Searching')&&<View><LottieView source={typing} speed={0.8} autoPlay loop style={styles.lottie} colorFilters={[
        { keypath: 'Shape Layer 1', color: Colors.text }, // Update the layer keypath and color
        { keypath: 'Shape Layer 2', color: Colors.text },
        { keypath: 'Shape Layer 3', color: Colors.text },
        { keypath: 'Shape Layer 4', color: Colors.text },
      ]} /></View>}
      </Text>
      {!!text2 && <Text style={[styles.text, { marginTop: 8 }]}>{text2}</Text>}

   {!isAI? <View style={{position:'absolute',bottom:-8,right:-8}}>
      <View style={{backgroundColor:Colors.grey2WithOpacity(0.05),width:10,height:10,borderRadius:7}}/>
      <View style={{backgroundColor:Colors.grey2WithOpacity(0.05),width:6,height:6,borderRadius:4,marginLeft:8}}/>
    </View>:
    sources?.length>0?<View style={{marginBottom:12}}>
      <View style={[styles.row,{paddingVertical:12}]}>
        <Text style={[styles.text,{color:Colors.grey}]}>Sources</Text>
        <View style={{flex:1,height:1,backgroundColor:Colors.grey2WithOpacity(0.1),marginLeft:8}}/>
      </View>
      <View>
        {sources.map((source:any,index:number)=>(
          <Touchable key={index} activeOpacity={1} onPress={()=>goToSource(source?.id)} style={[styles.row,{flexWrap:'nowrap',alignItems:'flex-start',marginBottom:8}]}>
            <SvgXml xml={AIModalSVG.source?.replace("#0D0D0D",Colors.arrow)} style={{marginRight:8,marginTop:6}}/>
            <Text style={[styles.text,{flexWrap:'wrap',width:'90%'}]}>{source?.title}</Text>
          </Touchable>
        ))}
      </View>
    </View>:null}
    </View>
   {isAI&&text!="Searching"&&text!="Typing"&&<Touchable onPress={onCopy} activeOpacity={1} style={[styles.aiChat,styles.aiChatStyle,styles.row,{alignSelf:'flex-start',paddingVertical:4}]}>
      <SvgXml xml={AIModalSVG.copy?.replace('#0D0D0D',Colors.black2)} style={{marginRight:4}}/>
      <Text style={[styles.text]}>{copy}</Text>
    </Touchable>}
  </View>
)}}

const Btns = ({ txt = "", onPress = () => {} }) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  return (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={isIOS?Colors.darkWithOpacity(0.05):Colors.whiteWithOpacity(1)}
    style={styles.btn}
  >
    <Text style={styles.btnTxt}>{txt}</Text>
  </TouchableHighlight>
);
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: Colors.lightGrey,paddingTop:isIOS?0:40 },
  modal: {
    height: isIOS ? (screenHeight > 690 ? "88%" : "80%") : "75%",
    justifyContent: "space-between",
    backgroundColor:Colors.whiteWithOpacity(1),
    borderRadius: 24,
    shadowColor: Colors.blackWithOpacity(0.15),
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.75 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 2,
    overflow: "hidden",
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
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    shadowColor: Colors.text1,
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 2,
    backgroundColor:Colors.bgColor2
  },
  btnTxt: { fontSize: 14, fontFamily: "Primary-Medium", lineHeight: 20,color:Colors.black2 },
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
    color: Colors.text1,
    textAlignVertical: "top",
    flexWrap: "wrap",
    width: "80%",
    // lineHeight: 24,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 24,
    backgroundColor: Colors.bgColor4,
  },
  inputContainer: {
    minHeight: 60,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingLeft: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: Colors.bgColor4,
  },
  send: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    alignSelf:'flex-end'
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
  convoContentContainer: {justifyContent:'center',maxWidth:'90%'},
  ai: {
    fontSize: 14,
    color: Colors.grey,
    fontFamily: "Primary",
    marginLeft: 12,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: Colors.text5,
    fontFamily: "Primary-Medium",
    lineHeight: 20,
  },
  suggest: {
    fontFamily: "Primary-Medium",
    fontSize: 14,
    color: Colors.grey,
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
  suggestContainer: { marginBottom: 24, marginHorizontal: 16, marginTop: 20 },
  aiChat: { marginLeft: 16,marginRight:16,paddingVertical:8,paddingHorizontal:12,borderRadius:12,marginBottom:13 },
  aiChatStyle:{
    backgroundColor:Colors.bgColor6,
    shadowColor:Colors.blackWithOpacity(1),
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 2,
    paddingVertical:12,paddingHorizontal:12
  },
  userChatStyle:{
    backgroundColor:Colors.bgColor7
  },
  header2: { marginBottom: 0, borderBottomWidth: 0 },
  lottie: { width:40,height:20,marginBottom:-6,marginLeft:-14},
  drawer: {
    shadowColor:Colors.blackWithOpacity(0.15),
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.75 },
    shadowRadius: 1.5,
    zIndex: 10,
    elevation: 2,
  },
  refresh: {
    width: 25,
    height: 24,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 7,
    backgroundColor:Colors.bgColor2,
    shadowColor: Colors.blackWithOpacity(1),
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 2,
  },
  headerText: { fontFamily: "Primary-Semibold", fontSize: 16, color: Colors.blackWithOpacity(1),width:'50%',textAlign:'center' },
  historyText: {
    fontFamily: "Primary",
    fontSize: 14,
    color: Colors.text1,
    maxWidth: "80%",
  },
  history: { paddingVertical: 20 },
  date: {
    fontFamily: "Primary",
    fontSize: 12,
    color: Colors.text3,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  selectHistory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  audioChat:{
    padding:12,borderRadius:12,width:'85%',
  },
  shadow:{
    shadowColor: Colors.blackWithOpacity(1),
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 2,
  }
}), [Colors]); // Recreate styles when Colors change
};
