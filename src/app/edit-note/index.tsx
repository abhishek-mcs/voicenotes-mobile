import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { SafeAreaView, Text, TouchableHighlight, View,Alert, StyleSheet, ScrollView, KeyboardAvoidingView, InteractionManager } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { useCallback, useEffect, useRef, useState } from "react";
import {languages} from "utils/constants/languages";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { useSaveSettings } from "queries/settings";
import { isIOS } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setLang } from "redux/reducers/userDetails";
import { TextInput } from "react-native";
import { useQueryClient } from "react-query";
import { FlatList } from "react-native";
import { useSaveEditedNote } from "queries/home";
import { commonSvg } from "assets/svg/commonSvg";
import { setRecordingList, updateTitle,updateTranscript } from "redux/reducers/recordingStates";
import CircularLoader from "components/common/loaders/circular-loader";
import ThreeDotLoader from "components/common/loaders/three-dot-loader";

export default () => {
    const router = useRouter();
    const params:any = useLocalSearchParams();
    const {recordingList} = useSelector((state:RootState)=>state.recordingStates)
    const [editNote,setEditNote] = useState<any>(recordingList[params?.index])
    const dispatch=useDispatch();
    const saveEditedNote=useSaveEditedNote(editNote?.id)
    const queryClient=useQueryClient();
    const [isLoading,setIsLoading]=useState(false)
    const textRef=useRef<any>(null)
    
  const onSaveEdit=async()=>{
    if(editNote?.transcript?.length===0||editNote?.title?.length===0){
      return Alert.alert('','Title and Transcript cannot be empty')
    }
    setIsLoading(true)
    const tags=editNote?.tags?.flatMap((tag:any)=>tag?.name)
    const temp={...editNote};
    await saveEditedNote.mutateAsync(
      {title:editNote?.title,transcript:editNote?.transcript,tags:tags||[]},{
        onSuccess:(e:any)=>{
          dispatch(updateTitle({index:params?.index,title:editNote?.title}))
          dispatch(updateTranscript({index:params?.index,transcript:editNote?.transcript}))
          queryClient.invalidateQueries('all-recording')
          setIsLoading(false)
        },
        onError:(e:any)=>{
          setEditNote(temp)
          setIsLoading(false)
        }
      })
    router?.back()
  }
  const onCancelEdit=()=> {
    router?.back()
  }

  useEffect(()=>{
    InteractionManager.runAfterInteractions(()=>{
      textRef.current&&textRef.current?.focus()
    })
  },[])

    return (
        <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
          <KeyboardAvoidingView behavior="padding">
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:isIOS?0:16,marginHorizontal:12}}>
            <Touchable onPress={onCancelEdit} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary',fontSize:16,color:Colors.grey}}>Cancel</Text>
            </Touchable>
            {isLoading?
            <View style={{alignSelf:'flex-end'}} >
             <ThreeDotLoader/>
            </View>
            :<Touchable onPress={onSaveEdit} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary-Semibold',fontSize:16,color:'#007AFF'}}>Save</Text>
            </Touchable>}
          </View>
          <View style={styles.editContainer}>
    <TextInput 
      style={styles.titleInput}
      autoComplete="off"
      autoCorrect={false}
      selectTextOnFocus={false}
      value={editNote.title}
      onChangeText={txt=>setEditNote((n:any)=>{return {...n,title:txt}})} />
    <TextInput
      ref={textRef}
      style={styles.textInput}
      multiline
      autoComplete="off"
      autoCorrect={false}
      selectTextOnFocus={false}
      value={editNote.transcript} 
      onChangeText={txt=>setEditNote((n:any)=>{return {...n,transcript:txt}})} />
  </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles=StyleSheet.create({
  editContainer:{
    marginTop: 6,
    marginHorizontal:12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  titleInput: {
    paddingHorizontal: 12,
    fontFamily: "Primary-Medium",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "500",
    color:Colors.darkWithOpacity(1),
  },
  textInput: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom:10,
    minHeight: 100,
    fontFamily: "Primary",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
    textAlignVertical: "top",
    textAlign:'left',
    color:Colors.darkWithOpacity(0.9)
  },
})