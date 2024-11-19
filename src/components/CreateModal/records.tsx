import { useEffect, useMemo } from "react"
import { Text, View, FlatList, StyleSheet, TouchableHighlight } from "react-native"
import { createModalProps } from "."
import { screenHeight } from "utils/common"
import { SvgXml } from "react-native-svg"
import { CreateModalSvg } from "assets/svg/CreateModal"
import { useTheme } from "context"

const Records = ({recordingList=[],fetchNextPage=()=>{},onSelect=(id:number,v:string)=>{},selected=null}:createModalProps)=>{
    const isSelected=(id:number)=>selected?.some((v:any)=>v==id)
    const filteredRecordingList = recordingList.filter(item => (item.transcript && item.title))
    const { Colors } = useTheme()
    const {heading,titleStyle,text,list,itemContainer,row} = useStyles()
    return (
        <View style={{flex:1,height:'auto',marginTop:10}}>
            <Text style={heading}><Text style={{color:Colors.grey}}>2.  </Text>Select the note</Text>
            <FlatList 
            data={filteredRecordingList}
            contentContainerStyle={list}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item:any,i)=>`${item?.id}-${i}`}
            scrollEnabled={false}
            renderItem={({item})=>(
                <TouchableHighlight onPress={()=>onSelect(item?.id,item?.title)} style={[itemContainer,isSelected(item?.id)?selected:{}]} underlayColor={Colors.greyWithOpacity(0)}>
                    <View style={row}>
                        <View style={{flex:1}}>
                        <Text style={titleStyle} numberOfLines={1}>{item?.title}</Text>
                        <Text style={text} numberOfLines={1}>{item?.transcript?.trimEnd()}</Text>
                        </View>
                        {isSelected(item?.id)&&<SvgXml xml={CreateModalSvg.check} style={{width:24,flex:1,marginRight:-4,marginLeft:8}} />}
                    </View>
                </TouchableHighlight>
            )}
            ListEmptyComponent={()=><View style={itemContainer}><Text style={titleStyle}>You don't have any notes to create with.</Text></View>}
            onEndReachedThreshold={0.2}
            onEndReached={fetchNextPage}
            />
        </View>
    )
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    titleStyle:{
        color:Colors.text5,
        fontSize:14,
        fontFamily:"Primary",
        marginBottom:8
    },
    text:{
        color:Colors.grey7,
        fontSize:14,
        fontFamily:"Primary",
    },
    list:{},
    heading:{
        fontSize:14,
        fontFamily:"Primary-Semibold",
        marginBottom:8,
        marginLeft:-14,
        paddingHorizontal:28,
        color:Colors.text
    },
    itemContainer:{paddingHorizontal:16,paddingVertical:8,borderRadius:12,marginHorizontal:15,marginBottom:8},
    selected:{backgroundColor:Colors.darkWithOpacity(0.05),borderRadius:12,overflow:'hidden'},
    row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}
}), [Colors]); // Recreate styles when Colors change
};

export default Records