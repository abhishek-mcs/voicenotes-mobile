import { home } from 'assets/svg/home';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  PanResponderGestureState,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;
const EVENT_ITEM_HEIGHT = 20; // Approximate height of a single event item
const MAX_VISIBLE_ITEMS = 3;

// Utility function to generate random dates for the current month
const generateRandomDatesForMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const numberOfDates = Math.floor(Math.random() * 6) + 5;
  const dates: Date[] = [];
  
  for (let i = 0; i < numberOfDates; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    dates.push(new Date(year, month, day));
  }
  
  return dates;
};

interface CalendarDay {
  day: number | string;
  date?: Date;
  empty: boolean;
  hasEvent?: boolean;
}

interface ExpandableCalendarProps {
  initialDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const ExpandableCalendar: React.FC<ExpandableCalendarProps> = ({
  initialDate = new Date(),
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [activeEventDates, setActiveEventDates] = useState<Date[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<{
    date: string;
    items: Array<{ time: string; title: string }>;
  }>({
    date: '',
    items: [],
  });

  useEffect(() => {
    const newActiveDates = generateRandomDatesForMonth(currentMonth);
    setActiveEventDates(newActiveDates);
  }, [currentMonth]);

  const isDateActive = (date?: Date): boolean => {
    if (!date || !activeEventDates.length) return false;
    return activeEventDates.some(
      (activeDate) =>
        activeDate.getDate() === date.getDate() &&
        activeDate.getMonth() === date.getMonth() &&
        activeDate.getFullYear() === date.getFullYear()
    );
  };

  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[][] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days: CalendarDay[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', empty: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i
      );
      days.push({
        day: i,
        date: currentDate,
        empty: false,
        hasEvent: isDateActive(currentDate),
      });
    }

    const rows: CalendarDay[][] = [];
    let cells: CalendarDay[] = [];

    days.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        rows.push(cells);
        cells = [];
      }
      cells.push(day);
    });

    while (cells.length < 7) {
      cells.push({ day: '', empty: true });
    }
    rows.push(cells);

    return rows;
  };

  const changeMonth = (direction: number): void => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + direction);
      return newMonth;
    });
    setSelectedDate(null);
    setExpandedRowIndex(null);
  };

  const handleSwipe = (direction: number) => {
    changeMonth(direction);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => 
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (gestureState.dx > 50) {
          handleSwipe(-1);
        } else if (gestureState.dx < -50) {
          handleSwipe(1);
        }
      },
    })
  ).current;

  const handleDateSelect = (date: Date, rowIndex: number): void => {
    if (
      selectedDate &&
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    ) {
      setSelectedDate(null);
      setExpandedRowIndex(null);
      setAdditionalInfo({ date: '', items: [] });
    } else {
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);

      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const numberOfItems = Math.floor(Math.random() * 4) + 2;
      const items = Array.from({ length: numberOfItems }, (_, i) => ({
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.floor(
          Math.random() * 60
        )
          .toString()
          .padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        title: `Event ${i + 1} for ${dateString}`,
      }));

      setAdditionalInfo({
        date: dateString,
        items,
      });

      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };

  const renderWeekdays = (): JSX.Element => {
    const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
      <View style={styles.weekdayContainer}>
        {weekdays.map((day, index) => (
          <Text key={index} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  const renderMonthHeader = (): JSX.Element => {
    const monthName = currentMonth.toLocaleDateString('en-US', {
      month: 'long',
    });

    return (
      <View>
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity
            style={styles.highlightsButton}
            onPress={() => setShowHighlights(!showHighlights)}
          >
            <SvgXml xml={home.highlights} />
            <Text style={styles.highlightsText}>
              {showHighlights ? 'Hide highlights' : 'View highlights'}
            </Text>
          </TouchableOpacity>
        </View>
        {showHighlights && (
          <View style={styles.expandedContainer}>
            <Text>Highlights</Text>
            <ScrollView style={{ maxHeight: 150 }}>
              {activeEventDates.map((date, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={styles.eventTime}>
                    {date.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                  <Text style={styles.eventTitle}>Has events planned</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCalendarDays = (): JSX.Element[] => {
    const calendarRows = generateCalendarDays();
    
    return calendarRows.map((row, rowIndex) => (
      <View key={rowIndex}>
        <View style={styles.calendarRow}>
          {row.map((item, dayIndex) => (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.calendarDay,
                item.empty ? styles.emptyDay : null,
                item.hasEvent ? styles.activeDay : null,
                selectedDate && 
                !item.empty && 
                item.date &&
                selectedDate.getDate() === item.date.getDate() && 
                selectedDate.getMonth() === item.date.getMonth() && 
                selectedDate.getFullYear() === item.date.getFullYear() ? 
                  styles.selectedDay : null
              ]}
              disabled={item.empty || !item.hasEvent}
              onPress={() => item.empty || !item.date || !item.hasEvent ? null : handleDateSelect(item.date, rowIndex)}
            >
              <Text 
                style={[
                  styles.calendarDayText,
                  selectedDate && 
                  !item.empty && 
                  item.date &&
                  selectedDate.getDate() === item.date.getDate() && 
                  selectedDate.getMonth() === item.date.getMonth() && 
                  selectedDate.getFullYear() === item.date.getFullYear() ? 
                    styles.selectedDayText : null
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {expandedRowIndex === rowIndex && (
          <View style={[
            styles.expandedContainer,
            // No need for additional height styles here, handled in the StyleSheet
          ]}>
            <Text style={styles.dateHeaderText}>{additionalInfo.date}</Text>
            {additionalInfo.items.length <= MAX_VISIBLE_ITEMS ? (
              // If 3 or fewer items, render them directly without ScrollView
              <View style={styles.eventsList}>
                {additionalInfo.items.map((item, index) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventTime}>{item.time}</Text>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                  </View>
                ))}
              </View>
            ) : (
              // If more than 3 items, use ScrollView with limited height
              <ScrollView 
                style={[styles.expandedScrollView, { height: EVENT_ITEM_HEIGHT * MAX_VISIBLE_ITEMS }]}
                contentContainerStyle={styles.expandedScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {additionalInfo.items.map((item, index) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventTime}>{item.time}</Text>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    ));
  };

  const renderStreakFooter = (): JSX.Element => {
    return (
      <View style={styles.streakContainer}>
        <SvgXml xml={home.fire} />
        <Text style={styles.streakText}>
          You are on a 15-day streak and rank 111 globally.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {renderMonthHeader()}
      {renderWeekdays()}
      {renderCalendarDays()}
      {renderStreakFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CALENDAR_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  monthText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000',
  },
  highlightsButton: {
    backgroundColor: '#006F300D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  highlightsText: {
    color: '#3d8c40',
    fontSize: 14,
    fontWeight: '500',
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  weekdayText: {
    fontSize: 15,
    color: '#000',
    width: (CALENDAR_WIDTH - 32) / 7,
    textAlign: 'center',
    fontWeight: '500',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  calendarDayText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  activeDay: {
    backgroundColor: '#f5f5f5',
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  expandedContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    borderColor: '#f0f0f0',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Remove fixed maxHeight to let it size naturally for ≤3 items
  },
  
  eventsList: {
    // This will be used for ≤3 items, natural height
  },
  
  expandedScrollView: {
    // Height will be set dynamically based on EVENT_ITEM_HEIGHT * MAX_VISIBLE_ITEMS
  },
  
  expandedScrollContent: {
    paddingVertical: 4,
  },
  
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    height: EVENT_ITEM_HEIGHT, // Fixed height for consistent sizing
  },
  
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#000',
  },
  eventTime: {
    width: 80,
    fontSize: 14,
    color: '#888',
  },
  eventTitle: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  streakContainer: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  streakText: {
    fontSize: 13,
    color: '#555',
  },
});

export default ExpandableCalendar;