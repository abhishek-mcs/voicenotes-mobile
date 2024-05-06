import React, { useEffect, useMemo, useState } from "react";
import { Animated, Easing, StyleSheet, Text, UIManager, View, Dimensions, Platform } from "react-native";
import Colors from "assets/Colors";
import { formatDate, getLastSixMonths } from "utils/format-date";
import ControlledTooltip from "components/common/ControlledTooltip";
import { isAndroid } from "utils/common";
import { FlatList } from "react-native";

if (isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default ({data=null, visible }: Props) => {
  const [shadowOpacity] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const previousMonths = getLastSixMonths();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(shadowOpacity, {
        toValue: visible ? 1 : 0,
        duration: 350,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 20,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.modal, visible && styles.visible, { shadowOpacity, opacity }]}>
      {visible && (
        <>
          <Text style={styles.rankText}>
            You rank #{data?.rank} out of {data?.total_users} note-takers
          </Text>
          <View style={styles.monthsContainer}>
            {previousMonths?.map((month: string, index: number) => (
              <Text key={index} style={styles.monthText}>
                {month}
              </Text>
            ))}
          </View>
          <View style={styles.weeksContainer}>
            {data?.weeks?.flatMap((week: any, weekIndex: number) => (
          <View key={weekIndex+Math.random()} style={styles.weekContainer}>
            <FlatList
            data={week}
            scrollEnabled={false}
            initialNumToRender={7}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => 
              <ControlledTooltip
                popover={<Text style={styles.tooltipText}>{formatDate(item?.date)} - {item?.recordings_count} notes</Text>}
                width={150}
                backgroundColor={'#222'}>
                <View style={[styles.dayIndicator, { backgroundColor: Colors.primaryWithOpacity(getOpacity(item?.recordings_count)) }]} />
              </ControlledTooltip>
            }
            />
            </View>))}
          </View>
        </>
      )}
    </Animated.View>
  );
};

const getOpacity = (count: number) => {
  if (count === 0) return 0.1;
  else if (count === 1) return 0.25;
  else if (count === 2) return 0.5;
  else if (count === 3) return 0.75;
  else return 1;
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  modal: {
    ...Platform.select({
      ios: {
        shadowColor: "#00000026",
        shadowOpacity: 0.9,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 1.5,
      },
      android: {
        elevation: 10,
      },
    }),
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  visible: {
    opacity: 1,
  },
  rankText: {
    fontSize: 14,
    fontFamily: "Primary",
    color: "#222",
    marginBottom: 12,
  },
  monthsContainer: {
    flexDirection: "row",
    marginLeft:10
  },
  monthText: {
    fontSize: 10,
    color: Colors.grey,
    fontFamily: "Primary",
    marginRight: 29,
  },
  weeksContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  weekContainer: {
    marginRight: 2,
  },
  dayIndicator: {
    width: 11,
    height: 11,
    borderRadius: 2,
    marginBottom: 2,
  },
  tooltipText: {
    fontFamily: 'Primary',
    color: '#fff',
    fontSize: 12,
  },
});

interface Props {
  data: any;
  visible: boolean;
}