import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { Alert } from "react-native";
import { SafeAreaView, Text, TouchableHighlight, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { ScreenWidth } from "@rneui/base";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

export default () => {
    const router = useRouter();
    const logout=useLogout()
    const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)

  const onLogout = () =>{
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
            {/* <Grouped 
            title="APP"
            items={[
                {title:'Language',value:'English',onPress:()=>{}}
            ]}/> */}
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

const Grouped=({title,items}:{title:string,items:any})=>(
    <View style={{marginBottom:20}}>
    <Text style={{fontFamily:'Primary-Medium',fontSize:12,color:Colors.grey,marginLeft:32,marginBottom:8}}>{title}</Text>
    <View style={{marginHorizontal:16,borderRadius:12,backgroundColor:'#fff',overflow:'hidden'}}>
    {items?.map((item:any,index:number)=>
    <View key={index}>
    <TouchableHighlight onPress={item?.onPress} underlayColor={Colors.darkWithOpacity(0.1)} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',overflow:'hidden',padding:16,paddingBottom:index!=items?.length-1?12:16}}>
        <>
        <View style={{flexDirection:'row'}}>
        {!!item?.leftIcon&&<SvgXml xml={item?.leftIcon}  style={{marginRight:9}}/>}
        <Text style={[{fontFamily:'Primary-Medium',fontSize:14,color:'#000'},item?.style??{}]}>{item.title}</Text>
        </View>
        {!!item?.rightIcon?
        <SvgXml xml={item?.rightIcon}  />
        :<Text style={{fontFamily:'Primary-Medium',fontSize:14,color:Colors.grey, width:ScreenWidth/2,textAlign:'right'}} numberOfLines={1}>{item?.value}</Text>}
        </>
    </TouchableHighlight>
    {index!=items?.length-1&&<View style={{marginHorizontal:16}}><View style={{height:1,backgroundColor:'rgba(221, 221, 221, 0.87)',width:'100%'}}/></View>}
    </View>)}
    </View>
</View>
)