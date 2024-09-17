import Colors from "assets/Colors";
import Touchable from "components/common/Touchable";
import { memo } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { capitalizeFirstLetter } from "utils/common";

export const TagButton = ({title="",style={},onPress=()=>{}})=> {
    const dispatch = useDispatch()
    const {hashFilter} = useSelector((state:RootState)=>state.hash)

    const setTag = (tag:string) => {
       dispatch(setTagsFilter(tag))
    }

    const onClickTag=()=>{
      setTag(title);
      onPress();
    }

    return (
        <Touchable style={styles.tagButton} onPress={onClickTag}>
            <Text style={[styles.tagButtonText, style, hashFilter === title ? styles.activeTag:{}]}>{title==""?"All":capitalizeFirstLetter(title)}</Text>
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

export default function TagButtons({hashFilter=""}) {
  return (
    <View style={styles.tagButtonsContainer}>
      <TagButton title="" style={{color:Colors.grey3}}/>
      <TagButton title="shared" style={{color:Colors.grey3}}/>
      <TagButton title="starred" style={{color:Colors.grey3}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  tagButtonsContainer: {
    flexDirection: "row",
    marginTop: 8,
    paddingHorizontal: 17,
  },
  tagButton: {
    height:27,
    paddingHorizontal: 12,
    backgroundColor: Colors.blackWithOpacity(0.05),
    borderRadius: 56,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
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
