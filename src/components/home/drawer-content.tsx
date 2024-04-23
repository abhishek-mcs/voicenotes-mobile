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
import { isIOS } from "utils/common";
import { useLogout } from "queries/auth";
import { commonSvg } from "assets/svg/commonSvg";
import { setLang, setUserDetail } from "redux/reducers/userDetails";
import { languages } from "utils/constants/languages";

export default (props:any) => {
  const {hashTags,hashFilter} = useSelector((state: RootState) => state.hash);
  const {token} = useSelector((state: RootState) => state.userDetails);
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
    }
  }, [data?.data?.data]);

  useEffect(() => {
    const tags=getTags?.data?.data?.flatMap((t:any)=>t?.name)||[];
    dispatch(setHashTags(tags))
  }, [getTags?.data]);

  const handleTagPress = (tag: string) => {
    dispatch(setTagsFilter(tag))
    setCurrentTag(tag)
    router.back()
  };

  const openSettings=()=>{
    // router.back();
    // setTimeout(() => {
    router?.push('/settings/')
    // }, 500);
  }
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{ alignItems: "flex-start" }}
        data={['All',...hashTags]}
        renderItem={({ item, index }) => (
          <TouchableHighlight onPress={() => handleTagPress(item)} style={[styles.btn,{
            backgroundColor: item==currentTag?Colors.darkWithOpacity(0.1):'transparent'}]} underlayColor={Colors.darkWithOpacity(0.1)}>
            <><SvgXml xml={
              item=='All'?
              drawerSvg.home?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):'#717171')
              :item=='starred'?
              drawerSvg.star?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):'#717171')
              :drawerSvg.hash?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):Colors.grey)
            } />
            <Text
              style={[
                styles.btnTxt,
                { color: item==currentTag ? Colors.darkWithOpacity(1) : Colors.grey },
              ]}
            >{item}</Text></>
          </TouchableHighlight>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
     {!!token&& 
     <Touchable onPress={openSettings} style={[styles.row,styles.btn,{justifyContent:'space-between',paddingLeft:6,paddingRight:4,marginLeft:-6,height:40}]} activeOpacity={0.6}>
        <><View style={styles.row}>
      {photo_url?
              <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:8}}/>
              :<SvgXml xml={commonSvg.profileIcon}/>}
              <Text style={{fontFamily:'Primary-Semibold',fontSize:14,marginLeft:8,color:'#0d0d0d'}}>{data?.data?.data?.name}</Text>
              </View>
      {/* <Menu
          visible={showMenu}
          anchor={ */}
            <View style={styles.menuPress} >
              <SvgXml xml={drawerSvg.more} />
            </View>
          {/* }
          onRequestClose={()=>setShowMenu(false)}
          style={styles.menu}
        >
        <MenuItem style={styles.menuItem} onPress={onDelete}>
          <View style={[styles.row,{width:180}]}>
            <Text style={[styles.menuItemTxt,{color:Colors.grey}]}>Delete account</Text>
          </View>
        </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onLogout}>
            <View style={[styles.row,{width:180}]}>
              <Text style={styles.menuItemTxt}>Log out</Text>
            </View>
          </MenuItem>
        </Menu> */}
        </>
        </Touchable>}
    </SafeAreaView>
  );
};

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
});
