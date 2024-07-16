import { StyleSheet, } from 'react-native';
import { forwardRef, useImperativeHandle, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";

export default forwardRef(({options=[],children}:any,ref) => {
  const [visible, setVisible] = useState(true);
  useImperativeHandle(ref, () => {
    return {
      show(){setVisible(true)},
      hide(){setVisible(false)}
    }
},[visible]);
  return (
        <ContextMenu
          actions={options}
          onPress={(e) => {
            options?.map((item:any) => {
              if(item?.title==e?.nativeEvent?.name){
                item?.onPress?.();
              }
            });
          }}
          dropdownMenuMode
        >
          {children}
        </ContextMenu>
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