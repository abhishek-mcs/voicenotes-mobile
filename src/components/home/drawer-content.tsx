import Colors from "assets/Colors";
import { drawerSvg } from "assets/svg/drawerSvg";
import Touchable from "components/common/Touchable";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

export default ({ setFilter = (v: string) => {} }) => {
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch hashtags dynamically from your post data
    // For demo, I'm initializing it with sample data
    const sampleHashtags = ["travel", "food", "nature", "photography"];
    setHashtags(sampleHashtags);
  }, []);

  const handleTagPress = (tag: string) => {
    setFilter(tag);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{ alignItems: "flex-start" }}
        data={hashtags}
        renderItem={({ item, index }) => (
          <Touchable onPress={() => handleTagPress(item)} style={[styles.btn,{
            backgroundColor: index==0?Colors.primaryWithOpacity(0.1):'transparent'}]}>
            <SvgXml xml={drawerSvg.hash} />
            <Text
              style={[
                styles.btnTxt,
                { color: index == 0 ? Colors.primary : Colors.grey },
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
    padding: 20,
    backgroundColor: Colors.primaryWithOpacity(0.1),
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
