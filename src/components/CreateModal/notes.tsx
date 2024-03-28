import Colors from "assets/Colors"
import { home } from "assets/svg/home"
import Touchable from "components/common/Touchable"
import { setStringAsync } from "expo-clipboard"
import { ScrollView, StyleSheet, Text } from "react-native"
import { View } from "react-native"
import { TouchableHighlight } from "react-native-gesture-handler"
import { SvgXml } from "react-native-svg"
import { capitalizeFirstLetter } from "utils/common"

export default (
    {type="summary",result=null,title="",id,onClose,onEdit,onRetry}
    :{type:string,result:any,title:string,id:number,onClose:()=>void,onEdit:()=>void,onRetry:(i:number,v:string)=>void}
    )=>{
    const onCopy = async()=>{
        let copy=Array.isArray(result)?result.join('\n'):result;
        if(type=="email"){
            copy=`Subject: ${result[0]}\nBody: ${result[1]}`
        }
        await setStringAsync(copy||'');
    }

    return (
        <View style={box}>
            <View style={topBox}>
                <Touchable onPress={onClose}>
                    <SvgXml xml={home.close} />
                </Touchable>
                <Touchable onPress={onEdit}>
                    <SvgXml xml={home.editSuggest} style={svg} />
                </Touchable>
            </View>
            <ScrollView style={{maxHeight:'80%',marginBottom:20,position:'relative',overflow:'hidden'}} contentContainerStyle={{paddingHorizontal:32}}>
                <Text style={titleStyle}>{`${capitalizeFirstLetter(type)}: ${title}`}</Text>
                {(type=="summary"||type=="tweet")?
                <Text style={text}>{result}</Text>
                :(type=="points"||type=="todo")?
                result?.map((itm:string,i:number)=>
                    <Text key={i} style={text}>{`${type=="points"?'\u2022 ':i+1+'. '} ${itm}`}</Text>
                )
                :type=="blog"?
                result?.map((itm:string,i:number)=>
                    <Text key={i} style={text}>{itm}</Text>
                )
                :<View>
                    <Text style={subject}>Subject: {result&&result[0]}</Text>
                    <Text style={text}>Body: {result&&result[1]}</Text>
                </View>
                }
            </ScrollView>
            <View style={btnBox}>
                <TouchableHighlight onPress={onCopy} style={btn} underlayColor={Colors.greyWithOpacity(0.1)}>
                    <>
                    <SvgXml xml={home.copy}/>
                    <Text style={btnText}>Copy</Text>
                    </>
                </TouchableHighlight>
                <TouchableHighlight onPress={()=>onRetry(id,title)} style={btn} underlayColor={Colors.greyWithOpacity(0.1)}>
                    <>
                    <SvgXml xml={home.retry}/>
                    <Text style={[btnText,{marginLeft:6}]}>Retry</Text>
                    </>
                </TouchableHighlight>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    box:{},
    topBox:{flexDirection:'row-reverse',alignItems:'center',paddingBottom:16,paddingHorizontal:24,borderBottomWidth:1,borderBottomColor:Colors.darkWithOpacity(0.1)},
    titleStyle:{fontFamily:'Primary-Medium',fontSize:16,lineHeight:26,color:'#000',marginVertical:20},
    text:{color:'#222',fontFamily:'Primary',fontSize:14,marginBottom:8},
    svg:{marginRight:16},
    btnBox:{flexDirection:'row',alignItems:'center',marginHorizontal:32},
    btn:{flexDirection:'row',alignItems:'center',marginRight:12,marginLeft:-6,paddingHorizontal:6,paddingVertical:4,borderRadius:8},
    btnText:{fontFamily:'Primary',fontSize:12,color:Colors.grey,marginLeft:4},
    subject:{fontFamily:'Primary-Medium',fontSize:14,color:"#222",marginBottom:20}
})

const { titleStyle,text,topBox,box,svg,btnBox,btnText,btn,subject } = styles