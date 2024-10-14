import Colors from "assets/Colors";
import { settingsSvg } from "assets/svg/settingsSvg";
import Touchable from "components/common/Touchable";
import { useNavigation, useRouter } from "expo-router";
import { useLogout } from "queries/auth";
import { SafeAreaView, Text, TouchableHighlight, View, Alert, StyleSheet, ScrollView, Animated, PanResponder, Dimensions, BackHandler, Keyboard, Linking } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Wb from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { languages } from "utils/constants/languages";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { useSaveSettings } from "queries/settings";
import { isIOS, screenWidth } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { setLang, setUserDetail } from "redux/reducers/userDetails";
import { currentVersion } from "services/api/api-constants";
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Name from "components/settings/name";
import About from "components/settings/about";
import Email from "components/settings/email";
import Names from "components/settings/names";
import Password from "components/settings/password";
import ProfilePic from "components/settings/profilepic";

/*
  Right now, expo-router doesn't seem to offer a preset animation within a formSheet. There is ofc an option to open a formSheet within one.
  But we can't have that since it destroys the design. So, we've implemented a custom hook to take care of that for us, which is
  useAnimatedScreens. It takes care of animating the different screens into view & hiding them, with a nice iOS-like animation.
  This is ofc too much code for accomplishing something so straightforward, but there doesn'e seem to be another way around right now.
  If expo starts supporting having a stack of screens within a formSheet in the future, all this drama can be avoided & simplified.
*/

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const useAnimatedScreens = () => {
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animations = useRef(new Map<string, Animated.Value>()).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAnimation = useCallback((screen: string) => {
    if (!animations.has(screen)) {
      animations.set(screen, new Animated.Value(SCREEN_WIDTH));
    }
    return animations.get(screen)!;
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const showScreen = useCallback((screen: string) => {
    if (isAnimating) {
      return;
    }
    if (activeScreen === screen) {
      return;
    }
  
    setIsAnimating(true);
    const animation = getAnimation(screen);
  
    setActiveScreen(screen);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start(() => {
      resetTimeout();
      setIsAnimating(false);
    });
  }, [getAnimation, activeScreen, isAnimating]);
  
  const hideScreen = useCallback(() => {
    if (isAnimating) {
      return;
    }
  
    Keyboard.dismiss();
    setIsAnimating(true);
    // if (!activeScreen) {
    //   return;
    // }
    const animation = getAnimation(activeScreen??'');
  
    Animated.spring(animation, {
      toValue: SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start(() => {
      setActiveScreen(null);
      resetTimeout();
      setIsAnimating(false);
    });
  }, [getAnimation, activeScreen, isAnimating]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const shouldCapture = !isAnimating && activeScreen !== null && gestureState.dx > 20 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
        return shouldCapture;
      },
      onPanResponderMove: (_, gestureState) => {
        if (activeScreen && !isAnimating) {
          const animation = getAnimation(activeScreen);
          animation.setValue(Math.max(0, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (activeScreen && !isAnimating) {
          setIsAnimating(true);
          const animation = getAnimation(activeScreen);
          if (gestureState.dx > SCREEN_WIDTH / 3) {
            Animated.spring(animation, {
              toValue: SCREEN_WIDTH,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }).start(() => {
              setActiveScreen(null);
              resetTimeout();
            });
          } else {
            Animated.spring(animation, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }).start(() => {
              resetTimeout();
            });
          }
        }
      },
    })
  ).current;

  return { showScreen, hideScreen, getAnimation, activeScreen, panResponder, isAnimating };
};

export default () => {
  const router = useRouter();
  const navigation = useNavigation()

  const logout=useLogout()
  const {userDetails,lang}:any=useSelector((state: RootState) => state.userDetails);
  const settings:any=userDetails.settings
  const saveSettings=useSaveSettings()
  const dispatch=useDispatch()

  const { showScreen, hideScreen, getAnimation, activeScreen, panResponder, isAnimating } = useAnimatedScreens();

  const renderScreen = (name: string, Component: React.ComponentType<any>) => {
    const isActive = activeScreen === name;
    const animation = getAnimation(name);

    return (
      <Animated.View
        key={name}
        {...(isActive ? panResponder.panHandlers : {})}
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX: animation }],
            zIndex: isActive ? 2 : 0,
            elevation: isActive ? 2 : 0,
            backgroundColor: '#F2F2F7',
            opacity: animation.interpolate({
              inputRange: [0, SCREEN_WIDTH],
              outputRange: [1, 0],
            }),
          },
        ]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <Component onClose={hideScreen} />
      </Animated.View>
    );
  };

  const onLogout = () =>{
    
    Alert.alert('',"Are you sure you want to log out?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>{
        await AsyncStorage.removeItem('isLoggedIn');
        await logout.mutateAsync('').catch(()=>{})
        dispatch(setTempIsIAPPurchased(false))
        router?.back();
    }
    }])
  }

  const onDelete = () =>{
    Alert.alert('',"Are you sure you wish to delete your account?",
    [{
      text:"Cancel",
      style:"cancel"
    },{
      text:"Yes",
      onPress:async()=>Wb.openBrowserAsync('https://tally.so/r/3xpBey')
    }])
  }

  const feedback = () =>Wb.openBrowserAsync('https://kyls3j7z4tt.typeform.com/to/Fn4bRdxT?typeform-source=voicenotes.com')
  const onSelectLang=(code='en')=>{
    dispatch(setLang(languages[code]))
    saveSettings.mutate({
      language:code,
      about:settings?.about,
      remember_words:settings?.remember_words||[],
      name:userDetails?.name,
      fix_punctuation:settings?.fix_punctuation,
    })
  }
  
  useEffect(() => {
    if(!!userDetails?.settings?.language){
      dispatch(setLang(languages[userDetails?.settings?.language]))
    }else{
      dispatch(setLang(languages['']))
    }
  },[userDetails?.settings])

  // for android back button only
  useEffect(() => {
    const onBackPress = () => {
      if (activeScreen && !isAnimating) {
        hideScreen();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => backHandler.remove();
  }, [activeScreen, isAnimating, hideScreen]);
  
  // in case the user tries to navigate back using the device back button
  // not for android
  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      if (activeScreen && !isAnimating) {
        e.preventDefault();
        hideScreen();
      }
    });
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F7', paddingTop: isIOS ? 0 : 40 }}>
      <View style={{ flex: 1, zIndex: 1, elevation: 1 }} pointerEvents={activeScreen || isAnimating ? 'none' : 'auto'}>
        <Touchable onPress={() => router.back()} style={{padding:12, alignSelf:'flex-end', marginRight: 2}} activeOpacity={0.6}>
          <SvgXml xml={settingsSvg.close} width={30} height={30} />
        </Touchable>
        <ProfilePic 
          url={userDetails?.photo_url || ""}
          onChange={photo_url => {
            dispatch(setUserDetail({ ...userDetails, photo_url }))
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
        <Grouped 
          title="ACCOUNT"
          items={[
            {title:'Name', onPress: () => showScreen('name'), value:userDetails?.name||'', rightIcon:settingsSvg.arrow},
            {title:'About', onPress: () => showScreen('about'), value:userDetails?.about||'', rightIcon:settingsSvg.arrow},
            {title:'Email', onPress: () => showScreen('email'), value:userDetails?.email||'', rightIcon:settingsSvg.arrow},
            {title:'Change password', onPress: () => showScreen('password'), value:'', rightIcon:settingsSvg.arrow},
            {title: 'Your plan', onPress: () => router.push('/plan/'), value: userDetails.subscription_plan || '', rightIcon:settingsSvg.arrow}
          ]}
        />
        <Grouped
          title="APP"
          items={[
            {title: 'Language', isMenu:true, data:Object.entries(languages), value:lang, onPressMenu:onSelectLang},
            {title:'Names to remember', value:'', onPress: () => showScreen('names'), rightIcon:settingsSvg.arrow},
            {title:'FAQ', value:'', onPress: () => Linking.openURL('https://help.voicenotes.com/en/articles/9271900-frequently-asked-questions'), rightIcon:settingsSvg.arrow}
          ]} 
        />
        <Grouped 
          title="MORE"
          items={[
            {title:'Delete account', value:'', onPress:onDelete, rightIcon:settingsSvg.arrow},
            {title:'Share feedback', value:'', onPress:feedback, rightIcon:settingsSvg.arrow},
            {title:'Sign out', value:'', onPress:onLogout, style:{color:'#FF453A'}, leftIcon:settingsSvg.signOut},
          ]}
        />
        <View style={{alignSelf:'center'}}>
          <Text style={{fontFamily:'Primary-Medium', fontSize:14, color:Colors.grey}}>Version {currentVersion}</Text>
        </View>
        </ScrollView>
      </View>
      
      {renderScreen('name', Name)}
      {renderScreen('about', About)}
      {renderScreen('email', Email)}
      {renderScreen('names', Names)}
      {renderScreen('password', Password)}
    </SafeAreaView>
  );
}

