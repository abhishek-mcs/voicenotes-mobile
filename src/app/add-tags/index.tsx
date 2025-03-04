import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableHighlight, View,Alert, StyleSheet, ScrollView, KeyboardAvoidingView } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { useCallback, useRef, useState } from "react";
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
import { useTheme } from "context";

const AddTags = () => {
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
    const [tags,setTags]=useState([{name:'starred'},...tagsList.current])
    const [addedTags,setAddedTags]:any=useState(JSON.parse(tagsArray)||[])
    const {Colors} = useTheme()
    
    const onSearch=useCallback((s:string)=>{
      const q = s?.replace(/-/g, '')?.replace(/\//g, '');
      const list = tagsList.current;
      setSearch(q);
      if(tags?.length>0)
        if(q=='') {
          setTags([{name:'starred'},...list])
        }
        else{
          const temp = list?.filter((f:any)=>f?.name?.toLowerCase().includes(q?.toLowerCase()))||[]
          setTags(temp)
        }
    },[tagsList.current])

    const onAddTag=(name:string,addNew=false)=>{
      let temp=addedTags
      temp=temp.includes(name)?temp?.filter((f:any)=>f!=name):[...temp,name]
      setAddedTags([...temp])
      if(addNew){
        setSearch('')
        const isDuplicate = tags.some((tag: any) => tag.name === name);
        const currentTags = tagsList.current || []
        if(!isDuplicate){
          setTags([{name:'starred'}, {name}, ...currentTags])
          tagsList.current=[{name}, ...currentTags]
        }else{
          setTags([{name:'starred'}, ...currentTags])
          tagsList.current=[...currentTags]
        }
      } else {
        setSearch('')
        const currentTags = tagsList.current || []
        setTags([{name:'starred'}, ...currentTags])
      }
    }
    
    const onDone=async()=>{
      await saveTags.mutateAsync({tags:addedTags},{
        onSuccess:()=>{
          queryClient.invalidateQueries('all-recording')
          queryClient.invalidateQueries('all-tags')
          queryClient.invalidateQueries("single-recording");
      }})
      router.back()
    }
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor:Colors.bgColor8}}>
          <KeyboardAvoidingView behavior="padding">
          {isIOS&&<View style={{height:5,width:36,alignSelf:'center',backgroundColor:Colors.dragBar,borderRadius:20,marginTop:8}}/>}
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop: isIOS?16: 28,marginHorizontal:12}}>
            <Touchable onPress={()=>router.back()} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary',fontSize:16,color:Colors.grey}}>Cancel</Text>
            </Touchable>
            <Touchable onPress={onDone} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
              <Text style={{fontFamily:'Primary-Semibold',fontSize:16,color:Colors.blue}}>Done</Text>
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
              placeholderTextColor={Colors.grey3}
              style={[{color:Colors.text5,fontFamily:'Primary',fontSize:14,paddingHorizontal:16,paddingVertical:12,borderRadius:8,backgroundColor:Colors.inputBg2}]}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              autoComplete="off"/>
          </View>
          {search!=''&&<Btn Colors={Colors} title={'+Add '+search} onPress={()=>onAddTag(search,true)} isAdded={false} style={{marginTop:8, marginHorizontal:8}}/>}
          {tags.length>0&&
          <Text style={{fontFamily:'Primary',color:Colors.grey,fontSize:12,marginBottom:4,marginTop:12,marginHorizontal:24}}>Suggested</Text>}
          <TagsListComponent
            tags={tags?.filter(t=>!addedTags?.includes(t?.name))}
            Colors={Colors}
            onAddTag={onAddTag}
            Header={()=>(
              <TagsListComponent
              tags={addedTags}
              scrollEnabled={true}
              isAdded={true}
              Colors={Colors}
              onAddTag={onAddTag}
              />
            )}
          />
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
}



const Btn=({onPress=(v:any)=>{},title,isAdded,style={},Colors}:any)=>(
  <TouchableHighlight onPress={() => onPress(title)} style={[{ padding: 6, marginBottom: 1, paddingHorizontal: 16, backgroundColor: isAdded ? Colors.lightBlueWithOpacity(0.1) : 'transparent', borderRadius: 8 }, { ...style }]} underlayColor={Colors.lightBlueWithOpacity(0.2)}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!title?.includes('+Add')&&<SvgXml xml={(title === 'starred'?commonSvg.tagStarred:commonSvg.tagHash)?.replaceAll('{color}',isAdded?Colors.lightBlue : Colors.black2)} style={{ marginRight: 3 }}/>}
          <Text style={{ fontFamily: 'Primary-Medium', fontSize: 16, color: (isAdded || title?.includes('+Add')) ? Colors.lightBlue : Colors.black2 }}>{title === 'starred'?'Starred':title} </Text>
      </View>
      {isAdded&&<SvgXml xml={commonSvg.smallClose?.replaceAll(Colors.grey3,Colors.grey3)} />}
    </View>
  </TouchableHighlight>
);

const TagsListComponent: React.FC<TagsListComponentProps> = ({tags=[],Header=null,isAdded=false,Colors={},onAddTag=(v:any,x:any)=>{},scrollEnabled=true}) =>(<FlatList
  data={tags}
  style={{}}
  scrollEnabled={scrollEnabled}
  ListHeaderComponent={Header}
  contentContainerStyle={{margin:8,paddingBottom:200}}
  keyExtractor={(item, index) => index.toString()}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="always"
  keyboardDismissMode="on-drag"
  automaticallyAdjustKeyboardInsets
  renderItem={({item,index}:any)=>{
    return (
      <Btn Colors={Colors} title={item?.name??item} isAdded={isAdded} style={{marginTop:2}} onPress={onAddTag}/>
  )}}
/>)

const styles=StyleSheet.create({
  rightTxt:{
    fontFamily:'Primary-Medium',
    fontSize:14,
    // color:Colors.grey,
    width:ScreenWidth/2,
    textAlign:'right'
  }
})

interface Tag {
  id: string; // or whatever type your tag ID is
  name: string; // or whatever type your tag name is
}

interface TagsListComponentProps {
  tags: Tag[];
  Header?: () => React.ReactNode;
  isAdded?: boolean;
  Colors?: any; // Adjust based on your color structure
  onAddTag?: (value: any, extra: any) => void;
  scrollEnabled?: boolean;
}

export default AddTags;