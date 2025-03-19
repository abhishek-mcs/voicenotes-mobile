import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "context";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedScreen } from "redux/reducers/onboardingData";
import { RootState } from "redux/store/store";
import { isIOS, screenHeight } from "utils/common";

const AnimatedProgressBar = ({ step, totalSteps }: any) => {
  const {Colors}=useTheme()
  const styles = useStyles()
  const dispatch = useDispatch();
  const { note_types } = useSelector((state: RootState) => state.onboardingData);

  const onBackPress = () => {
    if (step == 9 && !note_types.includes(2)) {
      dispatch(setSelectedScreen(7))
    } 
    else if (step == 13) {
      dispatch(setSelectedScreen(11))
    }
    else if (step == 13) {
      dispatch(setSelectedScreen(11))
    }
    else {
      dispatch(setSelectedScreen(step - 1))
    }
  }

  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={29} color={Colors.text5} />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Progress.Bar
          progress={step / totalSteps}
          width={null} // Full width
          height={6}
          color={Colors.black2}
          borderWidth={0}
          borderRadius={5}
          unfilledColor={Colors.bgColor3(0.1)}
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  headerContainer: {
    marginTop: isIOS ? 0 : screenHeight/25,
    backgroundColor: Colors.whiteWithOpacity(1),
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  progressBarContainer: {
    flex: 1,
    marginLeft: 10,
  },
}), [Colors]);
}


export default AnimatedProgressBar;
