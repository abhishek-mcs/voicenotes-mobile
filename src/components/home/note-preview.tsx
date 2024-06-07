import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { Alert, StyleSheet, Text, TextInput, TouchableHighlight, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate, isSameDay } from "utils/format-date";
import { Menu, MenuItem } from "react-native-material-menu";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Audio } from "expo-av";
import { useAddTitle, useAddTranscript, useCreate, useDeleteRecording, useRecordings, useSaveEditedNote, useSignedUrl, useToggleStar } from "queries/home";
import { useQueryClient } from "react-query";
import { setStringAsync } from "expo-clipboard";
import ChatBuble from "components/common/chat-buble";
import CircularLoader from "components/common/loaders/circular-loader";
import AiLoader from "components/common/loaders/ai-loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS, screenWidth } from "utils/common";
import { router, useRouter } from "expo-router";
import { CreateModalSvg } from "assets/svg/CreateModal";
import AiCreatedView from "./ai-created-view";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { MAIN_URL } from "services/api/api-constants";
import { useUnpublishRecording } from "queries/home/share";
import * as wb from 'expo-web-browser';
import PublishedModal from "./published-modal";
import { setRecordingList } from "redux/reducers/recordingStates";

export default forwardRef(({
  note,
  onUploadRetry,
  hashFilter,
  list,index,isPlay,setIsPlay,play,setPlay,audioLoading,setAudioLoading,hideIcons=false,onDeleteCallBack=()=>{}
}:any,ref) => {
  const route=useRouter()
  const [editNote,setEditNote] = useState(note)
  const [tag,setTag] = useState('')
  const [isEdit,setIsEdit] = useState(false)
  const [moreOption, setMoreOption] = useState(false);
  const [createOption, setCreateOption] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [isPublished, setIsPublished] = useState(note?.is_published??false);
  const [creationLoader, setCreationLoader] = useState(false);
  const [triggerTypingTitle, setTriggerTypingTitle] = useState(0);
  const [triggerTypingTranscript, setTriggerTypingTranscript] = useState(0);
  const [createType,setCreateType]=useState('summary')
  const dispatch=useDispatch()

  const {token} = useSelector((state:RootState)=>state.userDetails)
  
  const queryClient = useQueryClient();
  const saveEditedNote=useSaveEditedNote(note?.id)
  const toggleStarred=useToggleStar(note?.id)
  const deleteRecord=useDeleteRecording(note?.id)
  const addTitleRecord = useAddTitle()
  const signedURL = useSignedUrl()
  const createAI=useCreate()
  const addTranscript=useAddTranscript()
  const unPublishRecording=useUnpublishRecording()
  const recordingQuery = useRecordings(hashFilter=='All'?'':hashFilter)

  useEffect(()=>{
    if(triggerTypingTranscript==0&&!note?.transcript)
      setTriggerTypingTranscript(2)
  },[note?.transcript])

  useEffect(()=>{
    if(triggerTypingTitle==0&&!note?.title)
      setTriggerTypingTitle(2)
  },[note?.title])

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

  const onGotoAddTag=()=>{
    hideMoreOption()
    setTimeout(() => {
      const tags=note?.tags?.flatMap((tag:any)=>tag?.name)
      route.push({pathname:"/add-tags/",params:{tagsArray:JSON.stringify(tags),recording_id:note?.id}})
    }, 500);
  }

  const onCreate=async(type='summary')=>{
    setCreateType(type)
    setCreationLoader(true)
    hideCreateOption()
    await createAI.mutateAsync({recording_id:note?.id,type})
    setCreationLoader(false)
  }

  const onGenerateTitle=useCallback(()=>{
    hideMoreOption();
    note.title=null
    addTitleRecord.mutate(note?.id)
  },[note])

  const onReGenerateTranscript=useCallback(()=>{
    hideMoreOption();
    note.transcript=''
    addTranscript.mutate(note?.id)
  },[note])

  const onRetry=async()=>{
    if(!!note?.audio?.data?.url){
      onUploadRetry(note)
    }else{
      note.transcript=''
      note.title=null
      await addTranscript.mutateAsync(note?.id,{
        onSuccess:async()=>await addTitleRecord.mutateAsync(note?.id)
      })
    }
  }

  const onUnpublish=()=>{
    moreOption&&hideMoreOption();
    setShareVisible(false)
    unPublishRecording.mutateAsync({id:note?.id},{
      onSuccess:async(r)=>{
        const records=recordingQuery?.data?.pages?.flatMap((p: any) =>!!token?(p?.data?.data) :(p?.data)) || []
        setRecordingList(records);
        setIsPublished((t:boolean)=>!t);
        (hashFilter!='shared'&&!isPublished)&&
        setShareVisible(true)
      }
    })
  }

  const onShareNote=()=>{
    hideMoreOption();
    setTimeout(() => {
      setShareVisible(true)
    }, 500);
  }

  const onCopy=async(content='')=>{
    hideMoreOption();
    await setStringAsync(content);
    setShareVisible(false)
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

  const onPlaySet=async(res:any)=>{
   try{ 
      setIsPlay(index);
      const { sound } = await Audio.Sound.createAsync(
        { uri: res.data?.url || "" },
        {shouldPlay:true,isLooping:false},
        onPlaybackStatusUpdate,
      );
      setPlay(sound);
    }catch{}
  }

  const onPlay=async()=>{
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 2,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 2,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground:true,
      });
        setIsPlay(-1)
        await play?.unloadAsync()
        setPlay(null)
      if(isPlay!=index){
        setAudioLoading(index);
        if(!!note?.audio?.data?.url){
          onPlaySet(note?.audio)
        }else{
          signedURL.mutate(note?.id,{
          onSuccess:async(r)=>{
            onPlaySet(r)
          }
        })
      }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  useEffect(() => {
    if(!note?.public_slug){
      setIsPublished(false)
    }
  },[note?.public_slug]);

  useEffect(() => {
    setEditNote(note); // Update editNote when the note prop changes
  }, [note]);

  const formattedDuration = (duration=0) => new Date(duration).toISOString().substring(14, 19);

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
        <View style={{marginLeft:9,flex:1,marginTop:-3}}>
          {!!note?.title?
          <Touchable onPress={()=>{
            router.push({pathname:"/RelatedNotes/",params:{id:note?.id}});}}>
            <ChatBuble style={styles.title} message={note?.title} triggerAnimation={triggerTypingTitle} disableGenerating={()=>setTriggerTypingTitle(0)}/>
          </Touchable>
          :!!note?.audio?.data?.url&&note.isUploading==false?<Text style={styles.title}>{`New recording (${formattedDuration(note?.audio?.data?.duration)})`}</Text>
          :note?.transcript===null?<Text style={[styles.title,{color:'#ff4538'}]}>There was an error generating your transcript.{note?.transcript}</Text>
          :<AiLoader text={note?.isUploading?`Uploading your audio`:`Creating ${!note?.transcript?'transcript':'title'} from your voice`} style={{marginTop:-5}}/>
          }
          {!!note?.audio?.data?.url&&note.isUploading==false&&
          <View style={{flexDirection:'row',alignItems:'flex-start'}}>
            <SvgXml xml={home.wait} style={{marginTop:8,marginRight:8}}/>
            <Text style={[styles.text,{color:Colors.grey3,fontFamily:'Primary-Italic'}]} numberOfLines={2}>{`Synced and transcribed when you’re back online.`}</Text>
          </View>}
          {(!note?.transcript&&note?.title)?<AiLoader text={`Creating transcript from your voice`} style={{marginTop:0}} size={14}/>
          :note?.transcript!=''&&<ChatBuble style={styles.text} message={note?.transcript?.trimEnd()} continueGenerating={!note?.title} triggerAnimation={triggerTypingTranscript} disableGenerating={()=>setTriggerTypingTranscript(0)}/>}
          {note?.tags?.length>0&&
          <View style={[styles.row,{flexWrap:'wrap'}]}>
          {note?.tags?.map((tag:any,i:number)=>
          <Text 
            key={i} 
            style={styles.tag} 
            onPress={()=>dispatch(setTagsFilter(tag?.name))}
            suppressHighlighting>
              {'#'+tag?.name}
          </Text>)}
          </View>}

      {!hideIcons&&note?.transcript!=null&&!note?.isUploading&&
      <View style={[styles.row,{marginLeft:-6,marginTop:16,position:'relative'}]}>
      {hashFilter!='shared'&&
      <Touchable onPress={onEdit} style={{paddingHorizontal:6,paddingVertical:5.5}} disabled={!note?.transcript}>
        <SvgXml xml={home.edit}/>
      </Touchable>}
      {!!token&&hashFilter!='shared'&&<Menu
          visible={createOption}
          anchor={
            <Touchable style={styles.menuPress} onPress={showCreateOption} disabled={!note?.transcript}>
              <SvgXml xml={home.create1} />
            </Touchable>
          }
          onRequestClose={hideCreateOption}
          style={styles.menu}
        >
        <MenuItem style={styles.menuItem} onPress={()=>onCreate('summary')}>
          <View style={[styles.row]}>
            <SvgXml xml={CreateModalSvg.summary} />
            <Text style={styles.menuItemTxt}>Summarize</Text>
          </View>
        </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCreate('points')}>
            <View style={[styles.row]}>
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
            <Touchable style={[styles.menuPress,hashFilter!='shared'?{}:{marginLeft:0}]} onPress={showMoreOption}>
              <SvgXml xml={home.more} />
            </Touchable>
          }
          onRequestClose={hideMoreOption}
          style={styles.menu}
        >
        {hashFilter!='shared'?
        <>
        <MenuItem style={styles.menuItem} onPress={onStarred}>
          <View style={[styles.row,{width:180}]}>
            <SvgXml xml={home.smallStar} />
            <Text style={styles.menuItemTxt}>Tag as #starred</Text>
          </View>
        </MenuItem>
        <MenuItem style={styles.menuItem} onPress={onGotoAddTag}>
          <View style={[styles.row,{width:180}]}>
            <SvgXml xml={home.addTag} />
            <Text style={styles.menuItemTxt}>Add Tag</Text>
          </View>
        </MenuItem>
          <MenuItem style={styles.menuItem} onPress={()=>onCopy(note?.transcript??'')}>
            <View style={styles.row}>
              <SvgXml xml={home.copy} />
              <Text style={styles.menuItemTxt}>Copy note</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onShareNote}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={home.shareOptIcon} />
              <Text style={styles.menuItemTxt}>Get shareable link</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onGenerateTitle}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={home.generate} />
              <Text style={styles.menuItemTxt}>Regenerate title</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onReGenerateTranscript}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={home.retry} />
              <Text style={styles.menuItemTxt}>Regenerate transcript</Text>
            </View>
          </MenuItem>
          {!!token&&<MenuItem style={styles.menuItem} onPress={onDelete}>
            <View style={styles.row}>
              <SvgXml xml={home.delete} />
              <Text style={styles.menuItemTxt}>Delete</Text>
            </View>
          </MenuItem>}
          </>
          :
          <>
          <MenuItem style={[styles.menuItem,{paddingLeft:0}]} onPress={()=>onCopy(MAIN_URL+'/s/'+note?.public_slug)}>
            {/* <View style={[styles.row]}> */}
              {/* <SvgXml xml={home.generate} /> */}
              <Text style={styles.menuItemTxt}>Copy link</Text>
            {/* </View> */}
          </MenuItem>
          <MenuItem style={[styles.menuItem,{paddingLeft:0}]} onPress={onUnpublish}>
            {/* <View style={[styles.row]}> */}
              {/* <SvgXml xml={home.retry} /> */}
              <Text style={styles.menuItemTxt}>Unpublish</Text>
            {/* </View> */}
          </MenuItem>
          </>}
        </Menu>
      </View>}
      {isIOS?<Menu
          visible={shareVisible}
          anchor={null}
          onRequestClose={()=>setShareVisible(false)}
          animationDuration={1}
          style={{borderRadius:12,width:isPublished?screenWidth/1.2:'auto'}}
        >
        <MenuItem style={{padding:16,width:'100%',height:'100%'}} disabled={true} >
          {(!isPublished)?
            <View>
            <Text style={{fontSize:14,fontFamily:'Primary-Semibold',color:Colors.darkWithOpacity(1),lineHeight:19.2}}>
              Are you sure you want to share this note?
            </Text>
            <View style={{marginVertical:12,flexDirection:'row',alignItems:'center'}}>
            <Touchable activeOpacity={0.5} onPress={onUnpublish} style={{backgroundColor:Colors.darkWithOpacity(1),alignSelf:'flex-start',borderRadius:12,padding:12,paddingHorizontal:16}}>
              <Text style={{color:Colors.whiteWithOpacity(1),fontFamily:'Primary-Semibold',fontSize:12}}>Yes</Text>
            </Touchable>
            <Touchable activeOpacity={0.5} onPress={()=>setShareVisible(false)} style={{backgroundColor:Colors.darkWithOpacity(0.05),alignSelf:'flex-start',borderRadius:12,padding:12,paddingHorizontal:16,marginLeft:12}}>
              <Text style={{color:Colors.darkWithOpacity(1),fontFamily:'Primary-Semibold',fontSize:12}}>No</Text>
            </Touchable>
            </View>
            <View style={[styles.row,{alignItems:'flex-start'}]}>
            <SvgXml xml={CreateModalSvg.info} style={{marginTop:1}} />
            <Text style={{fontSize:12,fontFamily:'Primary',color:Colors.grey,lineHeight:16}}>
              {` Anyone with the link will have access to this voice note.`}
            </Text>
            </View>
          </View>
          :<View style={{width:screenWidth/1.2}}>
            <View style={[styles.row]}>
            <SvgXml xml={CreateModalSvg.unlock} />
            <Text style={{fontSize:14,fontFamily:'Primary-Semibold',color:Colors.darkWithOpacity(1),lineHeight:19.2,marginLeft:8,width:screenWidth/1.2}}>
              Your shareable link is ready 
            </Text>
            </View>
            <Text onPress={()=>wb.openBrowserAsync(MAIN_URL+'/s/'+note?.public_slug)} suppressHighlighting style={{fontSize:14,fontFamily:'Primary',color:Colors.primary,textDecorationLine:'underline',marginTop:4,width:screenWidth/1.2}}>
            {MAIN_URL+'/s/'+note?.public_slug}
            </Text>
            <View style={{marginTop:12,flexDirection:'row',alignItems:'center'}}>
            <Touchable activeOpacity={0.5} onPress={()=>onCopy(MAIN_URL+'/s/'+note?.public_slug)} style={{backgroundColor:Colors.darkWithOpacity(1),alignSelf:'flex-start',borderRadius:12,padding:12,paddingHorizontal:16}}>
              <View style={styles.row}>
            <SvgXml xml={CreateModalSvg.publishCopy} />
              <Text style={{color:Colors.whiteWithOpacity(1),fontFamily:'Primary-Semibold',fontSize:12,marginLeft:4}}>{'Copy link'}</Text>
              </View>
            </Touchable>
            <Touchable activeOpacity={0.5} onPress={onUnpublish} style={{backgroundColor:Colors.darkWithOpacity(0.05),alignSelf:'flex-start',borderRadius:12,padding:12,paddingHorizontal:16,marginLeft:12}}>
              <Text style={{color:Colors.darkWithOpacity(1),fontFamily:'Primary-Semibold',fontSize:12}}>Unpublish</Text>
            </Touchable>
            </View>
          </View>}
        </MenuItem>
        </Menu>
        :<PublishedModal slug={note?.public_slug} visible={shareVisible} isPublished={isPublished} onPressCancel={()=>setShareVisible(false)} onPressDone={onUnpublish} hideModal={()=>setShareVisible(false)} />}
      {note?.transcript==null&&note?.isUploading==undefined&&
      <TouchableHighlight onPress={onRetry} style={styles.retry} underlayColor={Colors.greyWithOpacity(0.3)}>
        <>
        <SvgXml xml={home.retryUpload} />
        <Text style={styles.retryTxt}>Retry</Text>
        </>
      </TouchableHighlight>}
        {!!token&&creationLoader&&<AiLoader text={`Creating ${createType} from your voice`} />}
        {!!token&&creationList?.map((itm:any,i:number)=>(
          <AiCreatedView id={itm?.id} type={itm?.type} date={itm?.created_at} content={itm?.content?.data} key={i}/>
        ))}
        </View>
      </View>
    </View>
  );
});

