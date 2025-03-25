import { Text, TouchableHighlight, ActivityIndicator, View } from 'react-native'
import { SvgXml } from "react-native-svg"
import { useTheme } from 'context'

interface Props{
    text:string
    onPress:()=>void
    style:object
    underlayColor:string
    color?:string
    isLoading?:boolean
    startIcon?: any
    endIcon?: any
    centerIcon?: any
}

const LargeButton = ({text, onPress, style, underlayColor, color, isLoading=false, startIcon, endIcon, centerIcon}: Props) => {
    const {Colors}=useTheme()

  return (
    <TouchableHighlight
      underlayColor={underlayColor}
      style={style}
      onPress={onPress}>
        { !isLoading ? 
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12 }}>
              {startIcon ? <SvgXml xml={startIcon} />  : <View style={{ width: 24}}></View> }
              <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                {centerIcon && <SvgXml xml={centerIcon} /> }
                <Text style={[{fontFamily:'Primary-Semibold',fontSize:16, alignSelf: 'center' },color?{color}:{color:Colors.grey2WithOpacity(1)}]}>
                    {text}
                </Text>
              </View>
                
            {endIcon ? <SvgXml xml={endIcon} /> : <View style={{ width: 24}}></View> }
            </View> 
            : 
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <ActivityIndicator size={"small"} color={color} />
            </View>
        }
    </TouchableHighlight>
  )
}

export default LargeButton