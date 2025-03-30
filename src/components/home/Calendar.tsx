import { home } from 'assets/svg/home';
import SkeletonLoader from 'components/common/loaders/skeleton';
import { useTheme } from 'context';
import { useHighlights } from 'queries/home';
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
  Pressable,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { setRelatedNoteId } from 'redux/reducers/relatedNoteStates';
import { RootState } from 'redux/store/store';
import { VoiceNote } from 'types';
import { isIOS } from 'utils/common';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;
const EVENT_ITEM_HEIGHT = 30;
const MAX_VISIBLE_ITEMS = 3;
const EXPAND_ANIMATION_DURATION = 200;
const SNAP_ANIMATION_DURATION = 200; // Increased for smoother transitions
const TRANSITION_OFFSET = 300; // Vertical offset for month transitions

const getDatesWithRecordings = (month: Date, weeks: any[]): Date[] => {
  if (!weeks || weeks.length === 0) return [];
  
  const eventDates: Date[] = [];
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  weeks.forEach(week => {
    week.forEach((day: any) => {
      const date = new Date(day.date);
      
      // Check if the date is in the current month and has recordings
      if (date >= monthStart && date <= monthEnd && day.recordings_count > 0) {
        eventDates.push(date);
      }
    });
  });
  
  return eventDates;
};

const formatMonthForApi = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
  max_recordings_count?: number;
  total_users?: string;
  weeks: any[];
}

interface ExpandableCalendarProps {
  initialDate?: Date;
  rawData: VoiceNote[];
  streaks: Data;
  onClose: () => void;
}

