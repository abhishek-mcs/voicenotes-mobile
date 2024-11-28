import { Pressable, ScrollView, StyleSheet, useColorScheme, } from 'react-native';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";
import * as Haptics from "expo-haptics";
import { useTheme } from 'context';
import { isIOS, screenHeight, screenWidth, sleep } from 'utils/common';
import { Menu, MenuItem } from 'react-native-material-menu';
import { Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { settingsSvg } from 'assets/svg/settingsSvg';
import { View } from 'react-native';

export default forwardRef(({options=[],children,style={},isNative=false}:any,ref) => {
  const [visible, setVisible] = useState(false);
  const [visibleSubMenu, setVisibleSubMenu] = useState(false);
  const [subMenuOptions, setSubMenuOptions] = useState([]);
  const {isLightMode,Colors} = useTheme()
  const theme = isLightMode? "light" : "dark"

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
  if(!isIOS&&!isNative){
    return (
      <>
       {!visibleSubMenu? <Menu
          visible={visible}
          // style={{width:screenWidth/2.1}}
          onRequestClose={hideMenu}
          anchor={<Pressable onPress={showMenu}>{children}</Pressable>}
          animationDuration={250}
          style={{backgroundColor:Colors.bgColor6}}
        >
          {options.map((option:any, index:number) => (
            <MenuItem
              key={index}
              pressColor={Colors.border}
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
              <View style={[{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},screenWidth<500?{width:screenWidth/2.4}:{}]}>
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
              style={{backgroundColor:Colors.bgColor6}}
            >
              {!!subMenuOptions&&subMenuOptions?.map((itm:any, i:number) => (
                <MenuItem
                  key={i}
                  pressColor={Colors.border}
                  onPress={async() => {
                      hideSubMenu()
                      await sleep(500)
                      itm.onPress && itm.onPress();
                  }}
                  textStyle={{color:Colors.text}}
                >{itm.title}</MenuItem>
              ))}
          </Menu>}
        </>
    );
  }
  return (
    <Pressable onPress={onPress} onLongPress={()=>null}>
        <ContextMenu
          theme={theme}
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