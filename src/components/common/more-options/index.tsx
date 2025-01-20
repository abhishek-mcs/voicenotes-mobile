import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import ContextMenu from "react-native-context-menu-view";
import * as Haptics from "expo-haptics";
import { useTheme } from 'context';
import { isIOS, screenHeight, screenWidth } from 'utils/common';
import { Menu, MenuDivider, MenuItem } from 'react-native-material-menu';
import { Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Icon } from '@rneui/themed';
import { MenuProps } from './menu-props';

export default forwardRef(({options=[],children,style={},isNative=false}:MenuProps,ref) => {
  const [visible, setVisible] = useState(false);
  const [visibleSubMenu, setVisibleSubMenu] = useState(false);
  const [subMenuOptions, setSubMenuOptions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const {isLightMode,Colors} = useTheme()
  const theme = isLightMode? "light" : "dark"
  const styles = useStyles();

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
    setSearchQuery('');
    setSubMenuOptions(v)
    hideMenu()
    setTimeout(() => {
      setVisibleSubMenu(true)
    }, 600);
  }

  const hideSubMenu=()=>{
    setVisible(false)
    setVisibleSubMenu(false)
    setSubMenuOptions([])
    setSearchQuery('');
  }

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return subMenuOptions;
    return subMenuOptions.filter((option: any) => 
      option.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subMenuOptions, searchQuery]);

  const onPress=async()=>
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );

  if(!isIOS&&!isNative){
    return (
      <>
       {!visibleSubMenu? <Menu
          visible={visible}
          onRequestClose={hideMenu}
          anchor={<Pressable onPress={showMenu}>{children}</Pressable>}
          style={{backgroundColor:Colors.bgColor6,borderRadius:8}}
        >
          <ScrollView style={{maxHeight:screenHeight/2}} showsVerticalScrollIndicator={false}>
          {options.map((option:any, index:number) => (
            <MenuItem
              key={index}
              pressColor={Colors.bgColor1}
              style={{borderBottomWidth:(index<options?.length)?0.5:0,borderBottomColor:Colors.border}}
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
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  {option?.androidIcon&&<Icon name={option?.androidIcon} solid={false} type='material-community' color={option.title=="Delete"?Colors.redWithOpacity(1):Colors.text5} size={16} style={{marginRight:8}}/>}
                  <Text style={[{fontFamily:'Primary',fontSize:14,color:Colors.blackWithOpacity(1)},option.title=="Delete"?{color:Colors.redWithOpacity(1)}:{}]}>{option.title}</Text>
                </View>
                {option.actions&&<Icon name='chevron-right' color={Colors.text5} size={16}/>}
              </View>
            </MenuItem>
          ))}
          </ScrollView>
        </Menu>
        :<Menu
              visible={visibleSubMenu}
              onRequestClose={hideSubMenu}
              anchor={<Pressable onPress={showSubMenu}>{children}</Pressable>}
              style={{backgroundColor:Colors.bgColor6, maxHeight: screenHeight/1.5}}
            >
              <ScrollView style={{maxHeight: screenHeight/2}} showsVerticalScrollIndicator={false}>
                {filteredOptions.map((option: any, i: number) => (
                  <MenuItem
                    key={i}
                    pressColor={Colors.border}
                    style={{borderBottomWidth:(i<filteredOptions.length-1)?0.5:0,borderBottomColor:Colors.border}}
                    onPress={async() => {
                        hideSubMenu()
                        await sleep(500)
                        option.onPress && option.onPress();
                    }}
                  >
                  <MenuItem style={{height: 60}} pressColor="transparent">
                    <TextInput
                      placeholder="Search languages..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={styles.searchInput}
                      placeholderTextColor={Colors.text2}
                      autoFocus
                    />
                  </MenuItem>
                  <View style={[{flexDirection:'row',alignItems:'center'},screenWidth<500?{minWidth:screenWidth/3.5}:{}]}>
                      {option?.androidIcon&&<Icon name={option?.androidIcon} solid={false} type='material-community' color={option.title=="Delete"?Colors.redWithOpacity(1):Colors.text5} size={16} style={{marginRight:8}}/>}
                      <Text style={[{fontFamily:'Primary',fontSize:14,color:Colors.blackWithOpacity(1)},option.title=="Delete"?{color:Colors.redWithOpacity(1)}:{}]}>{option.title}</Text>
                  </View>
                  </MenuItem>
                ))}
              </ScrollView>
          </Menu>}
        </>
    );
  }
  return (
    <Pressable onPress={onPress}>
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
    searchInput: {
      height: 36,
      backgroundColor: Colors.inputBg2,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: Colors.text,
      fontFamily: 'Primary',
      fontSize: 14,
      width: '100%'
    }
  }), [Colors]);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));