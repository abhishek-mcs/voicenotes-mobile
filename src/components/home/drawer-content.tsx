import Colors from "assets/Colors";
import { drawerSvg } from "assets/svg/drawerSvg";
import Touchable from "components/common/Touchable";
import { useGetTags, useGetUserData } from "queries/home";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { setHashTags,setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { useRouter } from "expo-router";
import { isIOS } from "utils/common";
import { Menu, MenuItem } from "react-native-material-menu";
import { useLogout } from "queries/auth";
import { commonSvg } from "assets/svg/commonSvg";
import * as Wb from "expo-web-browser";

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
    const tags=getTags.data?.data?.flatMap((t:any)=>t?.name)||[];
    dispatch(setHashTags(tags))
  }, [getTags.data]);

  const handleTagPress = (tag: string) => {
    dispatch(setTagsFilter(tag))
    setCurrentTag(tag)
    router.back()
  };

  const onLogout = () =>{
    router.back()
    setShowMenu(false)
    Alert.alert('',"Are you sure you want to log out?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>await logout.mutateAsync('')
    }])
  }

  const onDelete = () =>{
    router.back()
    setShowMenu(false)
    Alert.alert('',"Are you sure you wish to delete your account?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>Wb.openBrowserAsync('https://tally.so/r/3xpBey')
    }])
    
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{ alignItems: "flex-start" }}
        data={['All',...hashTags]}
        renderItem={({ item, index }) => (
          <Touchable onPress={() => handleTagPress(item)} style={[styles.btn,{
            backgroundColor: item==currentTag?Colors.darkWithOpacity(0.1):'transparent'}]}>
            <SvgXml xml={
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
            >{item}</Text>
          </Touchable>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
     {!!token&& <View style={[styles.row,{justifyContent:'space-between'}]}>
        <View style={styles.row}>
      {photo_url?
              <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:8}}/>
              :<SvgXml xml={commonSvg.profileIcon}/>}
              <Text style={{fontFamily:'Primary-Semibold',fontSize:14,marginLeft:8,color:'#0d0d0d'}}>{data?.data?.data?.name}</Text>
              </View>
      <Menu
          visible={showMenu}
          anchor={
            <Touchable style={styles.menuPress} onPress={()=>setShowMenu(true)}>
              <SvgXml xml={drawerSvg.more} />
            </Touchable>
          }
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
        </Menu>
        </View>}
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
