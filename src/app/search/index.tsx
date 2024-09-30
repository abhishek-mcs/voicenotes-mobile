import { InteractionManager, Keyboard, Pressable, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableHighlight, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useEffect, useRef, useState } from "react"
import { commonSvg } from "assets/svg/commonSvg";
import Colors from "assets/Colors";
import { Text } from "react-native";
import { useDeleteSearchHistory, useSearch, useSearchHistory, useSetSearchHistory } from "queries/search";
import { useRouter } from "expo-router";
import CircularLoader from "components/common/loaders/circular-loader";
import Animated from "react-native-reanimated";
import { isIOS, screenWidth } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { setRelatedNoteId } from "redux/reducers/relatedNoteStates";
import { SearchBarIOS } from "@rneui/base/dist/SearchBar/SearchBar-ios";
import { RootState } from "redux/store/store";
import { ShowMoreTagsButton, TagButton } from "components/home/tag-buttons";
import Touchable from "components/common/Touchable";

const {debounce}=require("lodash")

export default ({setHide=(v:boolean)=>{}})=>{
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleTags, setVisibleTags] = useState(6);
    const router = useRouter()
    const ref=useRef<TextInput>(null)
    const {hashTags}=useSelector((state:RootState)=>state?.hash)

    const searchHistoryData=useSearchHistory()
    const setSearchHistory=useSetSearchHistory()
    const deleteSearchHistory=useDeleteSearchHistory()
    const getSearchData=useSearch(searchQuery);
    const dispatch=useDispatch()

    const searchData=getSearchData.data?.data||[]

    const [searchHistoryList, setSearchHistoryList] = useState(searchHistoryData.data?.data||[]);

    const debouncedSearch = debounce((q:string) => {
      setSearchQuery(q);
    }, 500); 

    const onSearch=(q:string)=>{
      setSearchText(q)
      debouncedSearch(q);
      q==''&&setSearchQuery('')
    }
    
    const clearSearch=()=>{
      setSearchText('')
      setSearchQuery('')
      setHide(true)
      Keyboard.dismiss()
    }

    const goto=(rec_id:any)=>{
      Keyboard.dismiss();
      setSearchHistory.mutate(rec_id)
      // router.push({pathname:"/RelatedNotes/",params:{id:rec_id}})
      dispatch(setRelatedNoteId(rec_id))
      router.back()
      clearSearch()
    }
    useEffect(()=>{
      InteractionManager.runAfterInteractions(() => {
        if (ref?.current) {
            ref.current?.focus()
        }
      })
      return ()=>Keyboard.dismiss()
      },[ref.current])
    
    const onDeleteSearchHistory=(id:number)=>{
      const temp=searchHistoryList?.filter((itm:any)=>itm?.id!=id)
      setSearchHistoryList(temp)
      deleteSearchHistory.mutate(id)
    }

    const filteredHashTags = hashTags.filter((tag) =>
      tag.toLowerCase().includes(searchText.toLowerCase())
    );

    const showMoreTags = () => {
      setVisibleTags(filteredHashTags.length);
    };

    const onClear = () =>{
      setSearchQuery("")
      setSearchText("")
      setSearchText("")
    }

    return (
        <SafeAreaView>
          <View style={{flexDirection:'row',marginTop:isIOS?10:50,alignItems:'center',marginBottom:4}}>
                <SearchBarIOS
                  onClear={onClear}
                  clearButtonMode="while-editing"
                  searchIcon={<SvgXml xml={commonSvg.search} />}
                  clearIcon={<View style={{width:0,height:0}}/>}
                  onCancel={()=>router.back()}
                  // onSubmitEditing={()=>onSearch(searchText)}
                  onFocus={()=>setIsFocused(true)}
                  onBlur={()=>setIsFocused(false)}
                  onChangeText={onSearch}
                  autoCapitalize={"none"}
                  autoFocus={true}
                  placeholder="Search"
                  placeholderTextColor={Colors.grey}
                  contextMenuHidden={true}
                  autoComplete="off"
                  autoCorrect={false}
                  value={searchText}
                  containerStyle={{backgroundColor:'transparent'}}
                  inputContainerStyle={{backgroundColor:Colors.darkWithOpacity(0.05),borderRadius:12,height:40}}
                />
          </View>
                  <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    style={{overflow:'hidden',paddingBottom:100}}
                    contentContainerStyle={{paddingBottom:100}}
                    keyboardShouldPersistTaps="handled">
                    {((getSearchData?.isFetched&&searchData.length==0)||searchText=='')&&
                    (searchText.length>0&&searchData?.length==0)&&
                    <Text style={[styles.recent,{paddingTop:12}]}>
                      {'No results found.'}
                    </Text>}
                    {filteredHashTags?.length>0&&
                    <View style={{paddingVertical:0}}>
                      <Text style={styles.recent}>Tags</Text>
                      <View style={{flexDirection:'row',flexWrap:'wrap',marginTop:8,rowGap:8,paddingHorizontal:20}}>
                      {filteredHashTags?.slice(0, visibleTags)?.map((itm:any,i:number)=><TagButton key={i} title={itm} onPress={()=>{router?.back()}}/>)}
                      {visibleTags < filteredHashTags.length && (
                        <ShowMoreTagsButton onPress={showMoreTags} />
                      )}
                      </View>
                    </View>}
                    {(searchText==''&&searchHistoryList?.length!=0)?
                    (<View style={{paddingVertical:12}}>
                      <Text style={styles.recent}>Recent</Text>
                      {searchHistoryList?.map((itm:any,i:number)=>
                      <TouchableHighlight 
                        onPress={(e)=>goto(itm?.recording_id)}
                        style={[styles.row,{paddingVertical:0,height:40}]} underlayColor={Colors.greyWithOpacity(0.1)} 
                        key={i}>
                          <View style={{flexDirection:'row',alignItems:'center',height:40,justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row',alignItems:'center',width:'85%'}}>
                              <SvgXml xml={commonSvg.playSearchIcon?.replace('{color}','#222')} />
                              <Text style={styles.recentText} numberOfLines={1}>{itm?.title}</Text>
                            </View>
                            <Pressable style={{height:40,width:'15%',justifyContent:'center',alignItems:'center'}} onPress={(e)=>{e?.stopPropagation();onDeleteSearchHistory(itm?.id)}}>
                              <SvgXml xml={commonSvg.smallClose} />
                            </Pressable>
                          </View>
                      </TouchableHighlight>)}
                    </View>)
                    :searchText.length>0&&searchData?.length>0?
                    <View>
                      <Text style={[styles.recent,{marginTop:12}]}>{searchData?.length>1?`${searchData?.length} Results`:'1 Result'}</Text>
                    {searchData.map((itm:any,i:number)=>
                    <TouchableHighlight onPress={()=>goto(itm?.recording_id)} style={styles.result} underlayColor={Colors.greyWithOpacity(0.1)} key={i}>
                      <View style={{overflow:'hidden'}}>
                      <View style={{flexDirection:'row',alignItems:'center'}}>
                        <View style={{backgroundColor:'#222',width:6,height:6,borderRadius:9}}/>
                        <Text style={styles.title}>{itm?.title}</Text>
                      </View>
                      <Text style={[styles.txt,{width:screenWidth-50}]} numberOfLines={1}>...{itm?.transcript?.trimEnd()?.replaceAll(/<br\/?>/g, '\n')}</Text></View>
                    </TouchableHighlight>)}
                    </View>
                  :((getSearchData.isFetched&&searchData?.length==0)||(searchText==''&&searchHistoryList?.length==0))?
                  null
                  :<View style={[styles.result,{alignItems:'center',marginTop:40}]}>
                    <CircularLoader/>
                  </View>}
                  </ScrollView>
          </SafeAreaView>
    )
}

const styles=StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        marginTop:0,
        marginHorizontal:0,
        marginBottom:0
    },
    box:{
        flex:5,
        flexDirection:'row',
        paddingLeft:17,
        paddingRight:16,
        marginLeft:16,
        height:40,
        borderRadius:12,
        alignItems:'center',
        // borderWidth:1,
        backgroundColor:Colors.darkWithOpacity(0.05),
    },
    // modal:{
    //   flex:1,
    //   width:'100%',
    //   height:200,
    //   backgroundColor:'#fff',
    //   position:'absolute',
    //   top:45,borderRadius:12,
    //   zIndex:100,
    //   shadowColor: "#00000026",
    //   shadowOpacity: 1,
    //   shadowOffset: { width: 0, height: 0.5 },
    //   shadowRadius: 1.5,
    //   elevation: 10,
    // },
    row:{
      flexDirection:'row',
      alignItems:'center',
      paddingVertical:8,
      paddingHorizontal:20
    },
    recent:{
      fontFamily:'Primary-Medium',
      color:Colors.grey,
      fontSize:12,
      paddingHorizontal:20
    },
    recentText:{
      fontFamily:'Primary',
      color:Colors.darkWithOpacity(1),
      fontSize:16,
      marginLeft:8,
      width:'86%'
    },
    title:{fontFamily:'Primary-Semibold',fontSize:16,color:'#222',marginLeft:8},
    txt:{fontFamily:'Primary',fontSize:14,color:'#222',marginTop:4},
    result:{paddingHorizontal:20,paddingVertical:16},
    noData:{
      fontFamily:'Primary-Semibold',
      color:"#222",
      fontSize:16,
      textAlign:'center',
      marginTop:40,marginHorizontal:20
    },
    skeleton:{marginBottom:12,height:20,opacity:0.3}
})