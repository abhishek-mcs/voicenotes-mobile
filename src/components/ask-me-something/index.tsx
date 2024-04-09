import { StyleSheet, View } from "react-native"
import { isIOS } from "utils/common"
import { Text } from "react-native"
import AiLoader from "components/common/loaders/ai-loader"
import { useRef, useState } from "react"
import { useAskSomething } from "queries/home"
import ChatBuble from "components/common/chat-buble"

export default ()=>{
    const [loading,setLoading]=useState(false)
    const [qstn,setQstn]=useState('')
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
    return (
        <View style={container}>
            <Text style={heading}>What's on your mind? <Text onPress={onAsk} style={{textDecorationLine:'underline'}}>Ask me something</Text></Text>
            {askSomething.isLoading?<AiLoader text="Coming up with a question for you" size={14} style={{marginTop:8}}/>
            :qstn!=''?<ChatBuble style={question} message={qstn} triggerAnimation={loading?0:2} disableGenerating={()=>{}}/>:null}
        </View>
    )
}

const {container,heading,question}=StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      minHeight: 56,
      borderRadius: 24,
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 86,
      shadowColor:isIOS?"#00000026":"rgba(0,0,0,0.7)",
          shadowOpacity: 0.9,
          shadowOffset: { width: 0, height:0.5 },
          shadowRadius: 1.5,
      zIndex:1,
          elevation: 3,
      paddingHorizontal:20,
      paddingVertical:16
    },
    heading:{
        fontFamily:'Primary',
        fontSize:14,
        color:'#222',
        textAlign:'left'
    },
    question:{
        fontFamily:'Primary-Semibold',
        fontSize:14,
        color:'#222',
        marginTop:12,
        textAlign:'left',
        lineHeight:20
    }
})