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
  Animated,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;
const EVENT_ITEM_HEIGHT = 25;
const MAX_VISIBLE_ITEMS = 3;
const EXPAND_ANIMATION_DURATION = 200;
const EXPAND_HEIGHT = 200;
const SNAP_ANIMATION_DURATION = 200; // Increased for smoother transitions
const TRANSITION_OFFSET = 300; // Vertical offset for month transitions
const HEIGHT_ANIMATION_DURATION = 100; // Duration for height animations

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

interface MonthData {
  date: Date;
  days: CalendarDay[][];
  eventDates: Date[];
}

interface ExpandableCalendarProps {
  initialDate?: Date;
}

const ExpandableCalendar: React.FC<ExpandableCalendarProps> = ({
  initialDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<{
    date: string;
    items: Array<{ time: string; title: string }>;
  }>({
    date: '',
    items: [],
  });
  
  // Base height for the calendar without any expansions
  const [baseHeight, setBaseHeight] = useState(260);
  
  // Replace static height with animated height
  const animatedHeight = useRef(new Animated.Value(260)).current;

  // State for carousel-like months
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);

  const highlightsContainerRef = useRef<View>(null);
  const [highlightsHeight, setHighlightsHeight] = useState(0);
  
  // Animation values
  const monthsAnimation = useRef(new Animated.Value(0)).current;
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  // Generate months data (prev, current, next)
  useEffect(() => {
    const generateMonthsData = (baseMonth: any) => {
      const prevMonth = new Date(baseMonth);
      prevMonth.setMonth(baseMonth.getMonth() - 1);
      
      const nextMonth = new Date(baseMonth);
      nextMonth.setMonth(baseMonth.getMonth() + 1);
      
      const months = [prevMonth, baseMonth, nextMonth];
      return months.map((month, index) => {
        const eventDates = generateRandomDatesForMonth(month);
        const days = generateCalendarDays(month, eventDates);
        if(index === 1) {
          // Animate to the new base height instead of immediately setting it
          const newBaseHeight = days.length > 5 ? 300 : 260;
          setBaseHeight(newBaseHeight);
        }
        return {
          date: new Date(month),
          days,
          eventDates
        };
      });
    };
    
    // Initial setup, only run once
    if (monthsData.length === 0) {
      setMonthsData(generateMonthsData(currentMonth));
      const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
      setHighlights(generateHighlights(monthName));
    }
  }, []);

  // Update animatedHeight when baseHeight changes
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: baseHeight + expandedHeight,
      duration: HEIGHT_ANIMATION_DURATION,
      useNativeDriver: false, // Height animations can't use native driver
    }).start();
  }, [baseHeight, expandedHeight]);

  // Utility functions
  const isDateActive = (date: Date | undefined, activeDates: Date[]): boolean => {
    if (!date || !activeDates.length) return false;
    return activeDates.some(
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

  const generateCalendarDays = (date: Date, activeDates: Date[]): CalendarDay[][] => {
    const daysInMonth = getDaysInMonth(date);
    const firstDayOfMonth = getFirstDayOfMonth(date);
    const days: CalendarDay[] = [];

    // Add empty days for the start of the month (adjusted for Monday-based weeks)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', empty: true });
    }

    // Add the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        i
      );
      days.push({
        day: i,
        date: currentDate,
        empty: false,
        hasEvent: isDateActive(currentDate, activeDates),
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
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Reset selection states when changing month
    setSelectedDate(null);
    setExpandedRowIndex(null);
    setShowAllNotes(false);
    
    // Smoothly animate height back to base height when changing month
    setExpandedHeight(0);
    
    // Animate the transition
    const toValue = direction > 0 ? -TRANSITION_OFFSET : TRANSITION_OFFSET;
    
    Animated.timing(monthsAnimation, {
      toValue,
      duration: SNAP_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Update both related states together
      setCurrentMonth(prevMonth => {
        const newMonth = new Date(prevMonth);
        newMonth.setMonth(prevMonth.getMonth() + direction);
        
        // Update months data based on the new month
        const prevOfNew = new Date(newMonth);
        prevOfNew.setMonth(newMonth.getMonth() - 1);
        
        const nextOfNew = new Date(newMonth);
        nextOfNew.setMonth(newMonth.getMonth() + 1);
        
        const months = [prevOfNew, newMonth, nextOfNew];
        const newMonthsData = months.map((month, index) => {
          const eventDates = generateRandomDatesForMonth(month);
          const days = generateCalendarDays(month, eventDates);
          if(index === 1) {
            // Animate to the new base height instead of immediately setting it
            const newBaseHeight = days.length > 5 ? 300 : 260;
            setBaseHeight(newBaseHeight);
          }
          return {
            date: new Date(month),
            days,
            eventDates
          };
        });
        
        setMonthsData(newMonthsData);
        
        // Generate highlights for the new month
        const monthName = newMonth.toLocaleDateString('en-US', { month: 'long' });
        setHighlights(generateHighlights(monthName));
        
        return newMonth;
      });
      
      // Reset animation value without animation
      monthsAnimation.setValue(0);
      isAnimating.current = false;
    });
  };

  // Pan responder for vertical swipes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => 
        Math.abs(gestureState.dy) > 10 && 
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Respond directly to user's swipe for more fluid interaction
        if (!isAnimating.current) {
          monthsAnimation.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (isAnimating.current) return;
        
        if (gestureState.dy > 50) {
          changeMonth(-1); // Swipe down for previous month
        } else if (gestureState.dy < -50) {
          changeMonth(1); // Swipe up for next month
        } else {
          // If swipe wasn't far enough, animate back to initial position
          Animated.spring(monthsAnimation, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  // Modify the handleDateSelect function to ensure animation works on first tap
  const handleDateSelect = (date: Date, rowIndex: number): void => {
    // Case 1: User clicks on the already selected date (collapse)
    if (
      selectedDate &&
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    ) {
      // Collapse animation
      Animated.timing(expandAnimation, {
        toValue: 0,
        duration: EXPAND_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // Animate height reduction
        setExpandedHeight(0);
        setSelectedDate(null);
        setExpandedRowIndex(null);
        setAdditionalInfo({ date: '', items: [] });
        setShowAllNotes(false);
      });
    } 
    // Case 2: User clicks on a new date while another date is already expanded
    else if (selectedDate !== null) {
      // Keep expanded state but change the data
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      setShowAllNotes(false);

      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const numberOfItems = Math.floor(Math.random() * 4) + 5;
      const items = Array.from({ length: numberOfItems }, (_, i) => ({
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.floor(
          Math.random() * 60
        )
          .toString()
          .padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        title: `Event ${i + 1} for ${dateString}`,
      }));
      
      // Calculate height adjustment if switching from showing all notes
      if (showAllNotes) {
        const currentVisibleItems = additionalInfo.items.length;
        const newVisibleItems = Math.min(MAX_VISIBLE_ITEMS, items.length);
        const heightAdjustment = (newVisibleItems - currentVisibleItems) * EVENT_ITEM_HEIGHT;
        
        // Animate to new height
        setExpandedHeight(EXPAND_HEIGHT + heightAdjustment);
      }

      setAdditionalInfo({
        date: dateString,
        items,
      });
    }
    // Case 3: User clicks on a date when nothing is expanded
    else {
      // First, prepare all the data
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const numberOfItems = Math.floor(Math.random() * 4) + 5;
      const items = Array.from({ length: numberOfItems }, (_, i) => ({
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.floor(
          Math.random() * 60
        )
          .toString()
          .padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        title: `Event ${i + 1} for ${dateString}`,
      }));

      // Set data first before animation starts
      setAdditionalInfo({
        date: dateString,
        items,
      });
      
      // Important: Update these states before starting the animation
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      setExpandedHeight(EXPAND_HEIGHT);
      
      // Reset animation value to ensure it starts from 0
      expandAnimation.setValue(0);
      
      // Now start the animation
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: EXPAND_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleShowAllNotes = () => {
    // Calculate the current visible items and the total items
    const visibleItems = showAllNotes 
      ? additionalInfo.items.length 
      : Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length);
    
    // Calculate the number of items that will be shown after toggle
    const newVisibleItems = !showAllNotes
      ? additionalInfo.items.length
      : Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length);
    
    // Calculate the height difference based on the change in visible items
    const itemsHeightDifference = (newVisibleItems - visibleItems) * EVENT_ITEM_HEIGHT;
    
    // Toggle the state
    setShowAllNotes(!showAllNotes);
    
    // Only adjust heights if there's a difference in the number of visible items
    if (itemsHeightDifference !== 0) {
      setExpandedHeight(prevHeight => prevHeight + itemsHeightDifference);
    }
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
            onPress={() => {
              setExpandedHeight(showHighlights ? 0 : highlightsHeight + 10);
              setShowHighlights(!showHighlights);
            }}
          >
            <SvgXml xml={home.highlights} />
            <Text style={styles.highlightsText}>
              {showHighlights ? 'Hide highlights' : 'View highlights'}
            </Text>
          </TouchableOpacity>
        </View>
        {showHighlights && (
          <View style={styles.highlightsContainer} onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHighlightsHeight(height-140);
          }}>
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

  const renderCalendarMonth = (monthData: MonthData, monthOffset: number): JSX.Element => {
    return (
      <View 
        style={[
          styles.monthContainer,
          { 
            transform: [{ translateY: monthOffset }]
          }
        ]}
      >
        {monthData.days.map((row, rowIndex) => (
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
            
            {expandedRowIndex === rowIndex && 
             monthData.date.getMonth() === currentMonth.getMonth() &&
             monthData.date.getFullYear() === currentMonth.getFullYear() && (
              <Animated.View
                style={[
                  styles.expandedContainer,
                  {
                    opacity: expandAnimation,
                    transform: [
                      {
                        translateY: expandAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.dateHeaderText}>{additionalInfo.date}</Text>
                
                {additionalInfo.items.length > 0 && (
                  <View>
                    <View style={styles.notesContainer}>
                      {additionalInfo.items
                        .slice(0, showAllNotes ? additionalInfo.items.length : Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length))
                        .map((item, index) => (
                          <View key={index} style={styles.eventItem}>
                            <Text style={styles.eventTime}>{item.time}</Text>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                          </View>
                        ))
                      }
                    </View>
                    
                    {additionalInfo.items.length > MAX_VISIBLE_ITEMS && (
                      <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={toggleShowAllNotes}
                      >
                        <Text style={styles.seeAllText}>
                          {showAllNotes ? 'Show less' : 'See all notes'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarDays = (): JSX.Element => {
    if (monthsData.length < 3) {
      return <View />; // Return empty view while initializing
    }
    
    return (
      <Animated.View
        style={[
          styles.monthsWrapper,
          {
            transform: [{ translateY: monthsAnimation }],
          }
        ]}
      >
        {monthsData.map((monthData, index) => {
          let offset = (index - 1) * TRANSITION_OFFSET; 
        
          // Apply additional offset for the next month (index 2) when current month is expanded
          if (index === 2 && expandedHeight > 0) {
            offset += expandedHeight;
          }
          return (
            <View
              key={`month-${monthData.date.getMonth()}-${monthData.date.getFullYear()}`}
              style={[
                styles.absoluteMonth,
                { top: offset }
              ]}
            >
              {renderCalendarMonth(monthData, 0)}
            </View>
          );
        })}
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
      <View style={styles.headerSection}>
        {renderMonthHeader()}
        {renderWeekdays()}
      </View>
      <Animated.View style={[
        styles.calendarContentWrapper, 
        { height: animatedHeight }
      ]}>
        {renderCalendarDays()}
      </Animated.View>
      <View style={styles.footerSection}>
        {renderStreakFooter()}
      </View>
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
  calendarContentWrapper: {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  headerSection: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#fff',
  },
  footerSection: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#fff',
  },
  monthsWrapper: {
    position: 'relative',
    height: 260, // Match container height
  },
  absoluteMonth: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  monthContainer: {
    width: '100%',
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
  notesContainer: {
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