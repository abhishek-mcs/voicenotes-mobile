import { StyleSheet, } from 'react-native';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";
import Touchable from '../Touchable';
import * as Haptics from "expo-haptics";
import { useTheme } from 'context';

export default forwardRef(({options=[],children,style={}}:any,ref) => {
  const [visible, setVisible] = useState(true);
  useImperativeHandle(ref, () => {
    return {
      show(){setVisible(true)},
      hide(){setVisible(false)}
    }
},[visible]);

const onPress=async()=>
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
    () => {}
  );
  return (
    <Touchable activeOpacity={1} onPress={onPress}>
        <ContextMenu
        theme={"dark"}
          actions={options}
          style={style}
          onPress={(e) => {
            options?.map((item:any) => {
              if(item?.actions){
                item?.actions?.map((action:any)=>{
                  if(action?.title==e?.nativeEvent?.name){
                    action?.onPress?.();
                  }
                })
              }else if(item?.title==e?.nativeEvent?.name){
                item?.onPress?.(e?.nativeEvent?.index);
              }
            });
          }}
          dropdownMenuMode
        >
          {children}
        </ContextMenu>
        </Touchable>
      );
});

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: Colors.blue,
    borderRadius: 5,
  },
  buttonText: {
    color: Colors.whiteWithOpacity(1),
  }
}), [Colors]); // Recreate styles when Colors change
};