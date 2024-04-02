import Colors from "assets/Colors";
import { drawerSvg } from "assets/svg/drawerSvg";
import Touchable from "components/common/Touchable";
import { useGetTags } from "queries/home";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { setHashTags,setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { useRouter } from "expo-router";
import { isIOS } from "utils/common";

export default (props:any) => {
  const {hashTags,hashFilter} = useSelector((state: RootState) => state.hash);
  const dispatch = useDispatch();
  const router = useRouter()
  const [currentTag, setCurrentTag] = useState<string>(hashFilter);

  const getTags=useGetTags()

  useEffect(() => {
    const tags=getTags.data?.data?.flatMap((t:any)=>t?.name)||[];
    dispatch(setHashTags(tags))
  }, [getTags.data]);

  const handleTagPress = (tag: string) => {
    dispatch(setTagsFilter(tag))
    setCurrentTag(tag)
    router.back()
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{ alignItems: "flex-start" }}
        data={['All',...hashTags]}
        renderItem={({ item, index }) => (
          <Touchable onPress={() => handleTagPress(item)} style={[styles.btn,{
            backgroundColor: item==currentTag?Colors.darkWithOpacity(0.1):'transparent'}]}>
            <SvgXml xml={
              item=='All'?
              drawerSvg.home?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):'#717171')
              :item=='starred'?
              drawerSvg.star?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):'#717171')
              :drawerSvg.hash?.replace(/{color}/g,item==currentTag?Colors.darkWithOpacity(1):Colors.grey)
            } />
            <Text
              style={[
                styles.btnTxt,
                { color: item==currentTag ? Colors.darkWithOpacity(1) : Colors.grey },
              ]}
            >{item}</Text>
          </Touchable>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:isIOS?0:20,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  drawerButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  btn: {
    paddingHorizontal: 13,
    height: 30,
    borderRadius: 8,
    marginBottom: 4,
    width: "100%",alignItems:'center',
    flexDirection:'row',
  },
  btnTxt: { fontFamily: "Primary", fontSize: 14, lineHeight: 24 ,marginLeft:8,flex:1},
});
