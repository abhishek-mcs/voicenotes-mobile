import Colors from "assets/Colors"
import { useEffect } from "react"
import { Text, View, FlatList, StyleSheet, TouchableHighlight } from "react-native"
import { createModalProps } from "."

export default ({recordingList,fetchNextPage,onSelect=(id:number,v:string)=>{}}:createModalProps)=>{
    return (
        <>
            <Text style={heading}>Choose note</Text>
            <FlatList 
            data={recordingList}
            contentContainerStyle={list}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item:any,i)=>`${item.id}-${i}`}
            renderItem={({item})=>(
                <TouchableHighlight onPress={()=>onSelect(item?.id,item?.title)} style={itemContainer} underlayColor={Colors.greyWithOpacity(0.1)}>
                    <>
                    <Text style={titleStyle} numberOfLines={1}>{item?.title}</Text>
                    <Text style={text} numberOfLines={1}>{item?.transcript?.trimEnd()}</Text>
                    </>
                </TouchableHighlight>
            )}
            onEndReachedThreshold={0.5}
            onEndReached={()=>fetchNextPage()}
            />
        </>
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
        fontSize:20,
        fontFamily:"Primary-Medium",
        marginBottom:8,
        paddingHorizontal:8
    },
    itemContainer:{paddingHorizontal:12,paddingVertical:8,borderRadius:12}
})

const {heading,titleStyle,text,list,itemContainer} = styles