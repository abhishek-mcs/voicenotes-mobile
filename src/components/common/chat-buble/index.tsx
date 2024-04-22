import React, { useState, useEffect } from 'react';
import { View, Text, TextStyle } from 'react-native';

export default ({ message,style={},triggerAnimation=0,disableGenerating=()=>{},continueGenerating=true }:{message:string,style:TextStyle,triggerAnimation:number,disableGenerating:()=>void,continueGenerating?:boolean})=> {
    const [displayedMessage, setDisplayedMessage] = useState('');

    useEffect(() => {
      let currentIndex = 0;
      let interval:any;
  
      if (triggerAnimation==2&&!!message&&continueGenerating) {
        interval = setInterval(() => {
          setDisplayedMessage(message?.substring(0, currentIndex + 1));
          currentIndex++;
          if (currentIndex === message.length) {
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

  return (
      <Text style={style}>{displayedMessage}</Text>
  );
};