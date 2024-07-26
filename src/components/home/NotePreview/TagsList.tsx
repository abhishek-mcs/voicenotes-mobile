import { StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";


const TagsList = ({ note, onPress }: any) => {
  const dispatch = useDispatch();
  return (
    note?.tags?.length > 0 && (
      <View style={ { flexWrap: "wrap", flexDirection: "row" }}>
        {note?.tags?.map((tag: any, i: number) => (
          <Text
            key={i}
            style={styles.tag}
            onPress={(tag: any) => dispatch(setTagsFilter(tag?.name))}
            suppressHighlighting
          >
            {"#" + tag?.name}
          </Text>
        ))}
      </View>
    )
  );
};

export default TagsList

const styles = StyleSheet.create({
    tag: {
        fontSize: 14,
        lineHeight: 19,
        fontFamily: 'Primary',
        color: '#717171',
        marginTop: 4,
        marginRight: 4,
        marginLeft: 0
      },
})