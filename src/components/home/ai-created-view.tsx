import Colors from "assets/Colors";
import { commonSvg } from "assets/svg/commonSvg";
import Touchable from "components/common/Touchable";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { capitalizeFirstLetter } from "utils/common";
import { formatDate } from "utils/format-date";

export default ({content,date=undefined,type="Summary"}:{content:any,date:any,type:string}) => {
    const [expand,setExpand]=useState(false)
    const dt=Date.now()
  return (
    <View style={container}>
        <Touchable onPress={()=>{setExpand(!expand)}} style={{position:'absolute',right:0,top:0,padding:8,paddingHorizontal:12,zIndex:10}}>
            <SvgXml xml={commonSvg.smallArrow}  style={{transform:[{rotate:!expand?'180deg':'360deg'}]}}/>
        </Touchable>
      <View style={[row,btw]}>
        <Text style={txt}>{`${capitalizeFirstLetter(type)} created on ${formatDate(date||dt)}`}</Text>
      </View>
      {(type=="summary"||type=="tweet")?<Text style={titleStyle} numberOfLines={expand?1000:1}>{content}</Text>
      :(type=="points"||type=="todo")?
      <Text numberOfLines={expand?1000:1} style={{marginTop:4}}>{content?.map((itm:string,i:number)=><Text key={i} style={titleStyle}>{`${type=="points"?'\u2022 ':i+1+'. '} ${itm}`}</Text>)}</Text>
      :type=="blog"?
      <Text numberOfLines={expand?1000:1}>
      {content?.map((itm:string,i:number)=>
          <Text key={i} style={titleStyle}>{itm}</Text>
      )}</Text>
      :<Text numberOfLines={expand?1000:1} style={{marginTop:4}}>
        <Text style={[titleStyle,{fontFamily:'Primary-Medium'}]}>Subject: {content?.subject}</Text>
        <Text style={titleStyle}>{'\n\n'}{content?.body}</Text>
      </Text>}
    </View>
  );
};
const { container,row,btw,txt,titleStyle } = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: Colors.darkWithOpacity(0.05),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius:12,
    width:'100%',flex:1
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
  },
  btw:{justifyContent:'space-between'},
  titleStyle:{fontFamily:'Primary',fontSize:16,color:'#222',marginTop:4},
  txt:{color:Colors.grey,fontFamily:'Primary',fontSize:12}
});
