import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Colors from "assets/Colors";
import { formatDate, getLastSixMonths } from "utils/format-date";
import ControlledTooltip from "components/common/ControlledTooltip";
import { isAndroid, isIOS } from "utils/common";
import { Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { transform } from "@babel/core";
import ReactNativeModal from "react-native-modal";
import { Rect, Svg } from "react-native-svg";
import { Tooltip } from "@rneui/base";
import { Shadow } from "react-native-shadow-2";

// Enable LayoutAnimation
if (isAndroid) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const RECT_SIZE = 11;
const RECT_MARGIN = 2;
const RECTS_PER_ROW = 7;

const StreakRect = React.memo(({ opacity, onPress }:any) => (
  <Pressable
  onPress={onPress}
    style={{backgroundColor:Colors.primaryWithOpacity(opacity),width:11,height:11,borderRadius:2,marginRight:2,marginBottom:2}}
  />
));

export default forwardRef(({ data = null }: Props, ref) => {
  const [shadowOpacity, setShadowOpacity] = useState(new Animated.Value(0));
  const [opacity, setOpacity] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);
  const previousMonths = getLastSixMonths();
  const [tooltipData, setTooltipData] = useState({ visible: false, text: '', position: { x: 0, y: 0 } });
  const containerRef = useRef<View>(null);

  const getOpacity = (count: number) => {
    if (count === 0) return Colors.green4WithOpacity(0.1);
    if (count === 1) return Colors.green4WithOpacity(0.25);
    if (count === 2) return Colors.green4WithOpacity(0.5);
    if (count === 3) return Colors.green4WithOpacity(0.75);
    return Colors.green4WithOpacity(1);
  };

  const showTooltip = (item: any, event: any) => {
    event.persist(); // This ensures the event object doesn't get reused
    const { target, pageX, pageY } = event.nativeEvent;
    if (containerRef.current) {
      containerRef.current.measure((fx, fy, width, height, px, py) => {
        // Calculate position relative to the container
        const x = pageX-0;
        const y = pageY-0;

        setTooltipData({
          visible: true,
          text: `${formatDate(item.date)} - ${item.recordings_count} notes`,
          position: { x, y }
        });
      });
    }
  };

  const hideTooltip = () => {
    tooltipData.visible&&setTooltipData(prev => ({ ...prev, visible: false }));
  };


  // useEffect(() => {
  //   Animated.timing(shadowOpacity, {
  //     toValue: visible ? 1 : 0,
  //     duration: 350,
  //     easing:Easing.ease,
  //     useNativeDriver: false,
  //   }).start();
  //   Animated.timing(opacity, {
  //     toValue: visible ? 1 : 0,
  //     duration: 20,
  //     easing:Easing.ease,
  //     useNativeDriver: false,
  //   }).start();
  // }, [visible]);

  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        open() {
          console.log("s");
          setVisible(true);
        },
        close() {
          onClose();
        },
        toggle() {
          hideTooltip()
          setVisible(!visible);
        },
      };
    },
    [visible]
  );

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"slideInDown"}
      animationOut={"slideOutUp"}
      animationInTiming={100}
      animationOutTiming={100}
      hideModalContentWhileAnimating={true}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-start" ,position:'relative',marginTop:45}}
      backdropOpacity={0}
      avoidKeyboard
      hasBackdrop={true}
      coverScreen={false}
      // onTouchStart={(e)=>{console.log(e?.nativeEvent.pageX,'hello')}}
    ><View style={{position:'relative'}}>
     {/* <View style={[styles.shadow,{width:10,height:10,borderRadius:20,backgroundColor:'#fff',position:'absolute',top:12,right:60}]}/>
     <View style={[styles.shadow,{width:20,height:20,borderRadius:20,backgroundColor:'#fff',position:'absolute',top:25,right:65}]}/> */}
        <View ref={containerRef} style={[styles.modal, styles.shadow]} onTouchStart={()=>{hideTooltip()}}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Primary",
              color: "#222",
              marginBottom: 12,
              textAlign:'left',
              width:'100%',
              marginLeft:18.5
            }}
          >
            You rank {data?.rank} out of {data?.total_users} note-takers
          </Text>
          <View style={{width:'97%',alignItems:'center'}}>
            <View style={{ flexDirection: "row",justifyContent:'flex-start',width:'102%',marginLeft:18.5,marginBottom:4 }}>
              {previousMonths?.map((itm: any, i: number) => (
                <Text
                  key={i}
                  style={{
                    fontSize: 10,
                    color: Colors.grey,
                    fontFamily: "Primary",
                    marginRight: 31,
                  }}
                >
                  {itm}
                </Text>
              ))}
            </View>
          <View style={{flexDirection:'row',marginTop:2,position:'relative'}}>
              {data?.weeks?.map((c: any, cIndex: number) => (
                <View key={cIndex+Math?.random()} style={{marginRight:2}}>
                  {c?.map((itm:any, rIndex:number) => (
                    <View onTouchStart={(e)=>showTooltip(itm,e)} style={{backgroundColor:getOpacity(itm?.recordings_count),width:12,height:12,borderRadius:2,marginBottom:2}} key={rIndex}/>
                  ))}
                </View>
              ))}
            </View>

          </View>
        </View>
              {/* <View style={{backgroundColor:'red',zIndex:100000,position:'absolute',width:150,top:tooltipData.position.x,left:tooltipData.position.y+0}}>
                  <Text>{tooltipData.text}</Text>
              </View> */}
        </View>
    </ReactNativeModal>
  );
});
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "105%",
    alignSelf: "center",
    zIndex: 10000,
    position:'relative'
  },
  shadow: {
    shadowColor:"#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius:40,
    elevation: 4,
    zIndex: 10,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Primary-Medium",
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  suggestions: { height: "auto", paddingTop: 16 },
  records: {},
  note: { paddingHorizontal: 0, paddingTop: 16 },
  loader: { justifyContent: "flex-start", paddingTop: 36, paddingLeft: 28 },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 4,
    minWidth: 150,
    zIndex:1000
  },
  tooltipText: {
    fontFamily: 'Primary',
    color: '#fff',
    fontSize: 12,
  },
});

interface Props {
  data: any;
}
