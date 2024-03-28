import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import MoreOptions from "components/common/more-options";
import Touchable from "components/common/Touchable";
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate } from "utils/format-date";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Audio } from "expo-av";
import { useAddTitle, useDeleteRecording, useSaveEditedNote, useSignedUrl, useToggleStar } from "queries/home";
import { useQueryClient } from "react-query";
import loader from "assets/lottie/loader.json"
import LottieView from "lottie-react-native";
import { setStringAsync } from "expo-clipboard";
import ChatBuble from "components/common/chat-buble";
import CircularLoader from "components/common/loaders/circular-loader";
import AiLoader from "components/common/loaders/ai-loader";

export default forwardRef(({
  note,
  list,index,isPlay,setIsPlay,play,setPlay,audioLoading,setAudioLoading
}:any,ref) => {
  const [editNote,setEditNote] = useState(note)
  const [tag,setTag] = useState('')
  const [isEdit,setIsEdit] = useState(false)
  const [visible, setVisible] = useState(false);
  const [triggerTypingTitle, setTriggerTypingTitle] = useState(0);
  const [triggerTypingTranscript, setTriggerTypingTranscript] = useState(0);

  const queryClient = useQueryClient();
  const saveEditedNote=useSaveEditedNote(note?.id)
  const toggleStarred=useToggleStar(note?.id)
  const deleteRecord=useDeleteRecording(note?.id)
  const addTitleRecord = useAddTitle()
  const signedURL = useSignedUrl()

  useImperativeHandle(ref,()=>({
    onTriggerTranscript:()=>{
        // setTriggerTypingTranscript(1)
        // console.log('triggered',index)
    },
    onTriggerTitle:()=>{
        // setTriggerTypingTitle(1)
        // console.log('triggered title',index)
    }
  }),[index])

  useEffect(()=>{
    if(triggerTypingTitle==1){
      setTriggerTypingTitle(2)
    }
  },[triggerTypingTitle])

  useEffect(()=>{
    if(triggerTypingTranscript==1)
      setTriggerTypingTranscript(2)
  },[triggerTypingTranscript])

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  const onSaveEdit=()=>{
    const tags=editNote?.tags?.flatMap((tag:any)=>tag?.name)
    saveEditedNote.mutate(
      {title:editNote?.title,transcript:editNote?.transcript,tags:tags||[]},{
        onSuccess:(e:any)=>{
          queryClient.invalidateQueries('all-recording')
          queryClient.invalidateQueries('all-tags')
        },
        onError:(e:any)=>{
          console.log(e?.response?.data?.message)
          setEditNote(note)
        }
      })
    setIsEdit(false);
  }
  const onCancelEdit=()=> {
    setIsEdit(false)
    setEditNote(note)
  }
  const onEdit=()=>  setIsEdit(true)
  const onStarred=()=>{
    toggleStarred.mutateAsync()
    queryClient.invalidateQueries('all-recording')
    queryClient.invalidateQueries('all-tags')
  }
  const onCreateSummary=()=>{}
  const onGenerate=useCallback(()=>{
    hideMenu();
    list[index].title=null
    addTitleRecord.mutate(note?.id,{
      onSuccess:async()=>{
        await queryClient.invalidateQueries('all-recording');
        setTriggerTypingTitle(1)
      }
    })
  },[])
  const onCopy=async()=>{
    hideMenu();
    await setStringAsync(note?.transcript||'');
  }
  const onDelete=()=>{
    hideMenu();
    deleteRecord.mutate('')
    queryClient.invalidateQueries('all-recording')
    queryClient.invalidateQueries('all-tags')
  }
  const onPlaybackStatusUpdate = async(status:any) => {
    if (status?.isLoaded && !status?.isPlaying && status?.didJustFinish) {
      // Audio playback has finished
      setIsPlay(-1)
      await play?.unloadAsync();
      setPlay(null);
    }else if(status?.isPlaying){
      setAudioLoading(-1);
    }
  };
  const onPlay=async()=>{
    try {
      // if(isPlay==index){
        setIsPlay(-1)
        await play?.unloadAsync()
        setPlay(null)
      // }else{
        setAudioLoading(index);
        signedURL.mutate(note?.id,{
          onSuccess:async(r)=>{
            setIsPlay(index);
            const { sound } = await Audio.Sound.createAsync(
              { uri: r.data?.url || "" },
              {shouldPlay:true,isLooping:false},
              onPlaybackStatusUpdate,
            );
            setPlay(sound);
          }
        })
      // }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
  
  if (isEdit)
    return Editor(editNote,setEditNote,onSaveEdit,onCancelEdit,tag,setTag)
  return (
    <View style={styles.container}>
      <View style={[styles.btw, styles.row]}>
        <View style={styles.row}>
          {audioLoading==index?
          <CircularLoader/>
          :<Touchable onPress={onPlay}>
            <SvgXml xml={isPlay==index?home.pause:home.play} />
          </Touchable>}
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={styles.timeLine} />
        <View style={{ marginLeft: 25 }}>
          {!!note?.title?
          <ChatBuble style={styles.title} message={note?.title} triggerAnimation={triggerTypingTitle} disableGenerating={()=>setTriggerTypingTitle(0)}/>
          :<AiLoader/>}
          {!!note?.transcript&&<ChatBuble style={styles.text} message={note?.transcript?.trimEnd()} triggerAnimation={triggerTypingTranscript} disableGenerating={()=>setTriggerTypingTranscript(0)}/>}
          {note?.tags?.length>0&&
          <View style={styles.row}>
          {note?.tags?.map((tag:any,i:number)=><Text key={i} style={styles.tag}>{'#'+tag?.name}</Text>)}
          </View>}
        </View>
      </View>

      <View style={[styles.row,{marginLeft:34,marginTop:16,position:'relative'}]}>
      <Touchable onPress={onStarred}>
        <SvgXml xml={home.star}/>
      </Touchable>
      <Touchable style={{marginLeft:16}} onPress={onEdit}>
        <SvgXml xml={home.edit}/>
      </Touchable>
      {/* <Touchable style={{marginLeft:16}} onPress={onCreateSummary} >
        <SvgXml xml={home.create1}/>
      </Touchable> */}
      <Menu
          visible={visible}
          anchor={
            <Touchable style={styles.menuPress} onPress={showMenu}>
              <SvgXml xml={home.more} />
            </Touchable>
          }
          onRequestClose={hideMenu}
          style={styles.menu}
        >
          <MenuItem style={styles.menuItem} onPress={onGenerate}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={home.generate} />
              <Text style={styles.menuItemTxt}>Generate another title</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onCopy}>
            <View style={styles.row}>
              <SvgXml xml={home.copy} />
              <Text style={styles.menuItemTxt}>Copy note</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onDelete}>
            <View style={styles.row}>
              <SvgXml xml={home.delete} />
              <Text style={styles.menuItemTxt}>Delete</Text>
            </View>
          </MenuItem>
        </Menu>
      </View>
    </View>
  );
});

