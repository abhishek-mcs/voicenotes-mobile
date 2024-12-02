import { useTheme } from "context"
import React from "react"
import { ColorValue, TextInput, TextInputProps, TextStyle, View, ViewStyle,Text } from "react-native"

// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: { [name: string]: ViewStyle } = {
  default: {},
}

export interface TextFieldProps extends TextInputProps {
  placeholderTx?: string
  placeholder?: string
  labelTx?: string
  label?: string
  style?: ViewStyle | ViewStyle[]
  inputStyle?: TextStyle | TextStyle[]
  preset?: keyof typeof PRESETS
  underlineColorActive?: ColorValue
  underlineColorDeActive?: ColorValue
  errorMessage?: string
  forwardedRef?: any
  leftIcon?: any
  rightIcon?: any
  errorStyle?: any
  validate?: boolean
  labelStyle?:TextStyle[]|TextStyle
}

export function TextField(props: TextFieldProps) {
  const {
    placeholderTx,
    placeholder,
    labelTx,
    label,
    preset = "default",
    style: styleOverride,
    inputStyle: inputStyleOverride,
    forwardedRef,
    underlineColorActive,
    underlineColorDeActive,
    errorMessage,
    labelStyle,
    ...rest
  } = props

  const [hasFocus, setHasFocus] = React.useState(false)
  const { Colors } = useTheme()
  const containerStyle: ViewStyle = {flexDirection:'column'}
  const inputStyle: TextStyle = {marginTop:8,color:Colors.darkWithOpacity(1),borderWidth:1,borderRadius:16,fontFamily:'Primary',fontSize:16,paddingHorizontal:16};
  const actualPlaceholder = placeholderTx ? placeholderTx : placeholder

  return (
    <View style={[containerStyle, styleOverride]}>
      {!!label&&<Text style={[{color:Colors.darkWithOpacity(1),fontFamily:'Primary-Bold',fontSize:16,fontWeight:'bold'},labelStyle]}>{label}</Text>}
      <TextInput
        onFocus={(state) => setHasFocus(true)}
        onBlur={(state) => setHasFocus(false)}
        placeholder={actualPlaceholder}
        autoCapitalize="none"
        {...rest}
        style={[
          inputStyle,
          inputStyleOverride,
          hasFocus ? {borderColor:Colors.primaryDark3(1)} : {borderColor:Colors.primaryWithOpacity(0.1)},
        ]}
        ref={forwardedRef}
      />
      {errorMessage && (
        <Text style={{alignItems:'center',alignSelf:'center',marginTop:4,color:Colors.redWithOpacity(1)}}>{errorMessage}</Text>
      )}
    </View>
  )
}
