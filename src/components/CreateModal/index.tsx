import { StyleSheet, Text, View } from "react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import ReactNativeModal from "react-native-modal";
import Suggestions from "./suggestions";
import Records from "./records";
import AiLoader from "components/common/loaders/ai-loader";
import Notes from "./notes";
import { useCreate } from "queries/home";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

export default forwardRef(({recordingList=[],fetchNextPage=()=>{}}:createModalProps, ref) => {
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<'suggestions' | 'records' | 'note' | 'loader'>("suggestions");
  const [noteType, setNoteType] = useState<'summary' | 'points' | 'todo' | 'blog' | 'tweet' | 'email'>("summary");
  const [result, setResult] = useState({id:0,result:null})
  const [title, setTitle] = useState("");
  const {token}=useSelector((state:RootState)=>state.userDetails)

  const aiCreate=useCreate()

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
      };
    },
    []
  );
  const onSuggest=(type:any)=>{
    setNoteType(type)
    setPreview("records")
  }
  const onSetRecord=(id:number,title:string)=>{
    setPreview("loader");
    setTitle(title)
    aiCreate.mutate({recording_id:id,type:noteType},{
      onSuccess:(data)=>{
       if(title!="") {
        setResult({id,result:!!token?data?.data?.content?.data:data?.data?.result})
        setPreview("note");
      }
      }
    })
  }
  
  const onClose=()=>{
    setVisible(false)
    setTimeout(() => {
      setPreview("suggestions")
      setResult({id:0,result:null})
      setNoteType("summary")
      setTitle("")
    }, 300);
  }

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      onBackdropPress={onClose}
      style={{justifyContent:'flex-end',bottom:130}}
      backdropOpacity={0.05}
    > 
      <View style={[styles.modal,styles[preview]]}>
        {preview=="loader"&&<Text style={styles.heading}>Great!</Text>}
        {preview === 'suggestions' ?
        <Suggestions onPress={onSuggest}/>
        :preview === 'records' ?
        <Records recordingList={recordingList} fetchNextPage={fetchNextPage} onSelect={onSetRecord} />
        :preview=="loader"? <AiLoader text="AI is writing your points"/>
        :<Notes key={result?.id} type={noteType} result={result?.result} title={title} onEdit={()=>setPreview("suggestions")} onClose={onClose} id={result?.id} onRetry={onSetRecord} />
        }
      </View>
    </ReactNativeModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    // justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingBottom:24,
    paddingTop:24,
    paddingHorizontal:24,
    shadowColor:"#00000026",
		shadowOpacity: 0.9,
		shadowOffset: { width: 0, height:0.5 },
		shadowRadius: 1.5,
    zIndex:10,
		elevation: 2,
    height:'45%'
  },
  heading:{
      fontSize:20,
      fontFamily:"Primary-Medium",
      marginBottom:8,
      paddingHorizontal:0
  },
  suggestions:{height:'auto',paddingTop:16},
  records:{},
  note:{paddingHorizontal:0,paddingTop:16},
  loader:{justifyContent:'flex-start',paddingTop:36,paddingLeft:28}
});

export interface createModalProps{
  recordingList:any[],
  fetchNextPage:()=>void,
  onSelect?:(id:number,v:string)=>void
  title?:string
}