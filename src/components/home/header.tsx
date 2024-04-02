import { useNavigation } from "@react-navigation/native";
import Colors from "assets/Colors";
import { commonSvg } from "assets/svg/commonSvg";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { SvgXml } from "react-native-svg";
import {router as route} from "expo-router"
import { useLogout } from "queries/auth";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { useQueryClient } from "react-query";
import { isIOS } from "utils/common";

export default ({isLogged=true}) => {
  const router:any=useNavigation()
  const [showMenu,setShowMenu]=useState(false)
  const {hashTags} = useSelector((state: RootState) => state.hash);

  const logout=useLogout()
  const queryClient=useQueryClient()
  const data:any=queryClient.getQueryData('user-data')||null;
  const photo_url=data?.photo_url||null;
  
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
    <View style={{ height: 53 }}>
      <View
        style={styles.container}
      >
       {hashTags?.length!=0?
       <Touchable style={{ flex: 1 }} onPress={()=>router?.openDrawer()}>
          <SvgXml xml={home.hash} />
        </Touchable>
        :<View style={{flex:1}}/>}
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
    alignItems: "flex-end",
    justifyContent: "center",
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
