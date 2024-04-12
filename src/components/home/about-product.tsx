import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as WebBrowser from "expo-web-browser"

export default ({disable=false}) => {
  return (
    <View style={styles.container}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
      <Text style={styles.title}>A place to dump your thoughts.</Text>
      {!disable&&<Touchable style={{marginTop:4}} onPress={()=>{router.push("/auth/login/loginPassword")}}>
        <SvgXml xml={home.close} />
      </Touchable>}
      </View>
      <View style={{ marginTop: 20 }}>
        <Description
          icon={home.recordBlack}
          highlight="Record"
          text="to capture your thoughts, family moments, lectures, new ideas, anything."
        />
        <Description
          icon={home.ask}
          highlight="Ask your AI"
          text="about your past notes, how you felt, your ideas, or for feedback."
        />
        <Description
          icon={home.create}
          highlight="Create"
          text="summary, blog posts, tweet, to-do list, and more with your notes."
        />
        <Description
          icon={home.leaf}
          highlight=""
          text="Commitment to privacy, longevity, and beauty."
        />
        
        <Touchable 
            style={{flexDirection:'row',marginBottom:12}}
            onPress={()=>WebBrowser.openBrowserAsync("https://www.youtube.com/watch?v=XUOlQSlIUbI")}>
            <Image 
                source={{uri:'https://voicenotes.com/backstory.png'}} 
                style={{width:50,height:40,marginTop:-8,transform:[{scale:0.7}]}} />
            <Text style={[styles.highlights,{marginTop:0,marginLeft:2}]}>Watch out backstory.</Text>
        </Touchable>
        <Text style={styles.highlights}>
            Go ahead, record your first voice note (no sign-up required).
        </Text>
      </View>
    </View>
  );
};

const Description = ({ highlight = "", text = "", icon = "",img="",text2="" }) => (
  <View style={{ flexDirection: "row", alignItems: "flex-start" ,marginBottom:12}}>
    <SvgXml xml={icon} />
    <View style={{flexDirection:'row',alignItems:'center',flexWrap:'nowrap'}}>
    <Text style={styles.highlights}>
      <Text style={{ fontWeight: "700",fontFamily:'Primary-Bold' }}>{!!highlight&&`${highlight} `}</Text>
      {text}
    </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 12,
    padding: 20,
  },
  title: { fontFamily:'Primary-Semibold',fontSize: 24, color: "#000", fontWeight: "600" },
  highlights: {
    marginLeft: 8,
    fontFamily:'Primary',fontSize: 16,
    fontWeight: "400",
    color: "#000",
    lineHeight: 22,
    marginTop: -4,
  },
});