const Grouped=({title,items}:{title:string,items:any})=>{
  const [showMenu,setShowMenu]=useState(false)
  const onShowMenu=()=>setShowMenu(true)
  const onHideMenu=()=>setShowMenu(false)
  return (
    <View style={{marginBottom:20}}>
    <Text style={{fontFamily:'Primary-Medium',fontSize:12,color:Colors.grey,marginLeft:32,marginBottom:8}}>{title}</Text>
    <View style={{marginHorizontal:16,borderRadius:12,backgroundColor:'#fff',overflow:'hidden'}}>
    {items?.map((item:any,index:number)=>
    <View key={index}>
    <TouchableHighlight onPress={item?.isMenu?onShowMenu:item?.onPress} underlayColor={Colors.greyWithOpacity(0.12)} style={{overflow:'hidden',padding:16,paddingBottom:index!=items?.length-1?12:16}}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <View style={{flexDirection:'row',flex:1}}>
        {!!item?.leftIcon&&<SvgXml xml={item?.leftIcon}  style={{marginRight:9}}/>}
        <Text style={[{fontFamily:'Primary-Medium',fontSize:14,color:'#000'},item?.style??{}]}>{item.title}</Text>
        </View>
        <View style={{flexDirection:'row',gap:4,alignSelf:'center',alignItems:"center",justifyContent:'flex-end'}}>
        {item?.isMenu?
        <Menu visible={showMenu}
        onRequestClose={onHideMenu}
        anchor={
        <View style={{flexDirection:'row',alignItems:'center',marginRight:-7}}>
          <Text style={styles.rightTxt} numberOfLines={1}>{item?.value}</Text>
          <SvgXml xml={settingsSvg.optionArrow}  />
        </View>
        }
        style={{height:'40%',marginTop:36,right:0,width:'60%'}}
        animationDuration={200}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {item?.data?.map((t:string,v:number)=>
          <View key={v}>
            <MenuItem onPress={()=>{
              onHideMenu()
              item?.onPressMenu(t[0])
              }} style={{paddingRight:60}}>
              {t[1]}
            </MenuItem>
            {v<item?.data?.length&&<MenuDivider/>}
          </View>
          )}
            </ScrollView>
        </Menu>
        :
          item?.value && <Text style={[styles.rightTxt, {width: item?.value ? '75%' : screenWidth/2}]} numberOfLines={1}>{item?.value}</Text>
        }
        {item?.rightIcon && <SvgXml xml={item?.rightIcon} />}
        </View>
      </View>
    </TouchableHighlight>
    {index!=items?.length-1&&<View style={{marginHorizontal:16}}><View style={{height:1,backgroundColor:'rgba(221, 221, 221, 0.87)',width:'100%'}}/></View>}
    </View>)}
    </View>
</View>
)}

const styles=StyleSheet.create({
  rightTxt:{
    fontFamily:'Primary-Medium',
    fontSize:14,
    color:Colors.grey,
    textAlign:'right'
  }
})