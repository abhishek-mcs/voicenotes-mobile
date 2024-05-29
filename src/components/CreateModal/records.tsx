import Colors from "assets/Colors"
import { useEffect } from "react"
import { Text, View, FlatList, StyleSheet, TouchableHighlight } from "react-native"
import { createModalProps } from "."
import { screenHeight } from "utils/common"
import { SvgXml } from "react-native-svg"
import { CreateModalSvg } from "assets/svg/CreateModal"

export default ({recordingList,fetchNextPage,onSelect=(id:number,v:string)=>{},selected=null}:createModalProps)=>{
    const isSelected=(id:number)=>selected?.some((v:any)=>v==id)
    return (
        <View style={{flex:1,height:'auto',marginTop:10}}>
            <Text style={heading}><Text style={{color:Colors.grey}}>2.  </Text>Select the note</Text>
            <FlatList 
            data={recordingList}
            contentContainerStyle={list}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item:any,i)=>`${item?.id}-${i}`}
            scrollEnabled={false}
            renderItem={({item})=>(
                <TouchableHighlight onPress={()=>onSelect(item?.id,item?.title)} style={[itemContainer,isSelected(item?.id)?styles.selected:{}]} underlayColor={Colors.greyWithOpacity(0)}>
                    <View style={styles.row}>
                        <View style={{flex:1}}>
                        <Text style={titleStyle} numberOfLines={1}>{item?.title}</Text>
                        <Text style={text} numberOfLines={1}>{item?.transcript?.trimEnd()}</Text>
                        </View>
                        {isSelected(item?.id)&&<SvgXml xml={CreateModalSvg.check} style={{width:24,flex:1,marginRight:-4,marginLeft:8}} />}
                    </View>
                </TouchableHighlight>
            )}
            ListEmptyComponent={()=><View style={itemContainer}><Text style={titleStyle}>You don't have any notes to create with.</Text></View>}
            onEndReachedThreshold={50}
            onEndReached={()=>fetchNextPage()}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    titleStyle:{
        color:Colors.darkWithOpacity(1),
        fontSize:14,
        fontFamily:"Primary",
        marginBottom:8
    },
    text:{
        color:Colors.grey,
        fontSize:14,
        fontFamily:"Primary",
    },
    list:{},
    heading:{
        fontSize:14,
        fontFamily:"Primary-Semibold",
        marginBottom:8,
        marginLeft:-14,
        paddingHorizontal:28
    },
    itemContainer:{paddingHorizontal:16,paddingVertical:8,borderRadius:12,marginHorizontal:15,marginBottom:8},
    selected:{backgroundColor:Colors.darkWithOpacity(0.05),borderRadius:12,overflow:'hidden'},
    row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}
})

const {heading,titleStyle,text,list,itemContainer} = styles