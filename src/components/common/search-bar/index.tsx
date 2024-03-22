import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useState } from "react"
import { commonSvg } from "assets/svg/commonSvg";
import Colors from "assets/Colors";

export default ({searchParam="",setSearchText=(v:string)=>{},setSearchEnabled=(v:boolean)=>{},setSearchParam=(v:string)=>{},searchEnabled=false,type='explore',searchRef=null})=>{
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={[styles.container]} onTouchStart={(e)=>e.stopPropagation()}>
            <View style={[styles.box,isFocused?{borderColor:'#222'}:{borderColor:Colors.darkWithOpacity(0.1)}]}>
              <SvgXml xml={commonSvg.search} style={[{paddingHorizontal:8}]} />
              <View style={{flex:1}}>
                <TextInput
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  textAlignVertical="center"
                  value={searchParam}
                  returnKeyType={"search"}
                  onSubmitEditing={() => {
                    setSearchText(searchParam)
                    if (!searchEnabled&&searchParam!='') setSearchEnabled(true)
                  }}
                  autoFocus={false}
                  onChangeText={(text:string) => {setSearchParam(text);text==''&&setSearchText('')}}
                  placeholder={type=='explore'?"Search creators":"Search"}
                  placeholderTextColor={'#828282'}
                  style={[{color:'#828282',fontFamily:'Primary',fontSize:16,marginLeft:8}]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  ref={(r:any)=>searchRef&&(searchRef=r)}
                />
              </View>
              {searchParam != "" ? (
                <Pressable
                  onPress={() => {
                    setSearchEnabled(false)
                    setSearchParam("")
                    setSearchText("")
                  }}
                >
                  <SvgXml xml={commonSvg.searchClose}/>
                </Pressable>
              ) : null}
            </View>
          </View>
    )
}

const styles=StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        marginTop:16,
        marginHorizontal:0,
        marginBottom:12,
    },
    box:{
        flex:1,
        flexDirection:'row',
        paddingLeft:17,
        paddingRight:16,
        height:40,
        borderRadius:12,
        alignItems:'center',
        borderWidth:1,
        borderColor:Colors.darkWithOpacity(0.1)
    }
})