import React, { useState, useEffect } from "react";
import { View, Text, TextStyle, Animated } from "react-native";
import { capitalizeFirstLetter, screenWidth } from "utils/common";
import { RenderHTML } from "react-native-render-html";
import PulsatingCircle from "./PulsatingCircle";
import Colors from "assets/Colors";
import * as Animatable from 'react-native-animatable';

const ChatBubble = ({
  delay = 30,
  lines = 100000,
  message,
  style = {},
  triggerAnimation = 0,
  disableGenerating = () => {},
  continueGenerating = true,
  showCursorAtEnd = false,
  cursorSvg = '',
  status = "",
  showStatus = false,
}: {
  delay?: number;
  message: string;
  style?: TextStyle;
  triggerAnimation?: number;
  disableGenerating?: () => void;
  continueGenerating?: boolean;
  showCursorAtEnd ?:boolean;
  lines?: number;
  cursorSvg?: string;
  status?: string;
  showStatus?: boolean;
}) => {
  const [displayedMessage, setDisplayedMessage]: any = useState("");
  const containsHTML = (str: string) => {
    const htmlPattern = /<[^>]+>/g;
    return htmlPattern.test(str);
  };

  useEffect(() => {
    let currentIndex = 0;
    let interval: any;
    if (triggerAnimation == 2 && !!message && continueGenerating) {
      const words = message.split(' ');
      interval = setInterval(() => {
        setDisplayedMessage((prev:any) => prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex]);
        currentIndex++;
        if ((currentIndex > words?.length-1) || currentIndex === 150) {
          disableGenerating();
          interval && clearInterval(interval);
        }
      },  60); // Adjust the interval for faster typing speed
    } else {
      disableGenerating();
      setDisplayedMessage(message);
      interval && clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [message, triggerAnimation, continueGenerating]);

  if (containsHTML(displayedMessage)) {
    return (
      <View style={{ marginTop: 8 }}>
        <RenderHTML
          contentWidth={screenWidth - 32}
          source={{ html: displayedMessage }}
        />
      </View>
    );
  }
  useEffect(()=>{
    if(triggerAnimation&&!!message){
      animated()
    }
  },[message,triggerAnimation])
  const txtArray=message.split(' ')
  let animatedValues:any=[]
  txtArray.forEach((_:any,i:number)=>{
    animatedValues[i]=new Animated.Value(0)
  })
  const animated=(toValue=1)=>{
    const animations=txtArray.map((words:any,i:number)=>{
      return Animated.timing(animatedValues[i],{
        toValue,
        duration:500,
        useNativeDriver:true
      })
    })
    Animated.stagger(100,animations)
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {txtArray.map((words:any,i:number)=>
      <Animated.Text key={`${words}-${i}`} style={[style, {opacity:animatedValues[i]}]} numberOfLines={lines}>
        {words}
      </Animated.Text>)}
      {showCursorAtEnd&&!!cursorSvg && <PulsatingCircle svg={cursorSvg} status={status} />}
      {showCursorAtEnd&&showStatus && (
        <Text
          style={{
            color: Colors.grey3,
            fontFamily: "Primary",
            fontSize: 12,
            lineHeight: 20,
            marginLeft: 4,
          }}
        >{status=="processing"?"Transcribing":status=="uploading"?"Uploading":""}</Text>
      )}
    </View>
  );
};

export default ChatBubble;