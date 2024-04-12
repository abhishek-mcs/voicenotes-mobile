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

  return (
    <View style={{ height: 53,zIndex:10 }} onTouchStart={()=>Keyboard.dismiss()}>
      <View
        style={styles.container}
      >
       <View style={{flex:1,flexDirection:'row',alignSelf:'center'}}>
       {token&&
       <Touchable style={{alignSelf:'flex-start',padding:16,paddingRight:10,marginRight:6,marginLeft:-16 }} onPress={()=>router?.openDrawer()}>
          <SvgXml xml={home.drawer} />
        </Touchable>}
        </View>
        {/* <SvgXml xml={home.logo} style={{ flex: 1 }} /> */}
        <View style={{  justifyContent: "flex-end" }}>

     {isLogged? 
         !!token&&
        <Touchable onPress={()=>{streakRef?.current?.open()}} style={{marginVertical:12,width:22,height:22,borderRadius:100,borderWidth:1,borderStyle:'dashed',justifyContent:'center',alignItems:'center',borderColor:'#222'}} activeOpacity={0.6}>
          <Text style={{fontSize:12,fontFamily:'Primary-Bold',color:'#222'}}>{streaks?.data?.data?.current_streak}</Text>
        </Touchable>
        :<View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-end'}}>
         <Touchable
            onPress={() => {
              route.navigate("/auth/signup");
            }}
            style={{marginRight:16}}
            activeOpacity={0.6}
          ><Text style={{ color: Colors.grey, fontFamily:'Primary-Semibold',fontSize:12,paddingLeft:12,paddingVertical:8 }}>Sign up</Text>
          </Touchable>
         <Touchable
            activeOpacity={0.6}
            onPress={() => {
              route.navigate("/auth/login/loginPassword");
            }}
            style={{ alignSelf: "flex-end",backgroundColor:'#222',borderRadius:16,padding:12,paddingVertical:8,height:35 }}
          ><Text style={{ color: '#fff',fontFamily:'Primary-Semibold',fontSize:14 }}>Log in</Text>
          </Touchable></View>}
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
  }
})
