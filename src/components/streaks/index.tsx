import { StyleSheet, Text, View } from "react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import ReactNativeModal from "react-native-modal";
import Colors from "assets/Colors";
import { formatDate, getLastSixMonths } from "utils/format-date";
import ControlledTooltip from "components/common/ControlledTooltip";

export default forwardRef(({data=null}:Props, ref) => {
  const [visible, setVisible] = useState(false);

  const previousMonths = getLastSixMonths();

  useImperativeHandle(
    ref,
    () => {
      return {
        open() {
          setVisible(true);
        },
        close() {
          setVisible(false);
        },
        toggle() {
          setVisible(!visible)
        }
      };
    },
    [visible]
  );
  
  
  const onClose=()=>{
    
  }

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", top: 175 }}
      backdropOpacity={0.005}
      hasBackdrop={false}
      coverScreen={false}
      onTouchStart={(e) => e?.stopPropagation()}
    >
      <View style={[styles.modal]}>
        <Text
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
                  marginRight: 24,
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
                      <View style={{backgroundColor:Colors.primaryWithOpacity(itm?.recordings_count==0?0.1:itm?.recordings_count==1?0.25:itm?.recordings_count==2?0.5:itm?.recordings_count==3?0.75:1),width:9,height:9,borderRadius:2,marginBottom:2}}/>
                    </ControlledTooltip>
                  ))}
                </View>
              ))}
            </View>
        </View>
      </View>
    </ReactNativeModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    // justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical:16,
    paddingHorizontal:20,
    shadowColor:"#00000026",
		shadowOpacity: 0.9,
		shadowOffset: { width: 0, height:0 },
		shadowRadius: 1.5,
    zIndex:10,
		elevation: 10,
    height:156
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
    data:any
}