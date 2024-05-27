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
import { isIOS } from "utils/common";

const {debounce}=require("lodash")

export default ({setHide=(v:boolean)=>{}})=>{
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter()
    const ref=useRef<TextInput>(null)

    const searchHistoryData=useSearchHistory()
    const setSearchHistory=useSetSearchHistory()
    const deleteSearchHistory=useDeleteSearchHistory()
    const getSearchData=useSearch(searchQuery);

    const searchHistoryList=searchHistoryData.data?.data||[]
    const searchData=getSearchData.data?.data||[]

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

    const goto=(id:number)=>{
      Keyboard.dismiss();
      setSearchHistory.mutate(searchText)
      router.push({pathname:"/RelatedNotes/",params:{id}})
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

    return (
        <SafeAreaView>
          <View style={{flexDirection:'row',marginTop:isIOS?10:50,alignItems:'center',marginBottom:4}}>
            <Animated.View style={[styles.box]} sharedTransitionTag="sharedTag">
              <SvgXml xml={commonSvg.search} style={[{paddingHorizontal:8}]} />
              <View style={{flex:1}} >
                <TextInput
                  onFocus={() => {setIsFocused(true);}}
                  onBlur={() => setIsFocused(false)}
                  textAlignVertical="center"
                  value={searchText}
                  returnKeyType={"search"}
                  autoFocus={false}
                  onChangeText={onSearch}
                  placeholder={"Search"}
                  placeholderTextColor={'#828282'}
                  style={[{color:'#222',fontFamily:'Primary',fontSize:16,marginLeft:8}]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  ref={ref}
                />
              </View>
              {searchText.length>0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("")
                    setSearchText("")
                  }}
                  style={{marginLeft:8}}
                >
                  <SvgXml xml={commonSvg.searchClose}/>
                </Pressable>
              )}
            </Animated.View>
            <Text onPress={()=>router.back()} suppressHighlighting={true} style={{color:'#155CE5',fontFamily:'Primary',fontSize:14,padding:10}}>Cancel</Text>
          </View>
                  <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    style={{overflow:'hidden'}} 
                    keyboardShouldPersistTaps="handled">
                    {(searchText==''&&searchHistoryList?.length!=0)?
                    (<View style={{paddingVertical:12}}>
                      <Text style={styles.recent}>Recent searches</Text>
                      {searchHistoryList?.map((itm:any,i:number)=>
                      <TouchableHighlight 
                        onPress={(e)=>{setSearchText(itm?.keyword);setSearchQuery(itm?.keyword);Keyboard.dismiss();}}
                        style={[styles.row]} underlayColor={Colors.greyWithOpacity(0.1)} 
                        key={i}>
                          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <>
                              <SvgXml xml={commonSvg.search?.replace('{color}','#222')} />
                              <Text style={styles.recentText} numberOfLines={1}>{itm?.keyword}</Text>
                            </>
                            <Pressable onPress={()=>deleteSearchHistory.mutate(itm?.id)}>
                              <SvgXml xml={commonSvg.smallClose} />
                            </Pressable>
                          </View>
                      </TouchableHighlight>)}
                    </View>)
                    :searchText.length>0&&searchData?.length>0?
                    searchData.map((itm:any,i:number)=>
                    <TouchableHighlight onPress={()=>goto(itm?.id)} style={styles.result} underlayColor={Colors.greyWithOpacity(0.1)} key={i}>
                      <View style={{overflow:'hidden'}}>
                      <View style={{flexDirection:'row',alignItems:'center'}}>
                        <View style={{backgroundColor:'#222',width:6,height:6,borderRadius:9}}/>
                        <Text style={styles.title}>{itm?.title}</Text>
                      </View>
                      <Text style={styles.txt}>...{itm?.transcript?.trimEnd()}</Text></View>
                    </TouchableHighlight>)
                    :getSearchData.isFetched&&searchData?.length==0?
                    <Text style={styles.noData}>No data found</Text>
                  :
                  <View style={[styles.result,{alignItems:'center',marginTop:40}]}>
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
      fontFamily:'Primary',
      color:Colors.grey,
      fontSize:16,
      marginBottom:8,
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