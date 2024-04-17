import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { SafeAreaView, Text, TouchableHighlight, View,Alert, StyleSheet, ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import MoreOptions from "components/common/more-options";
import { useRef, useState } from "react";
import languages from "utils/constants/languages";
import { Menu, MenuItem } from "react-native-material-menu";
import { useQueryClient } from "react-query";
import { useSaveSettings } from "queries/settings";

export default () => {
    const router = useRouter();
    const logout=useLogout()
    // const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
    const queryClient=useQueryClient()
    const userData:any=queryClient.getQueriesData('user-data')
    const userDetails:any=userData[0][1]?.data
    const settings:any=userData[0][1]?.data?.settings
    const lang:any=languages.find(language => Object.keys(language)[0] === settings?.language);
    const [langSelected,setLangSelected]=useState(lang[settings?.language])
    const saveSettings=useSaveSettings()

  const onLogout = () =>{
    
    Alert.alert('',"Are you sure you want to log out?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>{
        router?.back();
        await logout.mutateAsync('')
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

  const onSelectLang=(code:string)=>{
    const l:any=languages.find(language => Object.keys(language)[0] === code);
    setLangSelected(l[code])
    saveSettings.mutate({
      language:code,
      about:settings?.about,
      remember_words:settings?.remember_words,
      name:userDetails?.name,
      fix_punctuation:settings?.fix_punctuation,
    })
  }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:'#F2F2F7'}}>
            <Touchable onPress={()=>router.back()} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
                <SvgXml xml={settingsSvg.close}  />
            </Touchable>
            <Grouped 
            title="ACCOUNT"
            items={[
                {title:'Name',value:userDetails?.name||''},
                {title:'Email',value:userDetails?.email||''},
            ]}/>
            <Grouped 
            title="APP"
            items={[
                {title:'Language',isMenu:true,data:languages,value:langSelected,onPressMenu:onSelectLang}
            ]}/>
            <Grouped 
            title="MORE"
            items={[
                {title:'Delete account',value:'',onPress:onDelete,rightIcon:settingsSvg.arrow},
                {title:'Give us feedback',value:'',onPress:feedback,rightIcon:settingsSvg.arrow},
                {title:'Sign out',value:'',onPress:onLogout,style:{color:'#FF453A'},leftIcon:settingsSvg.signOut},
            ]}/>
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
        anchor={<Text style={styles.rightTxt} numberOfLines={1}>{item?.value}</Text>}
        style={{maxHeight:300,marginTop:20,marginRight:-30}}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {item?.data?.map((t:string,v:number)=>
            <MenuItem key={v} onPress={()=>{
              onHideMenu()
              item?.onPressMenu(Object.keys(t)[0])
              }}>
              {Object.values(t)[0]}
            </MenuItem>)}
            </ScrollView>
        </Menu>
        :!!item?.rightIcon?
        <SvgXml xml={item?.rightIcon}  />
        :<Text style={styles.rightTxt} numberOfLines={1}>{item?.value}</Text>}
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
    width:ScreenWidth/2,
    textAlign:'right'
  }
})