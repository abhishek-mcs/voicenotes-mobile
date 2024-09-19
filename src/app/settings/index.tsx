import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useNavigation, useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { SafeAreaView, Text, TouchableHighlight, View,Alert, StyleSheet, ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { ReactElement, useEffect, useState } from "react";
import { languages } from "utils/constants/languages";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { useSaveSettings } from "queries/settings";
import { isIOS, screenWidth } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setLang, setUserDetail } from "redux/reducers/userDetails";
import { currentVersion } from "services/api/api-constants";
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Name from "components/settings/name";
import About from "components/settings/about";
import Email from "components/settings/email";
import Names from "components/settings/names";
import Password from "components/settings/password";
import ProfilePic from "components/settings/profilepic";

export default () => {
  const router = useRouter();
  const navigation = useNavigation()

  const logout=useLogout()
  const {userDetails,lang}:any=useSelector((state: RootState) => state.userDetails);
  const settings:any=userDetails.settings
  const saveSettings=useSaveSettings()
  const dispatch=useDispatch()

  const [screen, showScreen] = useState<ReactElement | null>(null)

  const onLogout = () =>{
    
    Alert.alert('',"Are you sure you want to log out?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>{
        await AsyncStorage.removeItem('isLoggedIn');
        await logout.mutateAsync('').catch(()=>{})
        dispatch(setTempIsIAPPurchased(false))
        router?.back();
    }
    }])
  }

  const onDelete = () =>{
    Alert.alert('',"Are you sure you wish to delete your account?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>Wb.openBrowserAsync('https://tally.so/r/3xpBey')
    }])
  }

  const feedback = () =>Wb.openBrowserAsync('https://kyls3j7z4tt.typeform.com/to/Fn4bRdxT?typeform-source=voicenotes.com')
  const onSelectLang=(code='en')=>{
    dispatch(setLang(languages[code]))
    saveSettings.mutate({
      language:code,
      about:settings?.about,
      remember_words:settings?.remember_words||[],
      name:userDetails?.name,
      fix_punctuation:settings?.fix_punctuation,
    })
  }

  const onSelectName = () => {
    showScreen(<Name onClose={() => showScreen(null)} />)
  }

  const onSelectAbout = () => {
    showScreen(<About onClose={() => showScreen(null)} />)
  }

  const onSelectEmail = () => {
    showScreen(<Email onClose={() => showScreen(null)} />)
  }

  const onSelectNames = () => {
    showScreen(<Names onClose={() => showScreen(null)} />)
  }

  const onSelectPasswd = () => {
    showScreen(<Password onClose={() => showScreen(null)} />)
  }
  
  useEffect(() => {
    if(!!userDetails?.settings?.language){
      dispatch(setLang(languages[userDetails?.settings?.language]))
    }else{
      dispatch(setLang(languages['']))
    }
  },[userDetails?.settings])

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
        
        if(screen !== null) showScreen(null)
        else navigation.dispatch(e.data.action);
    });
  }, [])

    return (
        <SafeAreaView style={{flex:1,backgroundColor:'#F2F2F7',paddingTop:isIOS?0:40}}>
            {screen || <View style={{ flex: 1 }}>
              <Touchable onPress={()=>router.back()} style={{padding:12,alignSelf:'flex-end', marginRight: 2}} activeOpacity={0.6}>
                  <SvgXml xml={settingsSvg.close} width={30} height={30}  />
              </Touchable>
              <ProfilePic 
                url={userDetails?.photo_url || ""}
                onChange={photo_url => {
                  dispatch(setUserDetail({ ...userDetails, photo_url }))
                }}
              />
              <Grouped 
              title="ACCOUNT"
              items={[
                  {title:'Name', onPress: onSelectName, value:userDetails?.name||'', rightIcon:settingsSvg.arrow},
                  {title:'About', onPress: onSelectAbout, value:userDetails?.about||'', rightIcon:settingsSvg.arrow},
                  {title:'Email',onPress: onSelectEmail, value:userDetails?.email||'', rightIcon:settingsSvg.arrow},
                  {title:'Change password', onPress: onSelectPasswd, value:'', rightIcon:settingsSvg.arrow}
              ]}/>
              <Grouped
                title="APP"
                items={[
                  {title: 'Language', isMenu:true,data:Object.entries(languages),value:lang,onPressMenu:onSelectLang},
                  {title:'Names to remember',value:'', onPress: onSelectNames, rightIcon:settingsSvg.arrow}
                ]} 
              />
              <Grouped 
              title="MORE"
              items={[
                  {title:'Delete account',value:'',onPress:onDelete,rightIcon:settingsSvg.arrow},
                  {title:'Share feedback',value:'',onPress:feedback,rightIcon:settingsSvg.arrow},
                  {title:'Sign out',value:'',onPress:onLogout,style:{color:'#FF453A'},leftIcon:settingsSvg.signOut},
              ]}/>
              {/* version */}
              <View style={{alignSelf:'center'}}>
                <Text style={{fontFamily:'Primary-Medium',fontSize:14,color:Colors.grey}}>Version {currentVersion}</Text>
              </View>
            </View>}
        </SafeAreaView>
    );
}

