import React, { useState, useEffect } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { screenWidth } from 'utils/common';
import {RenderHTML} from 'react-native-render-html';

export default ({ delay=30,lines=100000, message,style={},triggerAnimation=0,disableGenerating=()=>{},continueGenerating=true }:{delay?:number,message:string,style:TextStyle,triggerAnimation:number,disableGenerating:()=>void,continueGenerating?:boolean,lines?:number})=> {
    const [displayedMessage, setDisplayedMessage]:any = useState('');

    const containsHTML = (str:string) => {
      const htmlPattern = /<[^>]+>/g;
      return htmlPattern.test(str);
    };

    useEffect(() => {
      let currentIndex = 0;
      let interval:any;
  
      if (triggerAnimation==2&&!!message&&continueGenerating) {
        interval = setInterval(() => {
          setDisplayedMessage(message?.substring(0, currentIndex + 1));
          currentIndex++;
          if ((currentIndex === message.length)||(currentIndex === 350)) {
            disableGenerating()
            interval&&clearInterval(interval);
          }
        }, 30); // Adjust the interval for faster typing speed
      } else {
        disableGenerating()
        setDisplayedMessage(message);
        interval&&clearInterval(interval);
      }
  
      return () => clearInterval(interval);
    }, [message, triggerAnimation,continueGenerating]);
    
  if(containsHTML(displayedMessage)){
    return(
      <View style={{marginTop:8}}>
        <RenderHTML
          contentWidth={screenWidth-32}
          source={{html:displayedMessage}}
        />
      </View>
    )
  }
  return (
      <Text style={[style,{}]} numberOfLines={lines}>{displayedMessage}</Text>
  );
};