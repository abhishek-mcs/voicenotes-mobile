import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Touchable from "components/common/Touchable";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as WebBrowser from "expo-web-browser"
import ControlledTooltip from "components/common/ControlledTooltip";
import { screenWidth } from "utils/common";

export default ({disable=false}) => {
  return null
  return (
    <View style={styles.container}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
      <Text style={styles.title}>A place to dump your thoughts.</Text>
      {/* {!disable&&<Touchable style={{marginTop:4}} onPress={()=>{router.push("/auth/login/loginPassword")}}>
        <SvgXml xml={home.close} />
      </Touchable>} */}
      </View>
      <View style={{ marginTop: 24 }}>
        <Description
          icon={home.recordBlack}
          highlight="Record"
          text={`new ideas, family moments, meetings, podcast takeaways, `}
          text1="anything"
        />
        <Description
          icon={home.askBig}
          highlight="Ask your AI"
          text="to review past notes or brainstorm new ideas. It has perfect memory"
        />
        <Description
          icon={home.createBig}
          highlight="Create"
          text="summary, to-do list, blog post, and more using your notes"
        />
        <View style={{ flexDirection: "row", alignItems: "center" ,marginBottom:12}}>
          <SvgXml xml={home.leaf} />
          <View style={{flexDirection:'row',alignItems:'center',flexWrap:'nowrap'}}>
          <Text style={[styles.highlights,{fontFamily:'Primary',lineHeight:30}]}>
            {`Commitment to `}
            <TextWithTooltip
              tooltip="We built Voicenotes for ourselves and decided to take no shortcuts. All notes are secured on the cloud, not used for AI training, and only retrieved upon authenticated user requests."
              text="privacy,"/>
            {` `}
            <TextWithTooltip
              tooltip="Why is it so rare to see products older than a decade or two? We like products that last a lifetime. To avoid any external influence, Voicenotes is 100% self-funded."
              text="longevity,"/>
            {` `}
            <TextWithTooltip
              tooltip="We are designers first. We like to own and use simple, beautiful things. We go to great lengths to keep Voicenotes as simple as we can. And simplicity takes enormous time and effort."
              text="beauty"/>
            {`. Watch `}
          <Image 
                source={{uri:'https://voicenotes.com/backstory_v1.png'}} 
                style={{width:33,height:22,borderRadius:2}} />
            {` `}
            <Text onPress={()=>WebBrowser.openBrowserAsync("https://www.youtube.com/watch?v=XUOlQSlIUbI")}
                  suppressHighlighting={true}
                  style={{textDecorationLine:'underline'}}>{`our backstory`}</Text>
            .
          </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const Description = ({ highlight = "", text = "", text1="", icon = "",img="",text2="" }) => (
  <View style={{ flexDirection: "row", alignItems: "center" ,marginBottom:12}}>
    <SvgXml xml={icon} />
    <View style={{flexDirection:'row',alignItems:'center',flexWrap:'nowrap'}}>
    <Text style={styles.highlights}>
      <Text style={{ fontFamily:'Primary-Bold' }}>{!!highlight&&`${highlight} `}</Text>
      {text}
      {!!text1&&
      <TextWithTooltip
        text={text1}
        tooltip="We recommend capturing your raw thoughts as freely and as often as you can. In a world where AI can organize and surface your notes when you need them, we believe one should optimize for maximum input."
      />}
      .
    </Text>
    </View>
  </View>
);

const TextWithTooltip = ({text="",tooltip=""}) => (
  <ControlledTooltip
    popover={
      <Text style={{fontFamily:'Primary-Medium',color:Colors.whiteWithOpacity(1),fontSize:12}}>{tooltip}</Text>}
    width={screenWidth/1.5}
    withPointer={false}
    height={110}
    backgroundColor={Colors.blackWithOpacity(1)}>
      <Text style={[styles.highlights,{marginLeft:0,textDecorationLine:'underline'}]}>{text}</Text>
  </ControlledTooltip>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 12,
    padding: 24,
  },
  title: { fontFamily:'Primary-Medium',fontSize: 36, color: Colors.black2, fontWeight: "500" },
  highlights: {
    marginLeft: 26,
    fontFamily:'Primary-Medium',fontSize: 16,
    fontWeight: "400",
    color: Colors.black2,
    lineHeight: 24,
  },
});
