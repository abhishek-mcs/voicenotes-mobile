import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';

export default ({ message,style={},triggerAnimation=0,disableGenerating=()=>{} }:{message:string,style:TextStyle,triggerAnimation:number,disableGenerating:()=>void})=> {
    const [displayedMessage, setDisplayedMessage] = useState('');

    useEffect(() => {
      let currentIndex = 0;
      let interval:any;
  
      if (triggerAnimation==2) {
        interval = setInterval(() => {
          setDisplayedMessage(message.substring(0, currentIndex + 1));
          currentIndex++;
          if (currentIndex === message.length) {
            disableGenerating()
            clearInterval(interval);
          }
        }, 30); // Adjust the interval for faster typing speed
      } else {
        setDisplayedMessage(message);
      }
  
      return () => clearInterval(interval);
    }, [message, triggerAnimation]);

  return (
      <Text style={style}>{displayedMessage}</Text>
  );
};