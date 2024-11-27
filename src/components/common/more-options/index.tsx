import { Pressable, StyleSheet, View, } from 'react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";
import Touchable from '../Touchable';
import * as Haptics from "expo-haptics";
import Colors from 'assets/Colors';
import { isIOS, screenWidth, sleep } from 'utils/common';
import { Menu, MenuDivider, MenuItem } from 'react-native-material-menu';
import { Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { settingsSvg } from 'assets/svg/settingsSvg';

export default forwardRef(({options=[],children,style={}}:any,ref) => {
  const [visible, setVisible] = useState(false);
  const [visibleSubMenu, setVisibleSubMenu] = useState(false);
  const [subMenuOptions, setSubMenuOptions] = useState([]);
  useImperativeHandle(ref, () => {
    return {
      show(){setVisible(true)},
      hide(){setVisible(false)}
    }
},[visible]);

const showMenu=()=>{
  setSubMenuOptions([])
  setVisible(true)
}
const hideMenu=()=>{
  setVisible(false)
}
const showSubMenu=async(v:any)=>{
  hideMenu()
  setSubMenuOptions(v)
  setTimeout(() => {
    setVisibleSubMenu(true)
  }, 300);
}
const hideSubMenu=()=>{
  setVisibleSubMenu(false)
}

const onPress=async()=>
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
    () => {}
  );
  if(!isIOS){
    return (
      <>
       {!visibleSubMenu? <Menu
          visible={visible}
          // style={{width:screenWidth/2.1}}
          onRequestClose={hideMenu}
          anchor={<Pressable onPress={showMenu}>{children}</Pressable>}
          animationDuration={250}
        >
          {options.map((option:any, index:number) => (
            <MenuItem
              key={index}
              onPress={async(e) => {
                if (option.actions) {
                  showSubMenu(option?.actions)
                } else {
                  hideMenu()
                  await sleep(500)
                  option.onPress && option.onPress();
                }
              }}
            >
              <View style={[{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},screenWidth<800?{width:screenWidth/2.6}:{}]}>
                <Text style={[{fontFamily:'Primary',fontSize:14,color:Colors.blackWithOpacity(1)},option.title=="Delete"?{color:Colors.redWithOpacity(1)}:{}]}>{option.title}</Text>
                {option.actions&&<SvgXml xml={settingsSvg.arrow} style={{}}/>}
              </View>
            </MenuItem>
          ))}
        </Menu>
        :<Menu
              visible={visibleSubMenu}
              onRequestClose={hideSubMenu}
              anchor={<Pressable onPress={showSubMenu}>{children}</Pressable>}
            >
              {!!subMenuOptions&&subMenuOptions?.map((itm:any, i:number) => (
                <MenuItem
                  key={i}
                  onPress={async() => {
                      hideSubMenu()
                      await sleep(500)
                      itm.onPress && itm.onPress();
                  }}
                >{itm.title}</MenuItem>
              ))}
                </Menu>}
        </>
    );
  }
  return (
    <Pressable onPress={onPress} onLongPress={()=>null}>
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
        </Pressable>
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