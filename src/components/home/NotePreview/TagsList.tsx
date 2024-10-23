import Colors from "assets/Colors";
import Touchable from "components/common/Touchable";
import { StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";

const TagsList = ({ note, onPress }: any) => {
  const dispatch = useDispatch();
  return (
    note?.tags?.length > 0 && (
      <View style={{ flexWrap: "wrap", flexDirection: "row" }}>
        {note?.tags?.map((tag: any, i: number) => (
          <Touchable key={i} onPress={() => dispatch(setTagsFilter(tag?.name))} activeOpacity={0.6}>
            <Text style={styles.tag} suppressHighlighting>
              {"#" + tag?.name}
            </Text>
          </Touchable>
        ))}
      </View>
    )
  );
};

export default TagsList;

const styles = StyleSheet.create({
  tag: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Primary",
    color: Colors.grey3,
    marginTop: 4,
    marginRight: 4,
    marginLeft: 0,
  },
});
