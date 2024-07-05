import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { SafeAreaView, Text, TouchableHighlight, View,Alert, StyleSheet, ScrollView, KeyboardAvoidingView } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { useCallback, useRef, useState } from "react";
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
import { useSaveEditedNote, useToggleStar } from "queries/home";
import { commonSvg } from "assets/svg/commonSvg";

export default () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {tagsArray,recording_id}:any=params;
    const saveTags=useSaveEditedNote(recording_id)
    const [isFocused,setIsFocused]=useState(false)
    const [search,setSearch]=useState('')
    const toggleStarred=useToggleStar(recording_id)
    const queryClient=useQueryClient()
    const tagsQuery:any=queryClient.getQueryData('all-tags')||[]
    let tagsList=useRef((tagsQuery?.data||[]).filter((f:any)=>f?.name!="starred"));
    const [tags,setTags]=useState([{name:'starred'},...tagsList.current]||[])
    const [addedTags,setAddedTags]:any=useState(JSON.parse(tagsArray)||[])
    
    const onSearch=useCallback((q:string)=>{
      setSearch(q);
      if(tags?.length>0)
        if(q=='')
          setTags([{name:'starred'},...tagsList.current]||[])
        else{
          const temp=tagsList.current?.filter((f:any)=>f?.name?.toLowerCase().includes(q.toLowerCase()))||[]
          setTags(temp)
        }
    },[tagsList.current])

    const onAddTag=(name:string,addNew=false)=>{
      let temp=addedTags
      temp=temp.includes(name)?temp?.filter((f:any)=>f!=name):[...temp,name]
      setAddedTags([...temp])
      if(addNew){
        setTags([{name},...tags])
        tagsList.current=[{name},...tags]
      }
    }

    const onDone=async()=>{
      await saveTags.mutateAsync({tags:addedTags},{
        onSuccess:()=>{
          queryClient.invalidateQueries('all-recording')
          queryClient.invalidateQueries('all-tags')
      }})
      router.back()
    }
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
          <KeyboardAvoidingView behavior="padding">
          {isIOS&&<View style={{height:5,width:36,alignSelf:'center',backgroundColor:'rgba(60, 60, 67, 0.3)',borderRadius:20,marginTop:8}}/>}
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:16,marginHorizontal:12}}>
            <Touchable onPress={()=>router.back()} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary',fontSize:16,color:Colors.grey}}>Cancel</Text>
            </Touchable>
            <Touchable onPress={onDone} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary-Semibold',fontSize:16,color:'#007AFF'}}>Done</Text>
            </Touchable>
          </View>
          <View style={{marginHorizontal:24}}>
            <TextInput
              onFocus={() => {setIsFocused(true);}}
              onBlur={() => setIsFocused(false)}
              textAlignVertical="center"
              value={search}
              autoFocus={false}
              onChangeText={onSearch}
              placeholder={"Add tags"}
              placeholderTextColor={'#717171'}
              style={[{color:'#222',fontFamily:'Primary',fontSize:14,paddingHorizontal:16,paddingVertical:12,borderRadius:8,backgroundColor:Colors.darkWithOpacity(0.05)}]}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              autoComplete="off"/>
          </View>
          {search!=''&&<Btn title={'+Add '+search} onPress={()=>onAddTag(search,true)} isAdded={false} style={{marginTop:8, marginHorizontal:8}}/>}
          {tags.length>0&&
          <Text style={{fontFamily:'Primary',color:Colors.grey,fontSize:12,marginBottom:4,marginTop:12,marginHorizontal:24}}>Suggested</Text>}
          <FlatList
            data={tags}
            style={{}}
            contentContainerStyle={{margin:8,paddingBottom:200}}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({item,index})=>{
              const isAdded=addedTags?.includes(item?.name)
              return (
                <Btn title={item?.name} isAdded={isAdded} style={{marginTop:2}} onPress={onAddTag}/>
            )}}
          />
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
}



const Btn=({onPress=(v:any)=>{},title,isAdded,style={}}:any)=>(
  <TouchableHighlight onPress={() => onPress(title)} style={[{ padding: 6, marginBottom: 1, paddingHorizontal: 16, backgroundColor: isAdded ? 'rgba(35,84,159,0.1)' : 'transparent', borderRadius: 8 }, { ...style }]} underlayColor={'rgba(35,84,159,0.2)'}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SvgXml xml={(title === 'starred'?commonSvg.tagStarred:commonSvg.tagHash)?.replaceAll('{color}',isAdded?'rgba(35,84,159,1)' : '#0D0D0D')} style={{ marginRight: 3 }}/>
          <Text style={{ fontFamily: 'Primary-Medium', fontSize: 16, color: (isAdded || title?.includes('+Add')) ? 'rgba(35,84,159,1)' : '#0D0D0D' }}>{title === 'starred'?'Starred':title} </Text>
      </View>
      {isAdded&&<SvgXml xml={commonSvg.smallClose} />}
    </View>
  </TouchableHighlight>
);

const styles=StyleSheet.create({
  rightTxt:{
    fontFamily:'Primary-Medium',
    fontSize:14,
    color:Colors.grey,
    width:ScreenWidth/2,
    textAlign:'right'
  }
})