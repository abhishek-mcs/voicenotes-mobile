import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import MoreOptions from "components/common/more-options";
import Touchable from "components/common/Touchable";
import { usePinTag, usePinTagDelete } from "queries/home";
import { memo } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { capitalizeFirstLetter } from "utils/common";

export const TagButton = ({title="",style={},onPress=()=>{},icon=''})=> {
    const dispatch = useDispatch()
    const {hashFilter} = useSelector((state:RootState)=>state.hash)

    const setTag = (tag:string) => {
       dispatch(setTagsFilter(tag))
    }

    const onClickTag=()=>{
      if(!!icon){
        onPress()
      }else{
        setTag(title);
        onPress();
      }
    }

    return (
        <Touchable style={styles.tagButton} onPress={onClickTag}>
            <Text style={[styles.tagButtonText, style, hashFilter === title ? styles.activeTag:{}]}>{title==""?"All":capitalizeFirstLetter(title)}</Text>
            {!!icon&&<SvgXml xml={icon}/>}
        </Touchable>
        )
}

export const ShowMoreTagsButton = ({title="Show More",onPress=()=>{}})=> {
    return (
        <Touchable style={styles.tagButton} onPress={onPress}>
            <Text style={[styles.tagButtonText,{color:Colors.grey3}]}>{title}</Text>
        </Touchable>
        )
}

export default function TagButtons({hashFilter="",pinnedTags=[],pinnedTagsData=[]}:{hashFilter:any,pinnedTags:any,pinnedTagsData:any}) {
  const isPinned=pinnedTags?.length>0
  const id = pinnedTagsData?.find((v: any) => v?.name === hashFilter)?.id || null;
  const pinTagMutation=usePinTag(id)
  const pinTagDelete=usePinTagDelete(id)
  const queryClient=useQueryClient()
  const dispatch=useDispatch()
  const options=[
    {
      title:"Unpin",
      systemIcon:'mappin.slash',
      onPress:()=>{
        pinTagMutation.mutate({is_pinned:false},{
          onSuccess:async()=>await queryClient.resetQueries('all-tags')
        })
      }
    },
    {
      title:"Delete",
      destructive:true,
      systemIcon:'trash',
      onPress:()=>
        Alert.alert('','Are you sure you want to delete?',
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () =>{
                pinTagDelete.mutate('',{
                  onSuccess:async()=>{
                    dispatch(setTagsFilter(''))
                    await queryClient.resetQueries('all-tags')
                  }
                })
                
              }
            },
          ])
    }
  ]
  return (
    <View style={styles.tagButtonsContainer}>
      <ScrollView contentContainerStyle={{paddingRight:17}} horizontal showsHorizontalScrollIndicator={false}>
        <TagButton title="" style={{color:Colors.grey3}}/>
        <TagButton title="shared" style={{color:Colors.grey3}}/>
        <TagButton title="starred" style={{color:Colors.grey3}}/>
        {isPinned&&pinnedTags?.map((v:any)=>
          <TagButton key={v} title={v} style={{color:Colors.grey3}}/>
        )}
      </ScrollView>
      {isPinned&&pinnedTags?.includes(hashFilter)&&
        <MoreOptions options={options}  style={{padding:8}}>
          <SvgXml xml={home.moreNew}/>
        </MoreOptions>
      }
    </View>
  );
}

export const SingleTagButton = ({hashFilter='',tagsData=[]}:{hashFilter:any,tagsData:any}) => {
  const dispatch = useDispatch()
  const id = tagsData?.find((v: any) => v?.name === hashFilter)?.id || null;
  const pinTagMutation=usePinTag(id)
  const pinTagDelete=usePinTagDelete(id)
  const queryClient=useQueryClient()
  const options=[
    {
      title:"Pin",
      systemIcon:'mappin',
      onPress:()=>{
        pinTagMutation.mutate({is_pinned:true},{
          onSuccess:async()=>await queryClient.resetQueries('all-tags')
        })
      }
    },
    {
      title:"Delete",
      destructive:true,
      systemIcon:'trash',
      onPress:()=>
        Alert.alert('','Are you sure you want to delete?',
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () =>{
                pinTagDelete.mutate('',{
                  onSuccess:async()=>{
                    dispatch(setTagsFilter(''))
                    await queryClient.resetQueries('all-tags')
                  }
                })
                
              }
            },
          ])
    }
  ]
  return (
    <View style={[styles.tagButtonsContainer,{justifyContent:'space-between'}]}>
      <TagButton
        title={hashFilter}
        onPress={() => dispatch(setTagsFilter(""))}
        icon={home.smallClose}
      />
      <MoreOptions options={options}  style={{padding:8}}>
        <SvgXml xml={home.moreNew}/>
      </MoreOptions>
    </View>
  );
};

const styles = StyleSheet.create({
  tagButtonsContainer: {
    flexDirection: "row",
    marginTop: 8,
    paddingLeft: 17,
    alignItems:'center'
  },
  tagButton: {
    height:32,
    paddingHorizontal: 12,
    backgroundColor: Colors.blackWithOpacity(0.05),
    borderRadius: 56,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection:'row',
    alignSelf:'flex-start',
    gap:6
  },
  tagButtonText: {
    fontSize: 14,
    fontFamily: "Primary-Medium",
    color: Colors.black2,
  },
  activeTag: {
    color: Colors.black2,
  }
});
