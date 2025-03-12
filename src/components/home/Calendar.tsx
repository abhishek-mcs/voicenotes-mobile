import { home } from 'assets/svg/home';
import SkeletonLoader from 'components/common/loaders/skeleton';
import { useTheme } from 'context';
import { getNotesByDates } from 'queries/home';
import React, { useState, useRef, useEffect, useMemo } from 'react';
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

// Utility functions 
const getDatesWithRecordings = (date: Date, weeksData: any[][]): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dates: Date[] = [];
  if(!weeksData) return dates;
  
  // Iterate through all weeks in the data
  weeksData.forEach(week => {
    // Iterate through each day in the week
    week.forEach(day => {
      const dayDate = new Date(day.date);
      
      // Check if the date is in the target month and has recordings
      if (dayDate.getFullYear() === year && 
          dayDate.getMonth() === month && 
          day.recordings_count > 0) {
        dates.push(dayDate);
      }
    });
  });
  
  return dates;
};

const getHighlightsForMonth = (date: Date, highlightsData: any): Array<{title: string, uuid: string}> => {
  if (!highlightsData) return [];
  
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return highlightsData[monthKey] || [];
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

type Data = {
  current_streak: number;
  rank: number;
  max_recordings_count: number;
  total_users: string;
  weeks: any[];
}

interface ExpandableCalendarProps {
  initialDate?: Date;
  data: Data;
  highlightsData: any;
}

const ExpandableCalendar: React.FC<ExpandableCalendarProps> = ({
  initialDate = new Date(),
  data,
  highlightsData
}) => {
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [highlights, setHighlights] = useState<Array<{title: string, uuid: string}>>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<{
    date: string;
    items: Array<{ time: string; title: string }>;
  }>({
    date: '',
    items: [],
  });
  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, Record<string, any[]>>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Base height for the calendar without any expansions
  const [baseHeight, setBaseHeight] = useState(260);
  
  // Replace static height with animated height
  const animatedHeight = useRef(new Animated.Value(260)).current;

  // State for carousel-like months
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);

  const [highlightsHeight, setHighlightsHeight] = useState(0);
  
  // Animation values
  const monthsAnimation = useRef(new Animated.Value(0)).current;
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const styles = useStyles();
  const { Colors } = useTheme();

  useEffect(() => {
    const generateMonthsData = (baseMonth: any) => {
      const prevMonth = new Date(baseMonth);
      prevMonth.setMonth(baseMonth.getMonth() - 1);
      
      const nextMonth = new Date(baseMonth);
      nextMonth.setMonth(baseMonth.getMonth() + 1);
      
      const months = [prevMonth, baseMonth, nextMonth];
      return months.map((month, index) => {
        // Use the real recording data instead of random dates
        const eventDates = getDatesWithRecordings(month, data.weeks);
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
    if (monthsData.length === 0 && data.weeks && data.weeks.length > 0) {
      setMonthsData(generateMonthsData(currentMonth));
      setHighlights(getHighlightsForMonth(currentMonth, highlightsData));
      
      // Fetch notes for the initial month
      fetchNotesForMonth(currentMonth);
    }
  }, [data.weeks]);

  useEffect(() => {if(data.weeks) setLoading(data.weeks.length < 0)}, [data])

  // Update animatedHeight when baseHeight changes
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: baseHeight + expandedHeight,
      duration: HEIGHT_ANIMATION_DURATION,
      useNativeDriver: false, // Height animations can't use native driver
    }).start();
  }, [baseHeight, expandedHeight]);

  useEffect(() => {
    if (highlightsData && currentMonth) {
      setHighlights(getHighlightsForMonth(currentMonth, highlightsData));
      
      // Create a month key
      const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      
      // Only fetch if we don't already have notes for this month
      if (!monthlyNotes[monthKey]) {
        fetchNotesForMonth(currentMonth);
      }
    }
  }, [highlightsData, currentMonth]);

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

  const fetchNotesForMonth = async (month: Date) => {
    setIsLoadingNotes(true);
    
    // Get all dates with recordings in the month
    const datesWithRecordings = getDatesWithRecordings(month, data.weeks);
    
    // Format dates as YYYY-MM-DD strings
    const dateStrings = datesWithRecordings.map(date => 
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );
    
    // Skip if no dates with recordings
    if (dateStrings.length === 0) {
      setIsLoadingNotes(false);
      return;
    }
    
    try {
      // Call your API function
      const notesData = await getNotesByDates(dateStrings);
      
      // Create a month key (YYYY-MM)
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      
      // Update state with the new notes - do this regardless of whether there's a selected date
      setMonthlyNotes(prev => ({
        ...prev,
        [monthKey]: notesData
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
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
          // Use real recording data instead of random dates
          const eventDates = getDatesWithRecordings(month, data.weeks);
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
        
        setHighlights(getHighlightsForMonth(newMonth, highlightsData));
        
        // Get notes for the new month if they're not already loaded
        const monthKey = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyNotes[monthKey]) {
          fetchNotesForMonth(newMonth);
        }
        
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

  // Find recording count for a specific date
  const getRecordingCountForDate = (date: Date): number => {
    for (const week of data.weeks) {
      for (const day of week) {
        const dayDate = new Date(day.date);
        if (dayDate.getDate() === date.getDate() && 
            dayDate.getMonth() === date.getMonth() && 
            dayDate.getFullYear() === date.getFullYear()) {
          return day.recordings_count;
        }
      }
    }
    return 0;
  };

  const handleDateSelect = (date: Date, rowIndex: number): void => {
    // Format the date as YYYY-MM-DD
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Get recording count for the selected date
    const recordingCount = getRecordingCountForDate(date);
    
    // Check if we already have notes for this month
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthData = monthlyNotes[monthKey] || {};
    const dateNotes = monthData[dateStr]?.data;
    
    // Same logic as before for collapsing
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
        setExpandedHeight(0);
        setSelectedDate(null);
        setExpandedRowIndex(null);
        setAdditionalInfo({ date: '', items: [] });
        setShowAllNotes(false);
      });
    } 
    // Handle expanding
    else {
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Generate items array based on whether we have notes or not
      let items: any[] = [];
      
      if (dateNotes && Array.isArray(dateNotes)) {
        // We have notes, map them to the format we need
        items = dateNotes.map((note) => {
          // Parse the recorded_at timestamp
          const recordedAt = new Date(note.recorded_at);
          
          // Format the time as HH:MM AM/PM
          const hours = recordedAt.getHours();
          const minutes = recordedAt.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
          const formattedMinutes = minutes.toString().padStart(2, '0');
          const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
          
          return {
            time: timeString,
            title: note.title || 'Untitled Recording',
            id: note.id,
            transcript: note.transcript
          };
        });
      } else console.log(dateNotes)
      
      // Set data and states
      setAdditionalInfo({
        date: dateString,
        items,
      });
      
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      
      // Calculate appropriate height for either real items or skeleton
      setExpandedHeight(calculateExpandedHeight(items.length || recordingCount));
      
      // Reset animation value
      expandAnimation.setValue(0);
      
      // Start the animation
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: EXPAND_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
      
      // If we don't have notes for this month, fetch them
      if (!monthlyNotes[monthKey]) {
        fetchNotesForMonth(date);
      }
    }
  };

  const calculateExpandedHeight = (itemCount: number): number => {
    // Base height for the container padding, header, and footer
    const baseContainerHeight = 80;
    
    // Calculate the height needed for the items
    const visibleItemCount = Math.min(MAX_VISIBLE_ITEMS, itemCount);
    const itemsHeight = visibleItemCount * EVENT_ITEM_HEIGHT;
    
    // Add space for the "See all" button if needed
    const seeAllButtonHeight = itemCount > MAX_VISIBLE_ITEMS ? 30 : 0;
    
    return baseContainerHeight + itemsHeight + seeAllButtonHeight;
  };

  const toggleShowAllNotes = () => {
    // Toggle the state
    const newShowAllState = !showAllNotes;
    setShowAllNotes(newShowAllState);
    
    // Calculate the new height based on the toggled state
    const itemsToShow = newShowAllState 
      ? additionalInfo.items.length 
      : Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length);
    
    // Use the helper function to calculate the proper height
    const newHeight = calculateExpandedHeight(additionalInfo.items.length);
    
    // Set the new expanded height
    setExpandedHeight(newHeight);
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
  
    const hasHighlights = highlights.length > 0;
  
    return (
      <View>
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>{monthName}</Text>
          {hasHighlights && (
            <TouchableOpacity
              style={styles.highlightsButton}
              onPress={() => {
                setExpandedHeight(showHighlights ? 0 : highlightsHeight + 10);
                setShowHighlights(!showHighlights);
              }}
            >
              <SvgXml xml={home.highlights.replace(/#FFFFFF/g,Colors.green4)} />
              <Text style={styles.highlightsText}>
                {showHighlights ? 'Hide highlights' : 'View highlights'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {showHighlights && hasHighlights && (
          <View style={styles.highlightsContainer} onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHighlightsHeight(height-140);
          }}>
            <Text style={styles.highlightsHeader}>Highlights</Text>
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.highlightText}>{highlight.title}</Text>
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
                  
                  {isLoadingNotes ? (
                    <SkeletonLoader count={getRecordingCountForDate(selectedDate!)} />
                  ) : (
                    additionalInfo.items.length > 0 ? (
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
                    ) : (
                      <View style={styles.noNotesContainer}>
                        <Text style={styles.noNotesText}>No notes available</Text>
                      </View>
                    )
                  )}
                </Animated.View>
              )
            }
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
        <SvgXml xml={home.fire?.replace(/#FFFFFF/g,Colors.refresh)} />
        <Text style={styles.streakText}>
          {`You are on a ${data.current_streak}-day streak and rank ${data.rank} globally.`}
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
        {!loading && renderStreakFooter()}
      </View>
    </View>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
      width: CALENDAR_WIDTH,
      backgroundColor: Colors.grey2,
      borderRadius: 25,
      borderWidth: 0.1,
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
      color: Colors.text,
    },
    calendarContentWrapper: {
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    },
    headerSection: {
      position: 'relative',
      zIndex: 2,
      backgroundColor: Colors.grey2,
    },
    footerSection: {
      position: 'relative',
      zIndex: 2,
      backgroundColor: Colors.grey2,
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
      backgroundColor: Colors.green3,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
    },
    highlightsText: {
      color: Colors.green4,
      fontSize: 14,
      fontWeight: '500',
    },
    highlightsContainer: {
      backgroundColor: Colors.bgColor20,
      borderRadius: 10,
      marginBottom: 15,
      padding: 10,
      borderColor: Colors.grey,
      borderWidth: 0.2,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    highlightsHeader: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 12,
      color: Colors.text,
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
      backgroundColor: Colors.text,
      marginRight: 8,
    },
    highlightText: {
      fontSize: 14,
      color: Colors.text,
      flex: 1,
    },
    weekdayContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingBottom: 16,
    },
    weekdayText: {
      fontSize: 15,
      color: Colors.text,
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
      color: Colors.text,
      fontWeight: '500',
    },
    emptyDay: {
      backgroundColor: 'transparent',
    },
    activeDay: {
      backgroundColor: Colors.bgColor19,
    },
    selectedDay: {
      backgroundColor: Colors.text,
    },
    selectedDayText: {
      color: Colors.bgColor,
      fontWeight: 'bold',
    },
    expandedContainer: {
      backgroundColor: Colors.bgColor,
      borderRadius: 16,
      borderWidth: 0.17,
      marginVertical: 4,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: Colors.text,
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    dateHeaderText: {
      fontSize: 14,
      marginBottom: 8,
      fontWeight: '500',
      color: Colors.text,
    },
    notesContainer: {
      borderRadius: 8,
      backgroundColor: Colors.bgColor,
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
      color: Colors.text,
      fontWeight: '400',
      flex: 1,
    },
    seeAllButton: {
      alignSelf: 'center',
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: Colors.grey8,
      borderRadius: 15,
    },
    seeAllText: {
      fontSize: 12,
      color: Colors.grey6,
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
      color: Colors.text,
    },
    noNotesContainer: {
      padding: 10,
      alignItems: 'center',
    },
    noNotesText: {
      color: Colors.grey3,
      fontStyle: 'italic',
    },
  }), [Colors])
}

export default ExpandableCalendar;