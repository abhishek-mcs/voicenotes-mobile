import { FlatList, Keyboard, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import ReactNativeModal from "react-native-modal";
import Suggestions from "./suggestions";
import Records from "./records";
import AiLoader from "components/common/loaders/ai-loader";
import Notes from "./notes";
import { useCreate, useGetAiCreation, useRecordings } from "queries/home";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS, screenHeight } from "utils/common";
import Touchable from "components/common/Touchable";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import Colors from "assets/Colors";
import { CreateModalSvg } from "assets/svg/CreateModal";
import listenAiCreate from "func/firebase/listen-ai-create";
import Header from "components/AIModal/header";

export default forwardRef(({}:createModalProps, ref) => {
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<'suggestions' | 'records' | 'note' | 'loader'>("suggestions");
  const [noteType, setNoteType] = useState<'summary' | 'points' | 'todo' | 'blog' | 'tweet' | 'email' | 'custom' | 'tidy'>("summary");
  const {recordingCreateList}=useSelector((state:RootState)=>state.recordingStates)
  const recordingList=recordingCreateList
  const [result, setResult] = useState({id:recordingList[0]?.id||null,result:null})
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [title, setTitle] = useState("");
  const [noteId, setNoteId] = useState<number[]>([]);
  const [customText, setCustomText] = useState("");
  const {token}=useSelector((state:RootState)=>state.userDetails)

  const aiCreate=useCreate()
  const getAiCreation=useGetAiCreation()
  const recordingQuery = useRecordings("");

  // useImperativeHandle(
  //   ref,
  //   () => {
  //     return {
  //       open() {
  //         setVisible(true);
  //         // setHideBg(true)
  //       },
  //       close() {
  //         setVisible(false);
  //         // setHideBg(false)
  //       },
  //       toggle(){
  //         setVisible(!visible)
  //         setHideBg(!visible)
  //       },
  //       onReset(){
  //         onReset()
  //       }
  //     };
  //   },
  //   [visible]
  // );
  const onSuggest=(type:any)=>{
    setNoteType(type)
    setCustomText("")
  }
  const onSetRecord=(id:number,title:string)=>{
    if(noteId?.includes(id)){
      const filtered=noteId?.filter((v:any)=>v!=id)
      setNoteId([...filtered])
    }else
      setNoteId([...noteId,id])
  }

  const getCreation=async(id:number)=>{
   await getAiCreation.mutateAsync(id,{
      onSuccess:(data)=>{
        setResult({id:noteId,result:!!token?data?.data?.content?.data:data?.data?.result})
        setPreview("note");
      }
    })
  }

  const onCreate=()=>{
    setPreview("loader");
    aiCreate.mutate({recording_id:noteId,type:noteType,payload:{custom_prompt:customText}},{
      onSuccess:async(data)=>{
        await listenAiCreate({id:data?.data?.id,getCreation})
      }
    })
  }

  const onReset=()=>{
    setPreview("suggestions")
    setResult({id:0,result:null})
    setNoteType("summary")
    setCustomText("")
    setNoteId([])
  }

  const onClose=()=>{
    // setHideBg(false)
    setVisible(false)
    setTimeout(() => {
      onReset()
    }, 300);
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

  const {height}=useWindowDimensions()
  
  const top=isIOS?
      height>690? 74: 108
      :105
  const fetchNextPage = () => {
    // if(recordingList?.length>10){
      recordingQuery.hasNextPage && recordingQuery.fetchNextPage();
      console.log("fetching next page");
    // }
  };
  return (
    // <ReactNativeModal
      // isVisible={visible}
      // animationIn={"slideInUp"}
      // animationOut={"fadeOutDown"}
      // onBackdropPress={onClose}
      // style={{justifyContent:'flex-end',marginBottom:keyboardShown?10:top}}
      // backdropOpacity={0}
      // hasBackdrop={true}
      // coverScreen={false}
      // // onTouchStart={(e)=>e?.stopPropagation()}
      // swipeDirection={"down"}
      // propagateSwipe={true}
      // onSwipeComplete={onClose}
    // > 
      <View style={[styles.modal,styles[preview]]}>
        <Header title="Create"/>
        {preview=="loader"&&<Text style={styles.heading}>Great!</Text>}
        {(preview === 'suggestions'||preview === 'records') ?
        <View style={{
          height:isIOS?screenHeight/1.2:screenHeight/1.1
          // keyboardShown?screenHeight/2.1:screenHeight/1.4
          }} onTouchStart={(e)=>e?.stopPropagation()}>
          <FlatList
          data={[1]}
          scrollIndicatorInsets={{top:20,bottom:20}}
          keyExtractor={(item:any,i)=>`${item?.id}-${i}`}
          renderItem={({item})=>(
          <>
            <Suggestions onPress={onSuggest} type={noteType} setCustomText={setCustomText} customText={customText}/>
            <Records recordingList={recordingList} fetchNextPage={fetchNextPage} onSelect={onSetRecord} selected={noteId}/>
          </>
          )}
          />
          {(noteId?.length>0&&(noteType !== 'custom'||(noteType=='custom'&&customText?.length>0)))&&
          <Touchable style={styles.createBtn} onPress={onCreate}>
            <Text style={styles.createTxt}>Create</Text>
            <SvgXml xml={CreateModalSvg.create} />
          </Touchable>}
        </View>
        :preview=="loader"? <AiLoader text={noteType=="custom"?'AI is writing based on your custom instructions':noteType=="tidy"?'Creating a cleaned-up version of your note':`AI is writing your ${noteType}`}/>
        :
        <Notes key={result?.id} type={noteType} result={result?.result} title={title} onEdit={()=>setPreview("suggestions")} onClose={onClose} id={result?.id} onRetry={onCreate} />
        }
      </View>
    // </ReactNativeModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    // justifyContent: "center",
    backgroundColor:Colors.whiteWithOpacity(1),
    borderRadius: 20,
    paddingBottom: 0,
    // paddingTop:24,
    paddingHorizontal: 24,
    shadowColor: "#00000026",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    // zIndex:10,
    elevation: 2,
    // height:screenHeight/1.4,
    flex: 1,
    paddingTop:isIOS?0:40
  },
  heading: {
    fontSize: 16,
    fontFamily: "Primary-Semibold",
    marginBottom: 8,
    paddingHorizontal: 0,
    marginTop: 12,
  },
  suggestions: { 
    height: "auto",
    // paddingTop: 16,
    paddingHorizontal: 0
  },
  records: {},
  note: { paddingHorizontal: 0, paddingTop: 16 },
  loader: { justifyContent: "flex-start", paddingTop: 16, paddingLeft: 28 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    alignSelf: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 16,
    marginVertical: 16,
  },
  createTxt: {
    fontSize: 14,
    fontFamily: "Primary-Semibold",
    color: "#fff",
    marginRight: 8,
  },
  drag: {
    backgroundColor: "#D9D9D9",
    height: 5,
    width: 64,
    marginTop: -8,
    borderRadius: 14,
    alignSelf: "center",
  },
});

export interface createModalProps{
  recordingList?:any[],
  fetchNextPage?:()=>void,
  onSelect?:(id:number,v:string)=>void
  title?:string
  setHideBg?:(v:boolean)=>void
  selected?:any
}