import { Animated, Easing, StyleSheet, Text, UIManager, View } from "react-native";
import { forwardRef, useEffect, useState } from "react";
import Colors from "assets/Colors";
import { formatDate, getLastSixMonths } from "utils/format-date";
import ControlledTooltip from "components/common/ControlledTooltip";
import { isAndroid, isIOS } from "utils/common";
import { Dimensions } from "react-native";

// Enable LayoutAnimation
if (isAndroid) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default forwardRef(({data=null,visible}:Props, ref) => {
  const [shadowOpacity, setShadowOpacity] = useState(new Animated.Value(0));
  const [opacity, setOpacity] = useState(new Animated.Value(0));
  const previousMonths = getLastSixMonths();

  useEffect(() => {
    Animated.timing(shadowOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      easing:Easing.ease,
      useNativeDriver: false,
    }).start();
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 20,
      easing:Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visible]);
  
  return (
      <Animated.View style={[styles.modal,{height:visible?'auto':0,transform:[{scaleY:visible?1:0}]},visible?{...styles.shadow,shadowOpacity,opacity}:{}]}>
        {visible&&<><Text
          style={{
            fontSize: 14,
            fontFamily: "Primary",
            color: "#222",
            marginBottom: 12,
          }}
        >
          You rank #{data?.rank} out of {data?.total_users} note-takers
        </Text>
        <View>
          <View style={{ flexDirection: "row" }}>
            {previousMonths?.map((itm: any, i: number) => (
              <Text
                key={i}
                style={{
                  fontSize: 10,
                  color: Colors.grey,
                  fontFamily: "Primary",
                  marginRight: 29,
                }}
              >
                {itm}
              </Text>
            ))}
          </View>

          <View style={{flexDirection:'row',marginTop:2}}>
              {data?.weeks?.map((c: any, cIndex: number) => (
                <View key={cIndex+Math?.random()} style={{marginRight:2}}>
                  {c?.map((itm:any, rIndex:number) => (
                    <ControlledTooltip
                    key={rIndex}
                    popover={<Text style={{fontFamily:'Primary',color:'#fff',fontSize:12}}>{formatDate(itm?.date)+' - '+itm?.recordings_count+' notes'}</Text>}
                    width={150}
                    backgroundColor={'#222'}>
                      <View style={{backgroundColor:Colors.primaryWithOpacity(itm?.recordings_count==0?0.1:itm?.recordings_count==1?0.25:itm?.recordings_count==2?0.5:itm?.recordings_count==3?0.75:1),width:11,height:11,borderRadius:2,marginBottom:2}}/>
                    </ControlledTooltip>
                  ))}
                </View>
              ))}
            </View>
        </View></>}
    </Animated.View>
  );
});
const {width} = Dimensions.get("window");
const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical:20,
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
    alignSelf:'center'
  },
  shadow:{
    shadowColor:isIOS?"#00000026":"#00000066",
		shadowOpacity: 0.9,
		shadowOffset: { width: 0, height:0 },
		shadowRadius: 1.5,
    zIndex:10,
		elevation: 10,
    marginBottom:16
  },
  heading:{
      fontSize:20,
      fontFamily:"Primary-Medium",
      marginBottom:8,
      paddingHorizontal:0
  },
  suggestions:{height:'auto',paddingTop:16},
  records:{},
  note:{paddingHorizontal:0,paddingTop:16},
  loader:{justifyContent:'flex-start',paddingTop:36,paddingLeft:28}
});

interface Props{
    data:any,
    visible:boolean
}