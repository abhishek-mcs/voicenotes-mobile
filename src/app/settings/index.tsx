import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableHighlight, View } from "react-native";
import { SvgXml } from "react-native-svg";

export default () => {
    const router = useRouter();
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'#F2F2F7'}}>
            <Touchable onPress={()=>router.back()} style={{padding:12,alignSelf:'flex-end'}} activeOpacity={0.6}>
                <SvgXml xml={settingsSvg.close}  />
            </Touchable>
            <Grouped 
            title="ACCOUNT"
            items={[
                {title:'Name',value:'Athul',onPress:()=>{}},
                {title:'Email',value:'athul@voicenotes.com',onPress:()=>{}},
            ]}/>
            <Grouped 
            title="APP"
            items={[
                {title:'Language',value:'English',onPress:()=>{}}
            ]}/>
            <Grouped 
            title="MORE"
            items={[
                {title:'Delete account',value:'',onPress:()=>{}},
                {title:'Give us feedback',value:'',onPress:()=>{}},
                {title:'Sign out',value:'',onPress:()=>{}},
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
        <Text style={{fontFamily:'Primary-Medium',fontSize:14,color:'#000'}}>{item.title}</Text>
        <Text style={{fontFamily:'Primary-Medium',fontSize:14,color:Colors.grey}}>{item?.value}</Text>
        </>
    </TouchableHighlight>
    {index!=items?.length-1&&<View style={{marginHorizontal:16}}><View style={{height:1,backgroundColor:'rgba(221, 221, 221, 0.87)',width:'100%'}}/></View>}
    </View>)}
    </View>
</View>
)