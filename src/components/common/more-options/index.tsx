import { StyleSheet, } from 'react-native';
import { forwardRef, useImperativeHandle, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";
import Touchable from '../Touchable';

export default forwardRef(({options=[],children,style={}}:any,ref) => {
  const [visible, setVisible] = useState(true);
  useImperativeHandle(ref, () => {
    return {
      show(){setVisible(true)},
      hide(){setVisible(false)}
    }
},[visible]);
  return (
    <Touchable>
        <ContextMenu
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

const { button, buttonText } = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  }
})