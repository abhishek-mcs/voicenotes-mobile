import React, { useState, useEffect } from "react";
import { View, Text, TextStyle } from "react-native";
import { capitalizeFirstLetter, screenWidth } from "utils/common";
import { RenderHTML } from "react-native-render-html";
import PulsatingCircle from "./PulsatingCircle";
import Colors from "assets/Colors";

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
      interval = setInterval(() => {
        setDisplayedMessage(message?.substring(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex === message.length || currentIndex === 350) {
          disableGenerating();
          interval && clearInterval(interval);
        }
      }, 30); // Adjust the interval for faster typing speed
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

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={[style, {}]} numberOfLines={lines}>
        {displayedMessage}
      </Text>
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