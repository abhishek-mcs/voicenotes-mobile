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
import { SearchBar } from "react-native-screens";
import { SearchBarIOS } from "@rneui/base/dist/SearchBar/SearchBar-ios";
const {debounce}=require("lodash")

const AnimSVG = Animatable.createAnimatableComponent(SvgXml);
const AnimSearchBarIOS = Animatable.createAnimatableComponent(SearchBarIOS);
export const heightIn = {
  from: {
    height: 0,
    borderColor:Colors.darkWithOpacity(0),
    opacity:0
  },
  to: {
    height: 40,
    borderColor:Colors.darkWithOpacity(0.1),
    opacity:1
  },
};
export const heightOut = {
  from: {
    height: 40,
    borderColor:Colors.darkWithOpacity(0.1),
    opacity:1
  },
  to: {
    height: 0,
    borderColor:Colors.darkWithOpacity(0),
    opacity:0
  },
};
const fadeIn={
  from:{opacity:0},to:{opacity:1}
}
const fadeOut={
  from:{opacity:1},to:{opacity:0}
}

export default ({hideView=true,setHide=(v:boolean)=>{},isSearchVisible=false,style={},scrollY}:any)=>{
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter()
    const ref=useRef<TextInput>(null)

    // const searchHistoryData=useSearchHistory()
    // const setSearchHistory=useSetSearchHistory()
    // const deleteSearchHistory=useDeleteSearchHistory()
    // const getSearchData=useSearch(searchQuery);

    // const searchHistoryList=searchHistoryData.data?.data||[]
    // const searchData=getSearchData.data?.data||[]

    // const debouncedSearch = debounce((q:string) => {
    //   setSearchQuery(q);
    // }, 500); 

    const onSearch=(q:string)=>{
    //   setSearchText(q)
    //   debouncedSearch(q);
    //   q==''&&setSearchQuery('')
    }
    
    // const clearSearch=()=>{
    //   setSearchText('')
    //   setSearchQuery('')
    //   setHide(true)
    //   Keyboard.dismiss()
    // }

    // const goto=(id:number)=>{
    //   setSearchHistory.mutate(searchText)
    //   router.push({pathname:"/RelatedNotes/",params:{id}})
    //   clearSearch()
    // }
    
    const searchBarOpacity = scrollY.interpolate({
      inputRange: [0, 1],
      outputRange: [1,0],
      extrapolate: 'clamp',
    });
    return (
        <Animatable.View style={[styles.container,style]} duration={150} animation={isSearchVisible?heightIn:heightOut}>
            
            <AnimSearchBarIOS
                  onClear={()=>{
                    setSearchQuery("")
                    setSearchText("")
                    setSearchText("")
                  }}
                  clearIcon={<SvgXml xml={commonSvg.smallClose} />}
                  searchIcon={<SvgXml xml={commonSvg.search}/>}
                  onCancel={()=>router.back()}
                  // onSubmitEditing={()=>onSearch(searchText)}
                  onFocus={()=>setIsFocused(true)}
                  onBlur={()=>setIsFocused(false)}
                  onChangeText={onSearch}
                  autoCapitalize={"none"}
                  autoFocus={false}
                  placeholder="Search"
                  placeholderTextColor={Colors.grey6}
                  contextMenuHidden={true}
                  autoComplete="off"
                  autoCorrect={true}
                  value={searchText}
                  disabledInputStyle={{opacity:1}}
                  disabled={true}
                  containerStyle={styles.inputContainerStyle}
                  showCancel={false}
                  inputContainerStyle={[{opacity:searchBarOpacity,backgroundColor:'transparent'}]}
                />
          </Animatable.View>
    )
}

const styles=StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        marginTop:0,
        marginHorizontal:4,
        marginBottom:0,zIndex:1
    },
    inputContainerStyle:{
      backgroundColor:Colors.darkWithOpacity(0.05),
      borderRadius:12,
      height:40
    },
    box:{
        flex:1,
        flexDirection:'row',
        paddingLeft:17,
        paddingRight:16,
        height:40,
        borderRadius:12,
        alignItems:'center',
        // borderWidth:1,
        backgroundColor:Colors.darkWithOpacity(0.05),
        zIndex:10
    },
    modal:{
      flex:1,
      width:'100%',
      height:200,
      backgroundColor:Colors.whiteWithOpacity(1),
      position:'absolute',
      top:45,borderRadius:12,
      zIndex:100,
      shadowColor: Colors.blackWithOpacity(0.15),
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
    title:{fontFamily:'Primary-Semibold',fontSize:16,color:Colors.darkWithOpacity(1),marginLeft:8},
    txt:{fontFamily:'Primary',fontSize:14,color:Colors.darkWithOpacity(1),marginTop:4},
    result:{paddingHorizontal:20,paddingVertical:16},
    noData:{
      fontFamily:'Primary-Semibold',
      color:Colors.darkWithOpacity(1),
      fontSize:16,
      textAlign:'center',
      marginTop:40,marginHorizontal:20
    },
    skeleton:{marginBottom:12,height:20,opacity:0.3}
})