import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'context';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimeArrays {
  hours: string[];
  minutes: string[];
  periods: string[];
}

const generateTimeArray = (): TimeArrays => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];
  return { hours, minutes, periods };
};

interface TimePickerWheelProps {
  items: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
  itemHeight?: number;
}

interface WheelItemProps {
  label: string;
  height: number;
  isSelected: boolean;
}

const WheelItem: React.FC<WheelItemProps> = React.memo(({ label, height, isSelected }) => {
  const { Colors } = useTheme();
  
  return (
    <View style={[styles.wheelItem, { height }]}>
      <Text style={[
        styles.wheelItemText,
        { 
          color: Colors.blackWithOpacity(1),
          opacity: isSelected ? 1 : 0.3
        }
      ]}>
        {label}
      </Text>
    </View>
  );
});

const TimePickerWheel: React.FC<TimePickerWheelProps> = ({ 
  items, 
  selectedIndex, 
  onValueChange, 
  itemHeight = ITEM_HEIGHT 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { Colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  // Initial scroll
  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: selectedIndex * itemHeight,
          animated: false,
        });
      }
    });
  }, [selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      onValueChange(index);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    scrollViewRef.current?.scrollTo({
      y: index * itemHeight,
      animated: true,
    });
  };

  return (
    <View style={styles.wheelContainer}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={{ height: PICKER_HEIGHT }}
        contentContainerStyle={{ paddingVertical: PICKER_HEIGHT / 2 - itemHeight / 2 }}
      >
        {items.map((item, index) => (
          <WheelItem
            key={index}
            label={item}
            height={itemHeight}
            isSelected={index === currentIndex}
          />
        ))}
      </ScrollView>
      <View style={[
        styles.wheelHighlight, 
        { 
          height: itemHeight,
          backgroundColor: Colors.blackWithOpacity(0.05)
        }
      ]} pointerEvents='none' />
    </View>
  );
};

interface CustomTimePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  style?: ViewStyle;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ date, onDateChange, style }) => {
  const { Colors } = useTheme();
  const { hours, minutes, periods } = generateTimeArray();
  
  // Calculate initial indices based on the provided date
  const getInitialHourIndex = (hours: number): number => {
    const hour12 = hours % 12;
    return hour12 === 0 ? 11 : hour12 - 1;
  };

  const [selectedHour, setSelectedHour] = useState(() => getInitialHourIndex(date.getHours()));
  const [selectedMinute, setSelectedMinute] = useState(() => date.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(() => date.getHours() >= 12 ? 1 : 0);

  // Update indices when date prop changes
  useEffect(() => {
    setSelectedHour(getInitialHourIndex(date.getHours()));
    setSelectedMinute(date.getMinutes());
    setSelectedPeriod(date.getHours() >= 12 ? 1 : 0);
  }, [date]);

  const updateDate = (hour: number, minute: number, period: number): void => {
    const newDate = new Date(date);
    let hours = hour + 1;
    if (period === 1) { // PM
      hours = hours === 12 ? 12 : hours + 12;
    } else { // AM
      hours = hours === 12 ? 0 : hours;
    }
    newDate.setHours(hours);
    newDate.setMinutes(minute);
    onDateChange(newDate);
  };

  const handleHourChange = (index: number): void => {
    setSelectedHour(index);
    updateDate(index, selectedMinute, selectedPeriod);
  };

  const handleMinuteChange = (index: number): void => {
    setSelectedMinute(index);
    updateDate(selectedHour, index, selectedPeriod);
  };

  const handlePeriodChange = (index: number): void => {
    setSelectedPeriod(index);
    updateDate(selectedHour, selectedMinute, index);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: Colors.white1 },
      style
    ]}>
      <View style={[
        styles.pickerContainer,
        { backgroundColor: Colors.white1 }
      ]}>
        <TimePickerWheel
          items={hours}
          selectedIndex={selectedHour}
          onValueChange={handleHourChange}
        />
        <TimePickerWheel
          items={minutes}
          selectedIndex={selectedMinute}
          onValueChange={handleMinuteChange}
        />
        <TimePickerWheel
          items={periods}
          selectedIndex={selectedPeriod}
          onValueChange={handlePeriodChange}
        />
      </View>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  pickerContainer: ViewStyle;
  wheelContainer: ViewStyle;
  wheelHighlight: ViewStyle;
  wheelItem: ViewStyle;
  wheelItemText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    borderRadius: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    height: PICKER_HEIGHT,
    flex: 1,
    alignItems: 'center',
  },
  wheelHighlight: {
    position: 'absolute',
    top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    width: '100%',
    // zIndex: 1,
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 20,
    fontFamily: 'Primary-Regular',
  }
});

export default CustomTimePicker;