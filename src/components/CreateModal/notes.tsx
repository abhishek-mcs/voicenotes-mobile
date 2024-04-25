import Colors from "assets/Colors"
import { home } from "assets/svg/home"
import Touchable from "components/common/Touchable"
import { setStringAsync } from "expo-clipboard"
import { useState } from "react"
import { FlatList, StyleSheet, Text } from "react-native"
import { View } from "react-native"
import { SvgXml } from "react-native-svg"
import { screenHeight } from "utils/common"

export default (
    {type="summary",result=null,title="",id,onClose,onEdit,onRetry}
    :{type:string,result:any,title:string,id:number,onClose:()=>void,onEdit:()=>void,onRetry:(i:number,v:string)=>void}
    )=>{
        const [copy,setCopy]=useState('Copy')
    const onCopy = async()=>{
        setCopy('Copied')
        let copy=Array.isArray(result)?result.join('\n'):result;
        if(type=="email"){
            copy=`Subject: ${result?.subject}\nBody: ${result?.body}`
        }
        await setStringAsync(copy||'');
        setTimeout(() => {
            setCopy('Copy')
        }, 1000);
    }

    return (
        <View style={box}>
            {/* <View style={topBox}>
                <Touchable onPress={onClose}>
                    <SvgXml xml={home.close} />
                </Touchable>
                <Touchable onPress={onEdit}>
                    <SvgXml xml={home.editSuggest} style={svg} />
                </Touchable>
            </View> */}
            <Text style={titleStyle}>{`Great!`}</Text>
            <FlatList
            data={[1]}
            style={{marginBottom:20}}
            contentContainerStyle={{paddingHorizontal:32}}
            keyExtractor={(item:any,i)=>`${item?.id}-${i}`}
            showsVerticalScrollIndicator={false}
            renderItem={()=>
                (type=="summary"||type=="tweet"||type=="custom")?
                <Text onPress={()=>{}} suppressHighlighting style={text}>{result}</Text>
                :(type=="points"||type=="todo")?
                result?.map((itm:string,i:number)=>
                    <Text onPress={()=>{}} suppressHighlighting key={i} style={text}>{`${type=="points"?'\u2022 ':i+1+'. '} ${itm}`}</Text>
                )
                :type=="blog"?
                result?.map((itm:string,i:number)=>
                    <Text onPress={()=>{}} suppressHighlighting key={i} style={text}>{itm}</Text>
                )
                :<View>
                    <Text onPress={()=>{}} suppressHighlighting style={subject}>Subject: {result?.subject}</Text>
                    <Text onPress={()=>{}} suppressHighlighting style={text}>Body: {result?.body}</Text>
                </View>
                }/>
            <View style={btnBox}>
                <Touchable onPress={onCopy} style={btn} activeOpacity={0.6}>
                    <>
                    <SvgXml xml={home.copy2}/>
                    <Text style={btnText}>{copy}</Text>
                    </>
                </Touchable>
                <Touchable onPress={()=>onRetry(id,title)} style={btn} activeOpacity={0.6}>
                    <>
                    <SvgXml xml={home.retry}/>
                    <Text style={[btnText,{marginLeft:0}]}>Retry</Text>
                    </>
                </Touchable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    box:{height:screenHeight/1.4,paddingBottom:30},
    topBox:{flexDirection:'row-reverse',alignItems:'center',paddingBottom:16,paddingHorizontal:24,borderBottomWidth:1,borderBottomColor:Colors.darkWithOpacity(0.1)},
    titleStyle:{fontFamily:'Primary-Semibold',fontSize:16,lineHeight:28,color:'#0D0D0D',marginVertical:12,marginHorizontal:32},
    text:{color:'#000',fontFamily:'Primary',lineHeight:24,fontSize:14,marginBottom:8},
    svg:{marginRight:16},
    btnBox:{flexDirection:'row',alignItems:'center',marginHorizontal:32},
    btn:{flexDirection:'row',alignItems:'center',marginRight:12,marginLeft:-6,paddingHorizontal:12,height:32,borderRadius:12,backgroundColor:Colors.darkWithOpacity(0.05)},
    btnText:{fontFamily:'Primary',fontSize:12,color:'#0d0d0d',marginLeft:4},
    subject:{fontFamily:'Primary-Medium',fontSize:14,color:"#222",marginBottom:20}
})

const { titleStyle,text,topBox,box,svg,btnBox,btnText,btn,subject } = styles