const Editor=(editNote:any,setEditNote=(v:object|null)=>{},onSaveEdit=()=>{},onCancelEdit=()=>{},tag='',setTag=(v:string)=>{})=>(
  <View style={styles.editContainer}>
    <TextInput 
      style={styles.titleInput}
      autoComplete="off"
      autoCorrect={false}
      selectTextOnFocus={false}
      value={editNote.title}
      onChangeText={txt=>setEditNote((n:any)=>{return {...n,title:txt}})} />
    <View style={styles.divider1} />
    <TextInput 
      style={styles.textInput}
      multiline
      autoComplete="off"
      autoCorrect={false}
      selectTextOnFocus={false}
      value={editNote.transcript} 
      onChangeText={txt=>setEditNote((n:any)=>{return {...n,transcript:txt}})} />
    <View style={[styles.divider1, { width: "100%" }]} />
    <View style={styles.tagContainer}>
      <View style={[styles.row,{flexWrap:'wrap',width:'60%',alignSelf:'center'}]}>
      {editNote?.tags?.map((tag:any,indx:number)=>
      <Touchable key={indx} onPress={()=>setEditNote({...editNote,tags:editNote?.tags?.filter((_:any,i:number)=>i!=indx)})} style={{backgroundColor:Colors.primaryWithOpacity(0.1),paddingHorizontal:8,paddingVertical:2,marginRight:8,marginBottom:8,borderRadius:8}}>
        <Text style={[styles.tag,{marginTop:0,marginRight:0}]}>{'#'+tag?.name}</Text>
      </Touchable>
      )}
      <TextInput
        style={styles.tagInput}
        placeholder="#Add tags"
        placeholderTextColor={Colors.greyWithOpacity(0.82)}
        value={tag}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        selectTextOnFocus={false}
        onChangeText={txt=>setTag(txt)}
        onSubmitEditing={()=>{
          setEditNote({...editNote,tags:[...editNote.tags,{name:tag}]})
          setTag('')
          }} />
      </View>
      <View style={styles.row}>
      <Touchable 
        style={{marginRight:0,paddingVertical:8,paddingHorizontal:16}}
        onPress={onCancelEdit}>
        <Text style={{color:'#9b9b9b',fontFamily:'Primary',fontSize:14}}>Cancel</Text>
      </Touchable>
      <TouchableHighlight
       style={{paddingVertical:8,paddingHorizontal:16,backgroundColor:Colors.primary,borderRadius:100}}
       underlayColor={Colors.primaryWithOpacity(0.7)}
       onPress={onSaveEdit}
       >
        <Text style={{color:'#fff',fontFamily:'Primary',fontSize:14}}>Save</Text>
      </TouchableHighlight>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  row: { flexDirection: "row", alignItems: "center" },
  btw: { justifyContent: "space-between" },
  timeLine: {
    width: 1,
    height: "100%",
    backgroundColor: Colors.primaryWithOpacity(0.1),
    marginLeft: 9,
  },
  title: {
    fontWeight: "500",
    fontFamily: "Primary-Medium",
    fontSize: 18,
    color: "#222",
    lineHeight: 26,
  },
  text: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "rgba(34, 34, 34, 0.9)",
    lineHeight: 23,
    marginTop: 4,
  },
  titleInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontFamily: "Primary-Medium",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  textInput: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom:10,
    minHeight: 100,
    fontFamily: "Primary",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    textAlignVertical: "top",
    textAlign:'left',
  },
  divider1: {
    height: 1,
    width: "93%",
    backgroundColor: Colors.primaryWithOpacity(0.1),
    alignSelf: "center",
  },
  menu: {
    borderRadius: 12,
    marginTop:25,
    marginLeft:10
  },
  menuPress: {
    height: 20,
    width: 30,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  menuItem: { paddingHorizontal: 16, borderRadius: 12, overflow: "hidden" },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 12,
  },
  tagInput: { color: Colors.darkWithOpacity(0.9), fontFamily: "Primary" },
  editContainer:{
    borderWidth: 1,
    borderColor: Colors.primaryWithOpacity(0.1),
    borderRadius: 12,
    marginTop: 24,
    paddingVertical: 12,
  },
  tag:{
    fontSize:14,
    lineHeight:21.1,
    fontFamily:'Primary',
    color:'#717171',
    marginTop:4,
    marginRight:4
  },
  date:{
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: 14,
    marginLeft: 16,
  },
  tagContainer:{
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent:'space-between',
    alignItems:'flex-start'
  }
});
