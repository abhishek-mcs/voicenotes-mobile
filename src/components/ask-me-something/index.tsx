import { Keyboard, StyleSheet, useWindowDimensions, View } from "react-native"
import { isIOS } from "utils/common"
import { Text } from "react-native"
import AiLoader from "components/common/loaders/ai-loader"
import { useEffect, useRef, useState } from "react"
import { useAskSomething } from "queries/home"
import ChatBuble from "components/common/chat-buble"
import Colors from "assets/Colors"
import { SvgXml } from "react-native-svg"
import { commonSvg } from "assets/svg/commonSvg"
import Touchable from "components/common/Touchable"
import askMeSuggestions from "utils/constants/ask-me-suggestions"

export default ({onClose=()=>{}})=>{
    const customSuggestions=askMeSuggestions
    const [loading,setLoading]=useState(false)
    const [qstn,setQstn]=useState('')
    const [keyboardShown,setKeyboardShown]=useState(false)
    const askSomething=useAskSomething()
    const textTimeout=useRef<any>()
    const onAsk=()=>{
        setLoading(true);
        askSomething.mutateAsync('',{
            onSuccess:(r)=>{
                if(!!r?.data?.suggestion)
                    setQstn(r?.data?.suggestion)
                else{
                    const randomIndex = Math.floor(Math.random() * customSuggestions.length);
                    setQstn(customSuggestions[randomIndex])
                }
            },
            onError:()=>{
                const randomIndex = Math.floor(Math.random() * customSuggestions.length);
                setQstn(customSuggestions[randomIndex])
            }
        })
        setLoading(false)
        // textTimeout?.current&&clearTimeout(textTimeout?.current)
        // textTimeout.current=setTimeout(() => {
        //     setQstn('')
        // }, 10000);
    }
    useEffect(()=>{
        const keyShow=Keyboard.addListener(isIOS?"keyboardWillShow":"keyboardDidShow",()=>setKeyboardShown(true))
        const keyHide=Keyboard.addListener("keyboardDidHide",()=>setKeyboardShown(false))
        return ()=>{
            keyShow.remove()
            keyHide.remove()
        }
    },[])
    const {height}=useWindowDimensions()
    const top=height>690?85:120
    return (
        <View style={[container,{bottom:keyboardShown?-80:(isIOS?top:114)}]}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{width:'90%'}}>
                    <Text style={heading}>What's on your mind? <Text onPress={onAsk} style={{textDecorationLine:'underline'}}>Ask me something</Text></Text>
                    {askSomething.isLoading?<AiLoader text="Coming up with a question for you" size={16} style={{marginTop:6}}/>
                    :qstn!=''?<ChatBuble delay={10} style={question} message={qstn} triggerAnimation={loading?0:2} disableGenerating={()=>{}}/>:null}
                    {/* {qstn!=''&&<Text style={caption}>We’ll show personalized questions as you record more notes.</Text>} */}
                </View>
                <Touchable onPress={onClose} style={{width:20,height:20,alignItems:'flex-end',justifyContent:'center',paddingRight:0}}>
                    <SvgXml xml={commonSvg.smallClose}/>
                </Touchable>
            </View>
        </View>
    )
}

const {container,heading,question,caption}=StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      minHeight: 56,
      borderRadius: 24,
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 85,
      shadowColor:isIOS?"#00000026":"rgba(0,0,0,0.7)",
          shadowOpacity: 0.9,
          shadowOffset: { width: 0, height:0.5 },
          shadowRadius: 1.5,
      zIndex:1,
          elevation: 3,
      paddingHorizontal:20,
      paddingVertical:16,
      justifyContent:'center'
    },
    heading:{
        fontFamily:'Primary',
        fontSize:14,
        color:'#222',
        textAlign:'left'
    },
    question:{
        fontFamily:'Primary-Medium',
        fontSize:15,
        color:'#222',
        marginTop:12,
        textAlign:'left',
        lineHeight:20,
    },
    caption:{
        fontFamily:'Primary',
        fontSize:12,
        color:Colors.grey,
        marginTop:12
    }
})