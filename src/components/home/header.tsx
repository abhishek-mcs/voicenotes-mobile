import { useNavigation } from "@react-navigation/native";
import Colors from "assets/Colors";
import { commonSvg } from "assets/svg/commonSvg";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { useRef, useState } from "react";
import { Alert, Image, Keyboard, StyleSheet, Text, View } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { SvgXml } from "react-native-svg";
import {router as route} from "expo-router"
import { useLogout } from "queries/auth";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import { useGetUserData, useStreak } from "queries/home";
import Streaks from "components/streaks";

export default ({isLogged=true,streakRef=null}:any) => {
  const router:any=useNavigation()
  const [showMenu,setShowMenu]=useState(false)
  const {hashTags} = useSelector((state: RootState) => state.hash);
  const {token}=useSelector((state:RootState)=>state?.userDetails)

  const logout=useLogout()
  const data=useGetUserData(token);
  const photo_url=data?.data?.data?.photo_url||null;
  const streaks=useStreak(token)
  
  const onLogout = () =>{
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
  return (
    <View style={{ height: 53,zIndex:10 }} onTouchStart={()=>Keyboard.dismiss()}>
      <View
        style={styles.container}
      >
       <View style={{flex:1,flexDirection:'row',alignSelf:'center'}}>
       {hashTags?.length!=0&&
       <Touchable style={{alignSelf:'flex-start',padding:16,paddingRight:10,marginRight:6,marginLeft:-16 }} onPress={()=>router?.openDrawer()}>
          <SvgXml xml={home.hash} />
        </Touchable>}
        {!!token&&streaks?.data?.data?.current_streak>0&&
        <Touchable onPress={()=>{streakRef?.current?.open()}} style={{marginVertical:12,width:22,height:22,borderRadius:100,borderWidth:1,borderStyle:'dashed',justifyContent:'center',alignItems:'center',borderColor:'#222'}} activeOpacity={0.6}>
          <Text style={{fontSize:12,fontFamily:'Primary-Bold',color:'#222'}}>{streaks?.data?.data?.current_streak}</Text>
        </Touchable>}
        </View>
        <SvgXml xml={home.logo} style={{ flex: 1 }} />
        <View style={{ flex: 1, justifyContent: "flex-end" }}>

     {isLogged? <Menu
          visible={showMenu}
          anchor={
            <Touchable style={styles.menuPress} onPress={()=>setShowMenu(true)}>
              {photo_url?
              <Image source={{uri:photo_url}} style={{width:30,height:30,borderRadius:8}}/>
              :<SvgXml xml={commonSvg.profileIcon}/>}
            </Touchable>
          }
          onRequestClose={()=>setShowMenu(false)}
          style={styles.menu}
        >
          <MenuItem style={styles.menuItem} onPress={onLogout}>
            <View style={[styles.row,{width:180}]}>
              <Text style={styles.menuItemTxt}>Log out</Text>
            </View>
          </MenuItem>
        </Menu>
         : <Touchable
            onPress={() => {
              route.navigate("/auth/login/loginPassword");
            }}
            style={{ alignSelf: "flex-end" }}
          ><Text style={{ color: Colors.grey,fontFamily:'Primary',fontSize:14 }}>Login</Text>
          </Touchable>}
        </View>
      </View>
      <Streaks ref={streakRef} data={streaks?.data?.data}/>
    </View>
  );
};

const styles=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center'},
  container:{
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  menu: {
    borderRadius: 12,
    marginTop:36,
    marginLeft:10
  },
  menuPress: {
    alignSelf: "flex-end",
    justifyContent: "center",width:30,height:30,borderRadius:8
  },
  menuItem: { paddingHorizontal: isIOS? 16:8, borderRadius: 12, overflow: "hidden", },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 0,
  },
})