const Grouped=({title,items}:{title:string,items:any})=>{
  const [showMenu,setShowMenu]=useState(false)
  const onShowMenu=()=>setShowMenu(true)
  const onHideMenu=()=>setShowMenu(false)
  return (
    <View style={{marginBottom:20}}>
    <Text style={{fontFamily:'Primary-Medium',fontSize:12,color:Colors.grey,marginLeft:32,marginBottom:8}}>{title}</Text>
    <View style={{marginHorizontal:16,borderRadius:12,backgroundColor:'#fff',overflow:'hidden'}}>
    {items?.map((item:any,index:number)=>
    <View key={index}>
    <TouchableHighlight onPress={item?.isMenu?onShowMenu:item?.onPress} underlayColor={Colors.greyWithOpacity(0.12)} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',overflow:'hidden',padding:16,paddingBottom:index!=items?.length-1?12:16}}>
        <>
        <View style={{flexDirection:'row'}}>
        {!!item?.leftIcon&&<SvgXml xml={item?.leftIcon}  style={{marginRight:9}}/>}
        <Text style={[{fontFamily:'Primary-Medium',fontSize:14,color:'#000'},item?.style??{}]}>{item.title}</Text>
        </View>
        {item?.isMenu?
        <Menu visible={showMenu}
        onRequestClose={onHideMenu}
        anchor={
        <View style={{flexDirection:'row',alignItems:'center',marginRight:-7}}>
          <Text style={styles.rightTxt} numberOfLines={1}>{item?.value}</Text>
          <SvgXml xml={settingsSvg.optionArrow}  />
        </View>
        }
        style={{height:'40%',marginTop:36,right:0,width:'60%'}}
        animationDuration={200}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {item?.data?.map((t:string,v:number)=>
          <View key={v}>
            <MenuItem onPress={()=>{
              onHideMenu()
              item?.onPressMenu(t[0])
              }} style={{paddingRight:60}}>
              {t[1]}
            </MenuItem>
            {v<item?.data?.length&&<MenuDivider/>}
          </View>
          )}
            </ScrollView>
        </Menu>
        :
          item?.value && <Text style={[styles.rightTxt, {width: item?.value ? '80%' : screenWidth/2}]} numberOfLines={1}>{item?.value}</Text>
        }
        {item?.rightIcon && <SvgXml xml={item?.rightIcon}  />}
      </>
    </TouchableHighlight>
    {index!=items?.length-1&&<View style={{marginHorizontal:16}}><View style={{height:1,backgroundColor:'rgba(221, 221, 221, 0.87)',width:'100%'}}/></View>}
    </View>)}
    </View>
</View>
)}

const styles=StyleSheet.create({
  rightTxt:{
    fontFamily:'Primary-Medium',
    fontSize:14,
    color:Colors.grey,
    textAlign:'right',
  }
})