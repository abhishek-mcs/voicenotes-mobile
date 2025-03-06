import { home } from 'assets/svg/home';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  PanResponderGestureState,
  ScrollView,
  Animated,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;
const EVENT_ITEM_HEIGHT = 25;
const MAX_VISIBLE_ITEMS = 3;

// Utility functions remain the same
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

const generateHighlights = (month: string): Array<string> => {
  const highlights = [
    `${month} had the highest activity this year`,
    `You completed 8 tasks in ${month}`,
    `Your streak increased by 5 days in ${month}`,
    `You ranked in the top 10% of users in ${month}`
  ];
  
  const numberOfHighlights = Math.random() > 0.5 ? 3 : 4;
  return highlights.slice(0, numberOfHighlights);
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
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<{
    date: string;
    items: Array<{ time: string; title: string }>;
  }>({
    date: '',
    items: [],
  });
  
  // Animation values
  const calendarAnimation = useRef(new Animated.Value(0)).current;
  const calendarOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const newActiveDates = generateRandomDatesForMonth(currentMonth);
    setActiveEventDates(newActiveDates);
    
    // Generate highlights for this month
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
    setHighlights(generateHighlights(monthName));
  }, [currentMonth]);

  // Existing utility functions remain the same
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
    // Get day of week (0-6) where 0 is Sunday, then adjust to make Monday=0
    const dayOfWeek = new Date(year, month, 1).getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6
  };

  const generateCalendarDays = (): CalendarDay[][] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days: CalendarDay[] = [];

    // Add empty days for the start of the month (adjusted for Monday-based weeks)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', empty: true });
    }

    // Add the actual days of the month
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

    // Pad the last row to make sure it has 7 cells
    while (cells.length < 7) {
      cells.push({ day: '', empty: true });
    }
    rows.push(cells);

    return rows;
  };

  const changeMonth = (direction: number): void => {
    // Start animation for transition
    Animated.parallel([
      Animated.timing(calendarOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(calendarAnimation, {
        toValue: direction > 0 ? -100 : 100, // Move up or down based on direction
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Update month once animation is complete
      setCurrentMonth(prevMonth => {
        const newMonth = new Date(prevMonth);
        newMonth.setMonth(prevMonth.getMonth() + direction);
        return newMonth;
      });
      
      // Reset states
      setSelectedDate(null);
      setExpandedRowIndex(null);
      setShowAllEvents(false);
      
      // Reset animation values
      calendarAnimation.setValue(direction > 0 ? 100 : -100);
      
      // Animate back in with new month
      Animated.parallel([
        Animated.timing(calendarOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(calendarAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  // Pan responder for vertical swipes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => 
        Math.abs(gestureState.dy) > 10 && 
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (gestureState.dy > 50) {
          changeMonth(-1); // Swipe down for previous month
        } else if (gestureState.dy < -50) {
          changeMonth(1); // Swipe up for next month
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
      setShowAllEvents(false);
    } else {
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      setShowAllEvents(false);

      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Generate more items to test scrolling (5-8 items)
      const numberOfItems = Math.floor(Math.random() * 4) + 5;
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

  const toggleShowAllEvents = () => {
    setShowAllEvents(!showAllEvents);
  };

  const renderWeekdays = (): JSX.Element => {
    // Correct order for Monday-based week
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
          <View style={styles.highlightsContainer}>
            <Text style={styles.highlightsHeader}>Highlights</Text>
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCalendarDays = (): JSX.Element => {
    const calendarRows = generateCalendarDays();
    
    return (
      <Animated.View
        style={[
          styles.daysContainer,
          {
            transform: [{ translateY: calendarAnimation }],
            opacity: calendarOpacity,
          }
        ]}
      >
        {calendarRows.map((row, rowIndex) => (
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
              <View style={styles.expandedContainer}>
                <Text style={styles.dateHeaderText}>{additionalInfo.date}</Text>
                
                {additionalInfo.items.length > 0 && (
                  <View>
                    <View style={styles.eventsContainer}>
                      {/* Show only first 3 items if not showing all */}
                      {additionalInfo.items
                        .slice(0, showAllEvents ? additionalInfo.items.length : Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length))
                        .map((item, index) => (
                          <View key={index} style={styles.eventItem}>
                            <Text style={styles.eventTime}>{item.time}</Text>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                          </View>
                        ))
                      }
                    </View>
                    
                    {/* Show "See all events" button if there are more than MAX_VISIBLE_ITEMS events */}
                    {additionalInfo.items.length > MAX_VISIBLE_ITEMS && (
                      <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={toggleShowAllEvents}
                      >
                        <Text style={styles.seeAllText}>
                          {showAllEvents ? 'Show less' : 'See all events'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    );
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
    overflow: 'hidden',
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
  daysContainer: {
    // Container for the animated days grid
  },
  highlightsButton: {
    backgroundColor: '#e8f5e9',
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
  highlightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 10,
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
  },
  highlightsHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#000',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3d8c40',
    marginRight: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  dateHeaderText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
    color: '#000',
  },
  eventsContainer: {
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    height: EVENT_ITEM_HEIGHT,
  },
  eventTime: {
    width: 80,
    fontSize: 14,
    color: '#888',
  },
  eventTitle: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    flex: 1,
  },
  seeAllButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  seeAllText: {
    fontSize: 12,
    color: '#555',
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