const ExpandableCalendar: React.FC<ExpandableCalendarProps> = ({
  initialDate = new Date(),
  rawData,
  streaks,
  onClose
}) => {

  const { token }:any = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<{
    date: string;
    items: Array<{ time: string; title: string; id?: string; transcript?: string }>;
  }>({
    date: '',
    items: [],
  });
  const [highlightsHeight, setHighlightsHeight] = useState(0);
  const [data, setData] = useState<Data>({ current_streak: 0, rank: 0, weeks: [] });
  
  // Base height for the calendar without any expansions
  const [baseHeight, setBaseHeight] = useState(260);
  
  // Replace static height with animated height
  const animatedHeight = useRef(new Animated.Value(260)).current;

  // State for carousel-like months
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  
  // Animation values
  const monthsAnimation = useRef(new Animated.Value(0)).current;
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const { 
    data: highlightsData,
    isLoading: highlightsLoading,
    refetch: refetchHighlights
  } = useHighlights(token, formatMonthForApi(currentMonth));

  const highlights: Array<string> = highlightsData?.data || [];

  const styles = useStyles();
  const { Colors } = useTheme();

  const getNotesForSelectedDate = (date: Date | null): VoiceNote[] => {
    if (!date || !rawData) return [];
    
    // Create a date string in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return rawData.filter(note => {
      // Skip deleted notes
      if (note.deleted_at !== null) return false;
      
      // Use recorded_at if available, otherwise use created_at
      const noteDate = new Date(note.recorded_at || note.created_at);
      
      // Create a date string in the same format, in local timezone
      const noteYear = noteDate.getFullYear();
      const noteMonth = noteDate.getMonth() + 1;
      const noteDay = noteDate.getDate();
      const noteDateStr = `${noteYear}-${noteMonth.toString().padStart(2, '0')}-${noteDay.toString().padStart(2, '0')}`;
      
      return noteDateStr === dateStr;
    });
  };

  // In the component, use this instead of useDayNotes
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedDateNotes, setSelectedDateNotes] = useState<VoiceNote[]>([]);

  useEffect(() => {
    if (selectedDate) {
      setIsLoadingNotes(true);
      // Small delay to show loading state
      setTimeout(() => {
        const notes = getNotesForSelectedDate(selectedDate);
        setSelectedDateNotes(notes);
        setIsLoadingNotes(false);
        
        // Update additionalInfo with the notes
        const dateString = selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        
        const formattedItems = notes.map(note => {
          // Parse the recorded_at timestamp
          const recordedAt = new Date(note.recorded_at || note.created_at);
          
          // Format the time in 24-hour format (HH:MM)
          const hours = recordedAt.getHours();
          const minutes = recordedAt.getMinutes();
          const formattedHours = hours.toString().padStart(2, '0');
          const formattedMinutes = minutes.toString().padStart(2, '0');
          const timeString = `${formattedHours}:${formattedMinutes}`;
          
          // Convert null to undefined for transcript to match the expected type
          return {
            time: timeString,
            title: note.title || 'Untitled Recording',
            id: note.id, // This is already a string, so no conversion needed
            transcript: note.transcript || undefined // Convert null to undefined
          };
        });
        
        setAdditionalInfo({
          date: dateString,
          items: formattedItems,
        });
        
        // Calculate new expanded height based on available items
        const newExpandedHeight = calculateExpandedHeight(formattedItems.length, formattedItems.length > 0);
        setExpandedHeight(newExpandedHeight);
      }, 100);
    }
  }, [selectedDate, data]);
  
  useEffect(() => {
    const generateMonthsData = (baseMonth: any) => {
      const prevMonth = new Date(baseMonth);
      prevMonth.setMonth(baseMonth.getMonth() - 1);
      if(prevMonth.getMonth() == baseMonth.getMonth()) {
        prevMonth.setMonth(prevMonth.getMonth() - 1);
      }
      
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
    setMonthsData(generateMonthsData(currentMonth));
  }, [data]);

  useEffect(() => {
    if (rawData && rawData.length > 0) {
      setLoading(false);
      const processedData = processVoiceNotes(rawData);
      setData(processedData);
    }
  }, [rawData]);

  const processVoiceNotes = (voiceNotes: VoiceNote[]) => {
    const processedData: Data = {
      current_streak: 0, // These values will be set elsewhere or removed
      rank: 0,
      weeks: []
    };
    
    // Create a map of dates to recording counts
    const dateMap = new Map();
    
    voiceNotes.forEach(note => {
      // Skip deleted notes
      if (note.deleted_at !== null) return;
      
      // Use recorded_at if available, otherwise use created_at
      const dateString = note.recorded_at || note.created_at;
      const date = new Date(dateString);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, dateMap.get(formattedDate) + 1);
      } else {
        dateMap.set(formattedDate, 1);
      }
    });
    
    // Convert the map to the weeks format needed by the calendar
    // This is a simplified version - you might need to adjust based on your exact needs
    const dates = Array.from(dateMap.keys()).sort();
    if (dates.length === 0) return processedData;
    
    // Group dates by week
    const weeks: any[] = [];
    let currentWeek: any[] = [];
    let currentWeekStart: Date | null = null;
    
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const recordings_count = dateMap.get(dateStr);
      
      if (!currentWeekStart) {
        currentWeekStart = new Date(date);
        // Set to the start of the week (Monday)
        const day = date.getDay();
        currentWeekStart.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      }
      
      // Check if this date belongs to the current week
      const timeDiff = date.getTime() - currentWeekStart.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff >= 7) {
        // Start a new week
        weeks.push(currentWeek);
        currentWeek = [];
        currentWeekStart = new Date(date);
        const day = date.getDay();
        currentWeekStart.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      }
      
      currentWeek.push({
        date: dateStr,
        recordings_count
      });
    });
    
    // Add the last week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    processedData.weeks = weeks;
    return processedData;
  };

  const calculateDynamicHeight = (monthData: any) => {
    const numberOfRows = monthData.days.length;
    const baseRowHeight = 52; // Adjust based on the actual row height with spacing
    
    // Base calculation for calendar rows
    let height = numberOfRows * baseRowHeight;
    
    // Either add expanded height for selected date OR highlights height, but not both
    if (expandedHeight > 0) {
      // We have a selected date with expanded details
      height += expandedHeight;
    } else if (showHighlights) {
      // No expanded date, but showing highlights
      // Add a constant value for initial rendering before actual height is measured
      const highlightsOffset = highlightsHeight > 0 ? highlightsHeight : 65;
      
      // Only add a portion of the highlights height to prevent excessive height
      height += highlightsOffset;
    }
    
    height = selectedDate !== null || height < 360 ? height : height - 40;
    return height;
  };
  
  useEffect(() => {
    if (monthsData.length >= 3) {
      const currentMonthData = monthsData[1]; // Current month is at index 1
      const newHeight = calculateDynamicHeight(currentMonthData);
      Animated.timing(animatedHeight, {
        toValue: newHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [monthsData, expandedHeight]);

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
    setShowHighlights(false);
    
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
        if(newMonth.getMonth() === prevMonth.getMonth()) {
          newMonth.setMonth(newMonth.getMonth() + direction);
        }     
        
        // Use the current processed data
        const currentProcessedData = data ? processVoiceNotes(rawData) : { weeks: [] };
        
        // Update months data based on the new month
        const prevOfNew = new Date(newMonth);
        prevOfNew.setMonth(newMonth.getMonth() - 1);

        if(newMonth.getMonth() === prevOfNew.getMonth()) {
          prevOfNew.setMonth(prevOfNew.getMonth() + direction);
        }  
        
        const nextOfNew = new Date(newMonth);
        nextOfNew.setMonth(newMonth.getMonth() + 1);
        
        const months = [prevOfNew, newMonth, nextOfNew];
        
        const newMonthsData = months.map((month, index) => {
          // Use the current processed data to get event dates
          const eventDates = getDatesWithRecordings(month, currentProcessedData.weeks);
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
        
        // Ensure state updates are batched properly
        setMonthsData(newMonthsData);
  
        // Reset animation value without animation
        monthsAnimation.setValue(0);
        isAnimating.current = false;
        
        return newMonth;
      });
      
      // Refetch highlights for the new month after state update
      setTimeout(() => {
        refetchHighlights();
      }, 0);
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
    if (!data.weeks) return 0;
    
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    for (const week of data.weeks) {
      for (const day of week) {
        if (day.date === dateStr) {
          return day.recordings_count;
        }
      }
    }
    return 0;
  };

  const handleDateSelect = (date: Date, rowIndex: number): void => {
    // Check if this is the same date that's already selected
    const isSameDate = selectedDate && 
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear();
  
    // Reset animation value regardless of what happens next
    expandAnimation.setValue(0);
    
    // Case 1: Collapsing the currently expanded date
    if (isSameDate) {
      // First update state
      setShowHighlights(false);
      setShowAllNotes(false);
      setAdditionalInfo({ date: '', items: [] });
      
      // Then collapse animation
      Animated.timing(expandAnimation, {
        toValue: 0,
        duration: EXPAND_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // Only after animation completes, reset selection states
        setExpandedHeight(0);
        setSelectedDate(null);
        setExpandedRowIndex(null);
      });
    } 
    // Case 2: Expanding a new date
    else {
      // First reset any previous expansions immediately
      setExpandedHeight(0);
      setShowHighlights(false);
      setShowAllNotes(false);
      
      // Clear previous data before loading new data
      setAdditionalInfo({
        date: '',
        items: [],
      });
      
      // Prepare date display data
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Update states in correct order
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      
      // Set initial state with proper date display
      setAdditionalInfo({
        date: dateString,
        items: [],
      });
      
      // Calculate initial height for skeleton loader
      const recordingCount = getRecordingCountForDate(date);
      const initialHeight = calculateExpandedHeight(recordingCount, recordingCount > 0);
      
      // Apply height after a short delay to ensure render is ready
      setTimeout(() => {
        setExpandedHeight(initialHeight);
        
        // Start the animation after states are updated
        Animated.timing(expandAnimation, {
          toValue: 1,
          duration: EXPAND_ANIMATION_DURATION,
          useNativeDriver: true,
        }).start();
      }, 50);
    }
  };

  const handleNoteSelect = (noteId: string | undefined): void => {
    onClose();
    dispatch(setRelatedNoteId(null));
    setTimeout(() => dispatch(setRelatedNoteId(noteId)), 200);
  };

  const calculateExpandedHeight = (itemCount: number, hasNotes: boolean = true): number => {
    // Base height for the container padding, header, and footer
    const baseContainerHeight = 80;
    
    // If there are no notes, return a fixed height for the "no notes" container
    if (!hasNotes) {
      return baseContainerHeight + 40; // Adjust this value based on the actual height needed
    }
    
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
    
    // Calculate height differently based on expanded state
    let newHeight;
    if (newShowAllState) {
      // When showing all items, use the full count
      newHeight = calculateExpandedHeight(additionalInfo.items.length);
      
      // Add extra height for each item beyond MAX_VISIBLE_ITEMS
      if (additionalInfo.items.length > MAX_VISIBLE_ITEMS) {
        const extraItems = additionalInfo.items.length - MAX_VISIBLE_ITEMS;
        newHeight += extraItems * EVENT_ITEM_HEIGHT;
      }
    } else {
      // When collapsing, use the default limited view height
      newHeight = calculateExpandedHeight(Math.min(MAX_VISIBLE_ITEMS, additionalInfo.items.length));
    }
    
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

    const year = currentMonth.toLocaleDateString('en-US', {
      year: 'numeric',
    });
  
    // Wait for data to load before showing highlights button
    if (monthsData.length < 3 || loading) {
      return (
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>{monthName}</Text>
        </View>
      );
    }
  
    // Find the current month data more reliably
    const currentMonthData = monthsData.find(data => 
      data.date.getMonth() === currentMonth.getMonth() && 
      data.date.getFullYear() === currentMonth.getFullYear()
    );
    
    // If month data can't be found, just show the month name
    if (!currentMonthData) {
      return (
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>{monthName}</Text>
        </View>
      );
    }
    
    // Check if month has recordings before showing highlights button
    const eventDates = currentMonthData.eventDates || [];
    const showHighlightsButton = eventDates.length > 0;
  
    return (
      <View>
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.yearText}>{year}</Text>
            <Text style={styles.monthText}>{monthName}</Text>
          </View>
          {showHighlightsButton && (
            <TouchableOpacity
              style={styles.highlightsButton}
              onPress={() => {
                setExpandedHeight(0);
                setSelectedDate(null);
                setExpandedRowIndex(null);
                setAdditionalInfo({ date: '', items: [] });
                setShowAllNotes(false);
                setExpandedHeight(showHighlights ? 0 : highlightsHeight + 10);
                setShowHighlights(!showHighlights);
                
                // If we're showing highlights, trigger a refetch to ensure data is fresh
                if (!showHighlights) {
                  refetchHighlights();
                }
              }}
            >
              <SvgXml xml={home.highlights.replace(/#FFFFFF/g,Colors.green4)} />
              <Text style={styles.highlightsText}>
                {showHighlights ? 'Hide highlights' : 'View highlights'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {showHighlights && (
          <View style={styles.highlightsContainer} onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHighlightsHeight(height-140);
          }}>
            <Text style={styles.highlightsHeader}>Highlights</Text>
            
            {highlightsLoading ? (
              // Show skeleton loader when loading highlights
              <SkeletonLoader count={3} />
            ) : highlights.length > 0 ? (
              // Show highlights when available
              highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))
            ) : (
              // Show a message when no highlights are available
              <Text style={styles.noNotesText}>No highlights available</Text>
            )}
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
              selectedDate && // Make sure selectedDate exists
              monthData.date.getMonth() === selectedDate.getMonth() && 
              monthData.date.getFullYear() === selectedDate.getFullYear() && (
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
                              <Pressable onPress={() => handleNoteSelect(item.id)} key={index} style={styles.eventItem}>
                                <Text style={styles.eventTime}>{item.time}</Text>
                                <Text 
                                  style={styles.eventTitle}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >{item.title}</Text>
                              </Pressable>
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
    if (!streaks || !streaks.current_streak) {
      return <View style={styles.streakContainer} />;
    }
    
    return (
      <View style={styles.streakContainer}>
        <View style={styles.streakIconContainer}>
          <SvgXml xml={home.fire?.replace(/#FFFFFF/g,Colors.refresh)} />
        </View>
        <Text style={styles.streakText}>
          {`You are on a ${streaks.current_streak}-day streak and rank ${streaks.rank} globally.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.calendarVisualWrapper}>
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
          {!loading && streaks && renderStreakFooter()}
        </View>
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
      borderWidth: isIOS ? 0.0 : 0,
      padding: 16,
      // Enhanced iOS shadow for better visibility on all sides
      ...(isIOS ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 }, // Center the shadow (0,0) to spread it evenly
        shadowOpacity: 0.25, // Increase opacity for better visibility
        shadowRadius: 15, // Slightly reduced but still substantial
        margin: 5, // Add a small margin to ensure shadow is visible on all sides
      } : {
        // Android shadow - increase elevation for better visibility
        elevation: 8,
      }),
      // Remove overflow: 'hidden' from here
    },
    calendarVisualWrapper: {
      ...(isIOS ? {
        position: 'relative',
        overflow: 'hidden', // Keep overflow hidden here
        borderRadius: 0, // Slightly smaller than container
        backgroundColor: Colors.grey2,
      } : {})
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: 20,
    },
    monthText: {
      fontSize: 28,
      fontWeight: '500',
      color: Colors.text,
    },
    yearText: {
      fontSize: 15,
      fontWeight: '500',
      color: Colors.text10
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
      borderWidth: isIOS ? 0.2 : 0,
      // iOS specific shadow - using one of the box-shadow values
      ...(isIOS ? {
        // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.15);
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 }, // Center the shadow (0,0) to spread it evenly
        shadowOpacity: 0.2, // Increase opacity for better visibility
        shadowRadius: 5, // Slightly reduced but still substantial
        margin: 2,
      } : {
        // Android shadow
        elevation: 2,
      }),
    },
    highlightsHeader: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 12,
      color: Colors.text,
    },
    highlightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start', // This is good - aligns items to the top
    },
    bulletPoint: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.text,
      marginRight: 8,
      marginTop: 8, // Instead of a fixed value, we'll use a relative one
    },
    highlightText: {
      fontSize: 14,
      color: Colors.text,
      flex: 1,
      lineHeight: 20, // Adding a consistent line height is good
      paddingTop: 1, // Small adjustment to text positioning
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
      borderRadius: isIOS ? 16 : 10,
      borderWidth: 0.0,
      marginVertical: 4,
      marginHorizontal: 2, // Added horizontal margin to give space for side shadows
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      // iOS specific shadow - for even shadow on all sides
      ...(isIOS ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 }, // Centered shadow
        shadowOpacity: 0.15, // Slightly increased opacity
        shadowRadius: 6, // Increased radius
        // This is important - ensures the shadow is rendered properly
        zIndex: 1,
        shadowPath: "0 0 0 0",
        // This ensures the shadow renders correctly with the path
        overflow: 'visible',
      } : {
        // Android shadow
        elevation: 4,
      }),
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
      paddingVertical: 3,
      paddingHorizontal: 5,
    },
    eventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 1,
      height: EVENT_ITEM_HEIGHT,
    },
    eventTime: {
      width: 50,
      fontSize: 14,
      color: '#888',
    },
    eventTitle: {
      fontSize: 14,
      color: Colors.text,
      fontWeight: '400',
      flex: 1,
      overflow: 'hidden',
    },
    seeAllButton: {
      alignSelf: 'center',
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: Colors.bgColor3(0.05),
      borderRadius: 15,
    },
    seeAllText: {
      fontSize: 12,
      color: Colors.blackWithOpacity(1),
      fontWeight: '500',
    },
    streakContainer: {
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
      paddingHorizontal: 5,
      gap: 5
    },
    streakIconContainer: {
      paddingBottom: 0, // Add a small padding to align with the first line of text
    },
    streakText: {
      fontSize: 13,
      color: Colors.text,
      flex: 1, // Allow text to take remaining space
    },
    noNotesContainer: {
      padding: 10,
      alignItems: 'center',
      height: 40
    },
    noNotesText: {
      color: Colors.grey3,
      fontStyle: 'italic',
    },
  }), [Colors, isIOS])
}

export default ExpandableCalendar;