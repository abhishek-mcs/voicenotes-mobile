import Touchable from "components/common/Touchable";
import { useTheme } from "context";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";

const TagsList = ({ note, onPress }: any) => {
  const { Colors } = useTheme()
  const styles = useStyles()
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

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  tag: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Primary",
    color: Colors.grey3,
    marginTop: 4,
    marginRight: 4,
    marginLeft: 0,
  },
}), [Colors]); // Recreate styles when Colors change
};
