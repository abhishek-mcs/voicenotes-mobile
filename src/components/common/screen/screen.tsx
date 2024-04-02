import * as React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ScreenProps } from "./screen.props"
import { isNonScrolling, offsets, presets } from "./screen.presets"
import NetInfo from "@react-native-community/netinfo"
import { Text } from "react-native"
import CircularLoader from "../loaders/circular-loader"
import { SvgXml } from "react-native-svg"
import { AIModalSVG } from "assets/svg/AIModalSvg"
import { commonSvg } from "assets/svg/commonSvg"

const isIos = Platform.OS === "ios"

function ScreenWithoutScrolling(props: ScreenProps) {

  const insets = useSafeAreaInsets()
  const preset = presets.fixed
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}
  const insetStyle = { paddingTop: props.unsafe ? 0 : insets.top }
  const navBarStyleBase:any = {flexDirection:'row',justifyContent:'center',paddingHorizontal:16,paddingVertical:16}
  const [isConnected, setIsConnected] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state:any) => {
      setIsConnected(state.isConnected)
    })

    // To unsubscribe to these update, just use:
    return () => unsubscribe()
  }, [])

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none" ]}
    >
      <StatusBar
        backgroundColor={props.statusBarColor ?? "#fff"}
        barStyle={props.statusBar || "dark-content"}
      />
      <View style={[preset.inner, insetStyle]}>
        {isConnected ? (
          <View />
        ) : (
          <View style={{paddingHorizontal:16,paddingVertical:12,backgroundColor:'red',flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{color:'#fff',fontFamily:'Primary-Bold',fontSize:14}}>Internet lost, retrying</Text>
            <CircularLoader width={10} height={10} />
          </View>
        )}
        {props.navigation && (
          <View style={[navBarStyleBase, props.navbarStyle]}>
            <Pressable
              style={{alignSelf:'center',paddingHorizontal:16,paddingVertical:8}}
              onPress={() => props.navigation.goBack()}
            >
              <SvgXml xml={commonSvg.back} />
            </Pressable>
            <View style={{flex:1}} />
          </View>
        )}
        <View style={StyleSheet.compose({flex:1}, style)}>{props.children}</View>
      </View>
    </KeyboardAvoidingView>
  )
}

function ScreenWithScrolling(props: ScreenProps) {

  const insets = useSafeAreaInsets()
  const preset = presets.scroll
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}
  const insetStyle = { paddingTop: props.unsafe ? 0 : insets.top }
  const navBarStyleBase:any ={flexDirection:'row',justifyContent:'center',marginHorizontal:32,paddingVertical:16}
  const [isConnected, setIsConnected] = React.useState(true)
  
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state:any) => {
      setIsConnected(state.isConnected)
    });
    
    // To unsubscribe to these update, just use:
    return () => (unsubscribe())
  },[]);

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <StatusBar
        backgroundColor={props.statusBar ?? '#fff'}
        barStyle={props.statusBar || "dark-content"}
      />

      <View style={[preset.outer, backgroundStyle, insetStyle]}>
        {isConnected ? (
          <View />
        ) : (
          <View style={{paddingHorizontal:16,paddingVertical:12,backgroundColor:'red',flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{color:'#fff',fontFamily:'Primary-Bold',fontSize:14}}>Internet lost, retrying</Text>
            <CircularLoader width={10} height={10}/>
          </View>
        )}
        {props.navigation && (
          <View style={[navBarStyleBase, props.navbarStyle, props.navbarStyle]}>
            <Pressable style={{paddingRight:16,alignSelf:'center'}} onPress={() => props.navigation.goBack()}>
              <SvgXml xml={commonSvg.back} />
            </Pressable>
            <View style={{flex:1}} />
          </View>
        )}
        <ScrollView
          style={[preset.outer, backgroundStyle]}
          contentContainerStyle={StyleSheet.compose(preset.inner, style)}
        >
          {props.children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export function Screen(props: ScreenProps) {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />
  } else {
    return <ScreenWithScrolling {...props} />
  }
}
