import React, { useState, useEffect } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { formatHtmlText } from 'utils/common';

export default ({ delay=30,message,style={},triggerAnimation=0,disableGenerating=()=>{},continueGenerating=true }:{delay?:number,message:string,style:TextStyle,triggerAnimation:number,disableGenerating:()=>void,continueGenerating?:boolean})=> {
    const [displayedMessage, setDisplayedMessage]:any = useState('');

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
      <HTMLText style={[style,{}]}>{displayedMessage}</HTMLText>
  );
};

const HTMLText = ({ children ,style={}}:any) => {
  const htmlRegex = /<([^>]+)>/g;
  let formattedText = children.replaceAll(/<br\s*\/?>/gi, '\n');
  formattedText = formattedText.replaceAll(/&nbsp;|&#160;/gi, ' ');
  formattedText = formattedText.replace(/<i>(.*?)<\/i>/g, (match:any, content:any) => {
    return <Text style={{ fontStyle: 'italic' }}>{content}</Text>;
  });
  formattedText = formattedText.replace(/<b>(.*?)<\/b>/g, (match:any, content:any) => {
    return <Text style={{ fontWeight: 'bold' }}>{content}</Text>;
  });
  formattedText = formattedText.replaceAll(htmlRegex, '');
  return (
      <Text style={style}>{formattedText}</Text>
  );
};