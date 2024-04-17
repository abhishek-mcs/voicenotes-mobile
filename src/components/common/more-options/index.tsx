import {Menu,MenuItem} from 'react-native-material-menu';
import { Pressable, StyleSheet, Text } from 'react-native';
import { View } from 'react-native';
import menuProps from './menu-props';
import { SvgXml } from 'react-native-svg';
import { forwardRef, useImperativeHandle, useState } from 'react';

export default forwardRef(({title='',options=[]}:{title:string,options:menuProps[]},ref) => {
  const [visible, setVisible] = useState(true);
  useImperativeHandle(ref, () => {
    return {
      show(){setVisible(true)},
      hide(){setVisible(false)}
    }
},[visible]);
  return (
    <Menu
          visible={visible}
          onRequestClose={()=>{setVisible(false)}}
          anchor={<Pressable onPress={()=>setVisible(true)}><Text>{title}</Text></Pressable>}
        >
       {options?.map((itm:any,index:number) =>
       <MenuItem style={itm?.style} onPress={itm?.onPress}>
          {itm?.title}
        </MenuItem>)}
        </Menu>
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