const Editor=(editNote:any,setEditNote=(v:object|null)=>{},onSaveEdit=()=>{},onCancelEdit=()=>{},tag='',setTag=(v:string)=>{})=>{
  return (
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
      {/* {editNote?.tags?.map((tag:any,indx:number)=>
      <Touchable key={indx} onPress={()=>setEditNote({...editNote,tags:editNote?.tags?.filter((_:any,i:number)=>i!=indx)})} style={styles.tagWrap}>
        <Text style={[styles.tag,{marginTop:0,marginRight:0}]}>{'#'+tag?.name}</Text>
      </Touchable>
      )} */}
      {/* <TextInput
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
          }} /> */}
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
)};

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
    // marginTop:25,
    // marginLeft:10
  },
  menuPress: {
    height: 25,
    width: 35,
    alignItems: "center",
    justifyContent: "center",
    marginLeft:4
  },
  menuItem: { paddingLeft:isIOS?20:0, borderRadius: 12, overflow: "hidden",width:'100%' },
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
  },
  retry:{paddingHorizontal:16,height:36,flexDirection:'row',alignItems:'center',backgroundColor:Colors.darkWithOpacity(0.05),alignSelf:'flex-start',marginTop:0,borderRadius:30},
  retryTxt:{marginLeft:2,fontFamily:'Primary',fontSize:12,color:'#222',marginTop:-2}
});
