import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import MoreOptions from "components/common/more-options";
import Touchable from "components/common/Touchable";
import { Alert, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate, isSameDay } from "utils/format-date";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Audio } from "expo-av";
import { useAddTitle, useCreate, useDeleteRecording, useSaveEditedNote, useSignedUrl, useToggleStar } from "queries/home";
import { useQueryClient } from "react-query";
import loader from "assets/lottie/loader.json"
import LottieView from "lottie-react-native";
import { setStringAsync } from "expo-clipboard";
import ChatBuble from "components/common/chat-buble";
import CircularLoader from "components/common/loaders/circular-loader";
import AiLoader from "components/common/loaders/ai-loader";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import { router, useRouter } from "expo-router";
import { CreateModalSvg } from "assets/svg/CreateModal";
import AiCreatedView from "./ai-created-view";

export default forwardRef(({
  note,
  list,index,isPlay,setIsPlay,play,setPlay,audioLoading,setAudioLoading,hideIcons=false,onDeleteCallBack=()=>{}
}:any,ref) => {
  const [editNote,setEditNote] = useState(note)
  const [tag,setTag] = useState('')
  const [isEdit,setIsEdit] = useState(false)
  const [moreOption, setMoreOption] = useState(false);
  const [createOption, setCreateOption] = useState(false);
  const [creationLoader, setCreationLoader] = useState(false);
  const [triggerTypingTitle, setTriggerTypingTitle] = useState(0);
  const [triggerTypingTranscript, setTriggerTypingTranscript] = useState(0);
  const [createType,setCreateType]=useState('summary')

  const {token} = useSelector((state:RootState)=>state.userDetails)
  
  const queryClient = useQueryClient();
  const saveEditedNote=useSaveEditedNote(note?.id)
  const toggleStarred=useToggleStar(note?.id)
  const deleteRecord=useDeleteRecording(note?.id)
  const addTitleRecord = useAddTitle()
  const signedURL = useSignedUrl()
  const createAI=useCreate()

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

  const hideMoreOption = () => setMoreOption(false);
  const showMoreOption = () => setMoreOption(true);
  const hideCreateOption = () => setCreateOption(false);
  const showCreateOption = () => setCreateOption(true);

  const onSaveEdit=()=>{
    const tags=editNote?.tags?.flatMap((tag:any)=>tag?.name)
    const temp=note;
    note.title=editNote?.title;
    note.transcript=editNote?.transcript;
    note.tags=editNote?.tags||[]
    saveEditedNote.mutate(
      {title:editNote?.title,transcript:editNote?.transcript,tags:tags||[]},{
        onSuccess:(e:any)=>{
          queryClient.invalidateQueries('all-recording')
          queryClient.invalidateQueries('all-tags')
        },
        onError:(e:any)=>{
          console.log(e?.response?.data?.message)
          setEditNote(temp)
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
    hideMoreOption()
    const isStarred=note?.tags?.some((r:any)=>r?.name=='starred');
    if(!isStarred){
      note.tags?.push({name:'starred'})
    } else{
      let temp=note?.tags;
      temp=temp.filter((r:any)=>r?.name!="starred")
      note.tags=temp;
    }
    toggleStarred.mutateAsync('',{
      onError() {
        if(!isStarred){
          note.note.tags?.pop()
        } else{
          note.tags.push({name:'starred'})
        }
      },
    })
  }

  const onCreate=async(type='summary')=>{
    setCreateType(type)
    setCreationLoader(true)
    hideCreateOption()
    await createAI.mutateAsync({recording_id:note?.id,type})
    setCreationLoader(false)
  }

  const onGenerate=useCallback(()=>{
    hideMoreOption();
    list[index].title=null
    addTitleRecord.mutate(note?.id,{
      onSuccess:async()=>{
        await queryClient.invalidateQueries('all-recording');
        setTriggerTypingTitle(1)
      }
    })
  },[])
  const onCopy=async()=>{
    hideMoreOption();
    await setStringAsync(note?.transcript||'');
  }
  const onDelete=()=>{
    hideMoreOption();
    Alert.alert('','Are you sure you want to delete?',[
      {
        text:'No',
        style:'cancel'
      },
      {
        text:'Yes',
        onPress:async()=>{
          await deleteRecord.mutateAsync('')
          onDeleteCallBack()
        }
      }
    ])
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
        setIsPlay(-1)
        await play?.unloadAsync()
        setPlay(null)
      if(isPlay!=index){
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
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  const creationList=useMemo(()=>note?.creations,[list])
  if (isEdit)
    return Editor(editNote,setEditNote,onSaveEdit,onCancelEdit,tag,setTag)
  return (
    <View style={styles.container}>
    {(index==0||(index!=0&&!isSameDay(note?.created_at,list[index-1]?.created_at)))&&
      <Text style={styles.date}>{formatDate(note?.created_at)}</Text>}
      <View style={{ flexDirection: "row"}}>
        <View style={[{alignItems:'flex-start'}]}>
          {audioLoading==index?
          <CircularLoader/>
          :<Touchable onPress={onPlay}>
            <SvgXml xml={isPlay==index?home.pause:home.play} />
          </Touchable>}
        <View style={styles.timeLine} />
        </View>
        <View style={{marginLeft:9,flex:1}}>
          {!!note?.title?
          <Touchable onPress={()=>{
            router.push({pathname:"/RelatedNotes/",params:{id:note?.id}});}}>
            <ChatBuble style={styles.title} message={note?.title} triggerAnimation={triggerTypingTitle} disableGenerating={()=>setTriggerTypingTitle(0)}/>
          </Touchable>
          :<AiLoader text={`Creating ${!note?.transcript?'transcript':'title'} from your voice`} style={{marginTop:-5}}/>}
          {!!note?.transcript&&<ChatBuble style={styles.text} message={note?.transcript?.trimEnd()} triggerAnimation={triggerTypingTranscript} disableGenerating={()=>setTriggerTypingTranscript(0)}/>}
          {note?.tags?.length>0&&
          <View style={styles.row}>
          {note?.tags?.map((tag:any,i:number)=><Text key={i} style={styles.tag}>{'#'+tag?.name}</Text>)}
          </View>}

      {!hideIcons&&<View style={[styles.row,{marginLeft:-6,marginTop:16,position:'relative'}]}>
      <Touchable onPress={onEdit} style={{paddingHorizontal:6,paddingVertical:5.5}}>
        <SvgXml xml={home.edit}/>
      </Touchable>
      {!!token&&<Menu
          visible={createOption}
          anchor={
            <Touchable style={styles.menuPress} onPress={showCreateOption}>
              <SvgXml xml={home.create1} />
            </Touchable>
          }
          onRequestClose={hideCreateOption}
          style={styles.menu}
        >
        <MenuItem style={styles.menuItem} onPress={()=>onCreate('summary')}>
          <View style={[styles.row,{width:180}]}>
            <SvgXml xml={CreateModalSvg.summary} />
            <Text style={styles.menuItemTxt}>Summarize</Text>
          </View>
        </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('points')}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={CreateModalSvg.points} />
              <Text style={styles.menuItemTxt}>List main points</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('todo')}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.todo} />
              <Text style={styles.menuItemTxt}>To-do list</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('blog')}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.blog} />
              <Text style={styles.menuItemTxt}>Blog post</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('tweet')}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.tweet} />
              <Text style={styles.menuItemTxt}>Tweet</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('email')}>
            <View style={styles.row}>
              <SvgXml xml={CreateModalSvg.email} />
              <Text style={styles.menuItemTxt}>Email</Text>
            </View>
          </MenuItem>
        </Menu>}
      <Menu
          visible={moreOption}
          anchor={
            <Touchable style={styles.menuPress} onPress={showMoreOption}>
              <SvgXml xml={home.more} />
            </Touchable>
          }
          onRequestClose={hideMoreOption}
          style={styles.menu}
        >
        <MenuItem style={styles.menuItem} onPress={onStarred}>
          <View style={[styles.row,{width:180}]}>
            <SvgXml xml={home.smallStar} />
            <Text style={styles.menuItemTxt}>Tag as #starred</Text>
          </View>
        </MenuItem>
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
          {!!token&&<MenuItem style={styles.menuItem} onPress={onDelete}>
            <View style={styles.row}>
              <SvgXml xml={home.delete} />
              <Text style={styles.menuItemTxt}>Delete</Text>
            </View>
          </MenuItem>}
        </Menu>
      </View>}
        {!!token&&creationLoader&&<AiLoader text={`Creating ${createType} from your voice`} />}
        {!!token&&creationList?.map((itm:any,i:number)=>(
          <AiCreatedView type={itm?.type} date={itm?.created_at} content={itm?.content?.data} key={i}/>
        ))}
        </View>
      </View>
    </View>
  );
});

