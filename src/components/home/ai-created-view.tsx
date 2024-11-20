import CircularLoader from "components/common/loaders/circular-loader";
import Touchable from "components/common/Touchable";
import { useTheme } from "context";
import { setStringAsync } from "expo-clipboard";
import useLayoutAnim from "hooks/anim/useLayoutAnim";
import { useDeleteFormattedNote } from "queries/home";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { capitalizeFirstLetter } from "utils/common";
import { formatDate } from "utils/format-date";

export default ({content,date=undefined,type="Summary",id}:{content:any,date:any,type:string,id:any}) => {
    const [expand,setExpand]=useState(false)
    const [copied,setCopied]=useState(false)
    const [working, setWorking]=useState(false)
    const dt=Date.now()
    const deleteNote=useDeleteFormattedNote(id)
    const { Colors, isLightMode } = useTheme()
    const { container,row,btw,txt,titleStyle,btn,btnTxt } = useStyles()

    const onCopy=async()=>{
      setCopied(true)
      let txtCopy=''
      if(type=="email")
        txtCopy=`Subject: ${content.subject}\n\n${content.body}`
      else if(type=="points"||type=="todo")
        txtCopy=content.join('\n')
      else if(type=="blog")
        txtCopy=content.join('\n')
      else
        txtCopy=content
      await setStringAsync(txtCopy||'');
      setTimeout(() => {
        setCopied(false)
      }, 1000);
    }

    const onDelete=()=>{
      Alert.alert('','Are you sure you want to delete this?',[
        {text:'Cancel',style:'cancel'},
        {text:'Delete',onPress:async()=>{
          setWorking(true)
          await deleteNote.mutateAsync(id)
          setWorking(false)
        }}
      ],{userInterfaceStyle:isLightMode?"light":"dark"})
    }

    useLayoutAnim([expand])

  return (
    <Touchable style={container} onPress={()=>{setExpand(!expand)}} activeOpacity={0.6}>
      <View style={{paddingVertical:4,paddingLeft:12,borderLeftWidth:2,borderLeftColor:Colors.brownWithOpacity(1)}}>
        {/* <View style={{position:'absolute',right:0,top:0,padding:8,paddingHorizontal:12,zIndex:10}}>
            <SvgXml xml={commonSvg.smallArrow}  style={{transform:[{rotate:!expand?'180deg':'360deg'}]}}/>
        </View> */}
        {working?<CircularLoader/>:<>
          <View style={[row,btw]}>
            <Text style={txt}>{type=='tidy'?'Cleanup':`${capitalizeFirstLetter(type)} ${type=='blog'?'post':type=='todo'?'list':''}`}</Text>
          </View>
          {(type=="summary"||type=="tweet"||type=="custom"||type=="tidy")?<Text style={titleStyle} numberOfLines={expand?1000:1}>{content}</Text>
          :(type=="points"||type=="todo")?
          <Text numberOfLines={expand?1000:1} style={{marginTop:6}}>{(!!content&&content?.length>0)&&content.map((itm:string,i:number)=><Text key={i} style={titleStyle}>{`${type=="points"?'\u2022 ':i+1+'. '} ${itm}${content?.length-1==i?'':'\n'}`}</Text>)}</Text>
          :type=="blog"?
          <Text numberOfLines={expand?1000:1} style={{marginTop:6}}>
          {(!!content&&content?.length>0)&&content?.map((itm:string,i:number)=>
              <Text key={i} style={titleStyle}>{itm}</Text>
          )}</Text>
          :<Text numberOfLines={expand?1000:1} style={{marginTop:6}}>
            <Text style={[titleStyle,{fontFamily:'Primary-Medium'}]}>Subject: {content?.subject}</Text>
            <Text style={titleStyle}>{'\n\n'}{content?.body}</Text>
          </Text>}
          {expand&&<View style={[row]}>
          <Touchable style={btn} onPress={onCopy}>
            <Text style={[btnTxt,copied?{color:Colors.darkWithOpacity(1)}:{}]}>{copied?'Copied':'Copy'}</Text>
          </Touchable>
          <Touchable style={[btn,{marginLeft:8}]} onPress={onDelete}>
            <Text style={[btnTxt]}>Delete</Text>
          </Touchable>
          <Text style={[btnTxt,{flex:1,textAlign:'right'}]}>
            {`${capitalizeFirstLetter(type=="tidy"?'cleanup':type)} ${type=='blog'?'post ':type=='todo'?'list ':''}created on ${formatDate(date||dt)}`}
            </Text>
          </View>}
        </>}
      </View>
    </Touchable>
  );
};
const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    marginTop: 4,
    // backgroundColor: Colors.darkWithOpacity(0.05),
    paddingVertical: 8,
    // borderRadius:12,
    width:'100%',flex:1
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
  },
  btw:{justifyContent:'space-between'},
  titleStyle:{fontFamily:'Primary',fontSize:12,color:Colors.darkWithOpacity(1),marginTop:6},
  txt:{color:Colors.darkWithOpacity(1),fontFamily:'Primary-Medium',fontSize:12},
  btn:{paddingRight:8,paddingVertical:8},
  btnTxt:{fontFamily:'Primary',fontSize:11,color:Colors.grey}
}), [Colors]); // Recreate styles when Colors change
};
