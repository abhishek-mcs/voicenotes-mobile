import { Keyboard, StyleSheet, View } from "react-native"
import { isIOS } from "utils/common"
import { Text } from "react-native"
import AiLoader from "components/common/loaders/ai-loader"
import { useEffect, useRef, useState } from "react"
import { useAskSomething } from "queries/home"
import ChatBuble from "components/common/chat-buble"
import Colors from "assets/Colors"

export default ()=>{
    const [loading,setLoading]=useState(false)
    const [qstn,setQstn]=useState('')
    const [keyboardShown,setKeyboardShown]=useState(false)
    const askSomething=useAskSomething()
    const textTimeout=useRef<any>()
    const onAsk=()=>{
        setLoading(true);
        askSomething.mutateAsync('',{
            onSuccess:(r)=>{
                setQstn(r?.data?.suggestion)
            }
        })
        setLoading(false)
        textTimeout?.current&&clearTimeout(textTimeout?.current)
        textTimeout.current=setTimeout(() => {
            setQstn('')
        }, 10000);
    }
    useEffect(()=>{
        const keyShow=Keyboard.addListener("keyboardDidShow",()=>setKeyboardShown(true))
        const keyHide=Keyboard.addListener("keyboardDidHide",()=>setKeyboardShown(false))
        return ()=>{
            keyShow.remove()
            keyHide.remove()
        }
    },[])
    return (
        <View style={[container,{bottom:keyboardShown?-80:85}]}>
            <Text style={heading}>What's on your mind? <Text onPress={onAsk} style={{textDecorationLine:'underline'}}>Ask me something</Text></Text>
            {askSomething.isLoading?<AiLoader text="Coming up with a question for you" size={14} style={{marginTop:8}}/>
            :qstn!=''?<ChatBuble style={question} message={qstn} triggerAnimation={loading?0:2} disableGenerating={()=>{}}/>:null}
            {qstn!=''&&<Text style={caption}>Get personalized, thoughtful questions as you record more notes.</Text>}
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
        fontSize:14,
        color:'#222',
        marginTop:12,
        textAlign:'left',
        lineHeight:20
    },
    caption:{
        fontFamily:'Primary',
        fontSize:12,
        color:Colors.grey,
        marginTop:12
    }
})