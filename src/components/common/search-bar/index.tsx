import { Keyboard, Pressable, ScrollView, StyleSheet, TextInput, TouchableHighlight, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useRef, useState } from "react"
import { commonSvg } from "assets/svg/commonSvg";
import Colors from "assets/Colors";
import { Text } from "react-native";
import { useDeleteSearchHistory, useSearch, useSearchHistory, useSetSearchHistory } from "queries/search";
import { Skeleton } from "@rneui/themed";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable"
import CircularLoader from "../loaders/circular-loader";
import { isIOS } from "utils/common";
const {debounce}=require("lodash")

const AnimSVG = Animatable.createAnimatableComponent(SvgXml);
const heightIn = {
  from: {
    height: 0,
    borderColor:Colors.darkWithOpacity(0)
  },
  to: {
    height: 40,
    borderColor:Colors.darkWithOpacity(0.1)
  },
};
const heightOut = {
  from: {
    height: 40,
    borderColor:Colors.darkWithOpacity(0.1)
  },
  to: {
    height: 0,
    borderColor:Colors.darkWithOpacity(0)
  },
};
const fadeIn={
  from:{opacity:0},to:{opacity:1}
}
const fadeOut={
  from:{opacity:1},to:{opacity:0}
}

export default ({hideView=true,setHide=(v:boolean)=>{},isSearchVisible=false,style={}})=>{
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
      setSearchHistory.mutate(searchText)
      router.push({pathname:"/RelatedNotes/",params:{id}})
      clearSearch()
    }

    return (
        <View style={[styles.container,style]}>
            <Animatable.View duration={150} animation={isSearchVisible?heightIn:heightOut} style={[styles.box,isFocused?{borderColor:'#222'}:{borderColor:Colors.darkWithOpacity(0.1)}]}>
              <SvgXml xml={commonSvg.search} style={[{paddingHorizontal:8}]} />
              <View style={{flex:1}}>
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
              {searchText != "" ? (
                <Pressable
                  onPress={() => {
                    setSearchQuery("")
                    setSearchText("")
                  }}
                >
                  <AnimSVG xml={commonSvg.searchClose} duration={150} animation={isSearchVisible?"fadeIn":"fadeOut"}/>
                </Pressable>
              ) : null}
            </Animatable.View>
            {((searchHistoryList?.length>0||searchText.length>0)&&!hideView)&&
              <View style={styles.modal}>
                  <ScrollView showsVerticalScrollIndicator={false} style={{overflow:'hidden'}}>
                    {(searchText==''&&searchHistoryList?.length!=0)?
                    (<View style={{paddingVertical:12}}>
                      <Text style={styles.recent}>Recent searches</Text>
                      {searchHistoryList?.map((itm:any,i:number)=>
                      <TouchableHighlight 
                        onPress={(e)=>{setSearchText(itm?.keyword);setSearchQuery(itm?.keyword);}}
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
                    :getSearchData?.isLoading?
                    <View style={[styles.result,{alignItems:'center',marginTop:30}]}>
                      <CircularLoader/>
                    </View>
                    :<Text style={styles.noData}>No data found</Text>}
                  </ScrollView>
            </View>}
          </View>
    )
}

const styles=StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        marginTop:0,
        marginHorizontal:0,
        marginBottom:0,zIndex:1
    },
    box:{
        flex:1,
        flexDirection:'row',
        paddingLeft:17,
        paddingRight:16,
        height:40,
        borderRadius:12,
        alignItems:'center',
        borderWidth:1,
        borderColor:Colors.darkWithOpacity(0.1),
        zIndex:10
    },
    modal:{
      flex:1,
      width:'100%',
      height:200,
      backgroundColor:'#fff',
      position:'absolute',
      top:45,borderRadius:12,
      zIndex:10,
      shadowColor: isIOS?"#00000026":'rgba(0, 0, 0, 0.6)',
      shadowOpacity: 1,
      shadowOffset: { width: 0, height: 0.5 },
      shadowRadius: 1.5,
      elevation: 10,
    },
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