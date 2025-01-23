import { useTheme } from "context";
import { Linking, Text, TextStyle } from "react-native";

const urlRegex = /(https?:\/\/[^\s]+)/g;

export const TextComponent = ({text,style={},numberOfLines}:{text: string, style: TextStyle|TextStyle[],numberOfLines:number}) => {
  if (!text) return null;

  const { Colors } = useTheme()
  
  const parts = text.split(urlRegex);
  
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <Text
              key={index}
              style={[style, { textDecorationLine: 'underline' }]}
              onPress={() => Linking.openURL(part)}
              suppressHighlighting={true}
            >
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};