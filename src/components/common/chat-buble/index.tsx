import { useState } from "react";
import { View, Text, TextStyle } from "react-native";
import { screenWidth } from "utils/common";
import { RenderHTML } from "react-native-render-html";
import PulsatingCircle from "./PulsatingCircle";
import { TypeAnimation } from 'react-native-type-animation';
import { useTheme } from "context";
import { useRouter } from "expo-router";
import { TextComponent } from "./text-component";

const TypeAnim:any=TypeAnimation

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
  showUpgrade = false,
  isSummary = false
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
  showUpgrade?: boolean;
  isSummary?:boolean;
}) => {
  const [displayedMessage]: any = useState("");
  const containsHTML = (str: string) => {
    const htmlPattern = /<[^>]+>/g;
    return htmlPattern.test(str);
  };
  const { Colors } = useTheme()

  // useEffect(() => {
  //   let currentIndex = 0;
  //   let interval: any;
  //   if (triggerAnimation == 2 && !!message && continueGenerating) {
  //     const words = message.split(' ');
  //     interval = setInterval(() => {
  //       setDisplayedMessage((prev:any) => prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex]);
  //       currentIndex++;
  //       if ((currentIndex > words?.length-1) || currentIndex === 150) {
  //         disableGenerating();
  //         interval && clearInterval(interval);
  //       }
  //     },  60); // Adjust the interval for faster typing speed
  //   } else {
  //     disableGenerating();
  //     setDisplayedMessage(message);
  //     interval && clearInterval(interval);
  //   }
  //   return () => clearInterval(interval);
  // }, [message, triggerAnimation, continueGenerating]);

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

  const summaryNotes = isSummary?message?.split('\n'):['']
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>

      {triggerAnimation==2?
      <TypeAnim
      sequence={[
        { text: message },
      ]}
      style={style}
      cursor={false}
      typeSpeed={40}
      onComplete={disableGenerating}
      // splitter={(str) => str.split(/\s+/)}
      numberOfLines={lines}
    />
    :isSummary?
    <View >{
    summaryNotes?.splice(0,lines<10?2:summaryNotes?.length)?.map((m:any,i:number)=>(
      <Text key={i} style={[style, {marginTop:i==0?4:8}]}>
        {m}{lines<10&&i==1?'...':''}
      </Text>
    ))}
    </View>
    :<TextComponent text={message} style={style} numberOfLines={lines}/>}
      {showCursorAtEnd&&!!cursorSvg && <PulsatingCircle svg={cursorSvg} status={status} />}
      {showCursorAtEnd&&showStatus && (
        <Text
          style={{
            color: Colors.text10,
            fontFamily: "Primary",
            fontSize: 12,
            lineHeight: 20,
            marginLeft: 4,
          }}
        >{status=="processing"?"Transcribing":status=="uploading"?"Uploading":status=="saving"?"Saving":""}</Text>
      )}
    </View>
  );
};

export default ChatBubble;