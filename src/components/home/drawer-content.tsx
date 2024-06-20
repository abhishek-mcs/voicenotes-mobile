import Colors from "assets/Colors";
import { drawerSvg } from "assets/svg/drawerSvg";
import Touchable from "components/common/Touchable";
import { useGetTags, useGetUserData } from "queries/home";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { setHashTags,setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { useRouter } from "expo-router";
import { isIOS, screenHeight } from "utils/common";
import { useLogout } from "queries/auth";
import { commonSvg } from "assets/svg/commonSvg";
import { setCanRecord, setLang, setUserDetail } from "redux/reducers/userDetails";
import { languages } from "utils/constants/languages";
import { iapSvg } from "assets/svg/iapSvg";

export default (props:any) => {
  const {hashTags,hashFilter} = useSelector((state: RootState) => state.hash);
  const {isIAPPurchased,isTempIAPPurchased} = useSelector((state: RootState) => state.IAPStates);
  const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentTag, setCurrentTag] = useState<string>(hashFilter);
  const [showMenu,setShowMenu]=useState(false)

  const getTags=useGetTags()
  const logout=useLogout()
  const data=useGetUserData(token);
  const photo_url=data?.data?.data?.photo_url||null;

  useEffect(() => {
    if(data?.data?.data){
      dispatch(setUserDetail(data?.data?.data))
      data?.data?.data?.settings?.language&& dispatch(setLang(languages[data?.data?.data?.settings?.language]))
      dispatch(setCanRecord(data?.data?.data?.can_record_more??true))
    }
  }, [data?.data?.data]);

  useEffect(() => {
    if(getTags?.data?.data&&Array.isArray(getTags?.data?.data)){
      const tags=(getTags?.data?.data?.flatMap((t:any)=>t?.name)??[])
      .filter((name: string) => name !== 'starred') ?? [];;
      dispatch(setHashTags(tags))
    }
  }, [getTags?.data?.data]);

  const handleTagPress = (tag: string) => {
    dispatch(setTagsFilter(tag))
    setCurrentTag(tag)
    router.back()
  };

  const openSettings=()=>{
    router?.push('/settings/')
  }

  const onUpgrade=()=>{
    router?.push('/premium/')
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{marginBottom:20}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "flex-start" }}
        data={['All','shared','starred',...hashTags]}
        renderItem={({ item }) =><Btn item={item} hashFilter={hashFilter} onPress={()=>handleTagPress(item)}/>}
        keyExtractor={(item, index) => index.toString()}
      />
      {(userDetails?.subscription_status||isTempIAPPurchased)?
      null
      :<TouchableHighlight onPress={onUpgrade} style={styles.upgrade} underlayColor={Colors.primaryWithOpacity(0.1)}>
        <>
        <SvgXml xml={iapSvg.upgrade} />
        <View>
          <Text style={styles.upgradeTitle}>Upgrade for a lifetime</Text>
          <Text style={styles.upgradeText}>Record longer, GPT-4o and more</Text>
        </View>
        </>
      </TouchableHighlight>}
     {!!token&& 
     <Touchable onPress={openSettings} style={[styles.row,styles.btn,{justifyContent:'space-between',paddingLeft:6,paddingRight:4,marginLeft:-6,height:40}]} activeOpacity={0.6}>
        <><View style={styles.row}>
      {photo_url?
              <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:8}}/>
              :<SvgXml xml={commonSvg.profileIcon}/>}
              <View style={{flexDirection:'row',alignItems:'center',maxWidth:'75%'}}>
                <Text style={{fontFamily:'Primary-Semibold',fontSize:14,marginLeft:8,color:'#0d0d0d',maxWidth:'100%'}} numberOfLines={1}>{data?.data?.data?.name}</Text>
                {(userDetails?.subscription_status||isTempIAPPurchased)&&<SvgXml xml={commonSvg.premiumTick} style={{marginLeft:4}}/>}
              </View>
              </View>
            <View style={styles.menuPress} >
              <SvgXml xml={drawerSvg.more} />
            </View>
        </>
        </Touchable>}
    </SafeAreaView>
  );
};

const Btn=({item,hashFilter,onPress}:any)=>{
  return (
    <TouchableHighlight onPress={onPress} style={[styles.btn,{
      backgroundColor: item==hashFilter?Colors.darkWithOpacity(0.1):'transparent'}]} underlayColor={Colors.darkWithOpacity(0.1)}>
      <><SvgXml xml={
        item=='All'?
        drawerSvg.home?.replace(/{color}/g,item==hashFilter?Colors.darkWithOpacity(1):Colors.grey)
        :item=='starred'?
        drawerSvg.star?.replace(/{color}/g,item==hashFilter?Colors.darkWithOpacity(1):Colors.grey)
        :item=='shared'?
        drawerSvg.share?.replace(/{color}/g,item==hashFilter?Colors.darkWithOpacity(1):Colors.grey)
        :drawerSvg.hash?.replace(/{color}/g,item==hashFilter?Colors.darkWithOpacity(1):Colors.grey)
      } />
      <Text
        style={[
          styles.btnTxt,
          { color: item==hashFilter ? Colors.darkWithOpacity(1) : Colors.grey },
        ]}
      >{item}</Text></>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:isIOS?0:20,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  drawerButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  btn: {
    paddingHorizontal: 13,
    height: 30,
    borderRadius: 8,
    marginBottom: 4,
    width: "100%",alignItems:'center',
    flexDirection:'row',
  },
  btnTxt: { fontFamily: "Primary", fontSize: 14, lineHeight: 24 ,marginLeft:8,flex:1},
  row:{flexDirection:'row',alignItems:'center'},
  menu: {
    borderRadius: 12,
    marginTop:-60,
    width:'40%',
    marginLeft:-120
  },
  menuPress: {
    alignItems:'center',
    justifyContent: "center",width:40,height:40,borderRadius:8,
    marginRight:-12,overflow:'hidden'
  },
  menuItem: { paddingHorizontal: isIOS? 16:8, borderRadius: 12, overflow: "hidden", },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 0,
  },
  upgrade:{flexDirection:'row',alignItems:'center',padding:12,borderRadius:8,marginVertical:20,backgroundColor:Colors.primaryWithOpacity(0.05),overflow:'hidden'},
  upgradeTitle:{fontFamily:'Primary-Semibold',fontSize:14,marginLeft:8,color:'#222',width:screenHeight>690?'76%':'74%'},
  upgradeText:{fontFamily:'Primary',fontSize:12,marginLeft:8,color:'#222',marginTop:4,width:screenHeight>690?'76%':'74%'}
});
