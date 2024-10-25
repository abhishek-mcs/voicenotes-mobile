import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import Colors from 'assets/Colors';
import ReactNativeModal from "react-native-modal";
import { formatDate } from "utils/format-date";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RECT_SIZE = 11;
const RECT_MARGIN = 2;

interface Props {
  data: any;
}

export default forwardRef(({ data = null }: Props, ref) => {
  const [shadowOpacity] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ visible: false, text: '', position: { x: 0, y: 0 } });
  const [monthLabels, setMonthLabels] = useState<string[]>([]);

  const weeks = useMemo(() => data?.weeks || [], [data]);

  useEffect(() => {
    if (weeks.length > 0) {
      const startDate = new Date(weeks[0][0].date);
      const endDate = new Date(weeks[weeks.length - 1][weeks[weeks.length - 1].length - 1].date);
      setMonthLabels(getMonthLabels(startDate, endDate));
    }
  }, [weeks]);

  const getMonthLabels = (start: Date, end: Date) => {
    const labels = [];
    const current = new Date(start);
    while (current <= end) {
      labels.push(current.toLocaleString('default', { month: 'short' }));
      current.setMonth(current.getMonth() + 1);
    }
    return labels;
  };

  const containerWidth = weeks.length * (RECT_SIZE + RECT_MARGIN);
  const scale = Math.min(1, SCREEN_WIDTH / containerWidth);

  useEffect(() => {
    Animated.timing(shadowOpacity, {
      toValue: visible ? 1 : 0,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
    close() {
      onClose();
    },
    toggle() {
      hideTooltip();
      setVisible(!visible);
    },
  }));

  const getOpacity = (count: number) => {
    if (count === 0) return Colors.green4WithOpacity(0.1);
    if (count === 1) return Colors.green4WithOpacity(0.25);
    if (count === 2) return Colors.green4WithOpacity(0.5);
    if (count === 3) return Colors.green4WithOpacity(0.75);
    return Colors.green4WithOpacity(1);
  };

  const showTooltip = (item: any, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    let x = pageX - 75;
    let y = pageY - 160;
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    if (x < 0) x = 0;
    if (x + 150 > screenWidth) x = screenWidth - 180;
    
    setTooltipData({
      visible: true,
      text: `${formatDate(item.date)} - ${item.recordings_count} notes`,
      position: { x, y }
    });
  };

  const hideTooltip = () => {
    tooltipData.visible && setTooltipData(prev => ({ ...prev, visible: false }));
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={"slideInDown"}
      animationOut={"slideOutUp"}
      animationInTiming={100}
      animationOutTiming={100}
      hideModalContentWhileAnimating={true}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0}
      avoidKeyboard
      hasBackdrop={true}
      coverScreen={false}
    >
      <View>
        <View style={[styles.container, styles.shadow]}>
          <Text style={styles.rankText}>
            You rank {data?.rank} out of {data?.total_users} note-takers
          </Text>
          <View style={styles.streaksWrapper}>
            <View style={[styles.monthLabelsContainer, { transform: [{ scale }] }]}>
              {monthLabels.map((month, index) => (
                <Text key={index} style={styles.monthLabel}>
                  {month}
                </Text>
              ))}
            </View>
            <View style={[styles.streaksContainer, { transform: [{ scale }] }]}>
              {weeks.map((week: any[], weekIndex: React.Key | null | undefined) => (
                <View key={weekIndex} style={styles.weekColumn}>
                  {week.map((day: { recordings_count: number; }, dayIndex: React.Key | null | undefined) => (
                    <Pressable
                      key={dayIndex}
                      style={[
                        styles.dayRect,
                        { backgroundColor: getOpacity(day.recordings_count) }
                      ]}
                      onPress={(e) => showTooltip(day, e)}
                    />
                  ))}
                </View>
              ))}
            </View>
            {tooltipData.visible && (
              <Animated.View style={[styles.tooltip, {
                left: tooltipData.position.x,
                top: tooltipData.position.y,
                opacity: shadowOpacity
              }]}>
                <Text style={styles.tooltipText}>{tooltipData.text}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </ReactNativeModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-start",
    position: 'relative',
    marginTop: 45
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "105%",
    alignSelf: "center",
  },
  shadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 40,
    elevation: 4,
  },
  rankText: {
    fontSize: 14,
    fontFamily: "Primary",
    color: "#222",
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
  },
  streaksWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: RECT_SIZE / 2,
  },
  monthLabel: {
    fontSize: 10,
    color: Colors.grey,
    fontFamily: 'Primary',
    width: 4 * (RECT_SIZE + RECT_MARGIN),
    textAlign: 'center',
  },
  streaksContainer: {
    flexDirection: 'row',
  },
  weekColumn: {
    marginRight: RECT_MARGIN,
  },
  dayRect: {
    width: RECT_SIZE,
    height: RECT_SIZE,
    borderRadius: 2,
    marginBottom: RECT_MARGIN,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 4,
    minWidth: 130,
    zIndex: 1000
  },
  tooltipText: {
    fontFamily: 'Primary',
    color: '#fff',
    fontSize: 12,
  },
});