const Editor=(editNote:any,setEditNote=(v:object|null)=>{},onSaveEdit=()=>{},onCancelEdit=()=>{},tag='',setTag=(v:string)=>{})=>(
  <View style={styles.editContainer} onTouchStart={e=>e?.stopPropagation()}>
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
      <View style={[styles.row,{flexWrap:'wrap',width:'55%',alignSelf:'center'}]}>
      {editNote?.tags?.map((tag:any,indx:number)=>
      <Touchable key={indx} onPress={()=>setEditNote({...editNote,tags:editNote?.tags?.filter((_:any,i:number)=>i!=indx)})} style={styles.tagWrap}>
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
          setEditNote({...editNote,tags:[...editNote.tags,{name:tag?.replace(/ /g, '')}]})
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
        <Text style={{color:'#fff',fontFamily:'Primary',fontSize:14,lineHeight:19}}>Save</Text>
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
    backgroundColor: Colors.primaryWithOpacity(0.1),
    marginTop: 8,
    flex:1,
    alignSelf:'center'
  },
  title: {
    fontWeight: "500",
    fontFamily: "Primary-Medium",
    fontSize: 16,
    color: "#222",
    lineHeight: 24,
  },
  text: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "rgba(34, 34, 34, 0.9)",
    lineHeight:isIOS?23:22,
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
    height: 25,
    width: 35,
    alignItems: "center",
    justifyContent: "center",
    marginLeft:4
  },
  menuItem: { paddingHorizontal:isIOS? 0:4,paddingLeft:isIOS?20:0, borderRadius: 12, overflow: "hidden" },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 12,
  },
  tagInput: { color: Colors.darkWithOpacity(0.9), fontFamily: "Primary",flex:1 },
  editContainer:{
    borderWidth: 1,
    borderColor: Colors.primaryWithOpacity(0.1),
    borderRadius: 12,
    marginTop: 24,
    paddingVertical: 12,
  },
  tag:{
    fontSize:14,
    lineHeight:19,
    fontFamily:'Primary',
    color:'#717171',
    marginTop:4,
    marginRight:4
  },
  date:{
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: isIOS?14:12,
    marginBottom: 8,
  },
  tagContainer:{
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: isIOS?16:10,
    flexDirection: "row",
    justifyContent:'space-between',
    alignItems:'flex-start'
  },
  tagWrap:{
    backgroundColor:Colors.primaryWithOpacity(0.1),
    paddingHorizontal:8,
    paddingVertical:2,
    marginRight:8,
    marginBottom:8,
    borderRadius:8
  }
});
