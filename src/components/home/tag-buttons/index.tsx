import Colors from "assets/Colors";
import Touchable from "components/common/Touchable";
import { StyleSheet } from "react-native";
import { Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";

export default function TagButtons({hashFilter=""}) {
    const dispatch = useDispatch()

    const setTag = (tag:string) => {
       dispatch(setTagsFilter(tag))
    }
  return (
    <View style={styles.tagButtonsContainer}>
      <Touchable style={styles.tagButton} onPress={() => setTag("")}>
        <Text style={[styles.tagButtonText, hashFilter === "" ? styles.activeTag:{}]}>All</Text>
      </Touchable>
      <Touchable style={styles.tagButton} onPress={() => setTag("shared")}>
        <Text style={[styles.tagButtonText, hashFilter === "shared" ? styles.activeTag:{}]}>Shared</Text>
      </Touchable>
      <Touchable style={styles.tagButton} onPress={() => setTag("starred")}>
        <Text style={[styles.tagButtonText, hashFilter === "starred" ? styles.activeTag:{}]}>Starred</Text>
      </Touchable>
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
    color: Colors.grey3,
  },
  activeTag: {
    color: Colors.black2,
  }
});
