import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;

// TypeScript interfaces
interface CalendarDay {
  day: number | string;
  date?: Date;
  empty: boolean;
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
  const [expandedHeight, setExpandedHeight] = useState<number>(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<{ date: string, items: Array<{time: string, title: string}> }>({
    date: '',
    items: []
  });
  
  // Get days in month
  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days for current month view
  const generateCalendarDays = (): CalendarDay[][] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', empty: true });
    }
    
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
        empty: false 
      });
    }
    
    // Arrange days into rows (weeks)
    const rows: CalendarDay[][] = [];
    let cells: CalendarDay[] = [];
    
    days.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        rows.push(cells);
        cells = [];
      }
      cells.push(day);
    });
    
    // Push the last row
    if (cells.length > 0) {
      // Fill the last row with empty cells if needed
      while (cells.length < 7) {
        cells.push({ day: '', empty: true });
      }
      rows.push(cells);
    }
    
    return rows;
  };
  
  // Handle month change - properly changes to ANY month
  const changeMonth = (direction: number): void => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + direction);
      return newMonth;
    });
    
    // Reset selection when changing months
    setSelectedDate(null);
    setExpandedRowIndex(null);
    setExpandedHeight(0);
  };
  
  // Create a handler for swipe detection
  const handleSwipe = (direction: number) => {
    changeMonth(direction);
  };
  
  // Re-create the panResponder when needed
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => 
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: () => {
        // No animation during move
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right - go to previous month
          handleSwipe(-1);
        } else if (gestureState.dx < -50) {
          // Swipe left - go to next month
          handleSwipe(1);
        }
      },
    })
  ).current;
  
  // Handle date selection
  const handleDateSelect = (date: Date, rowIndex: number): void => {
    if (selectedDate && 
        selectedDate.getDate() === date.getDate() && 
        selectedDate.getMonth() === date.getMonth() && 
        selectedDate.getFullYear() === date.getFullYear()) {
      // Collapse if selecting the same date
      setSelectedDate(null);
      setExpandedRowIndex(null);
      setExpandedHeight(0);
      setAdditionalInfo({ date: '', items: [] });
    } else {
      // Expand with new date
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      setExpandedHeight(150); // Height of expanded area
      
      // Format the date like "Friday - 7 Feb 2025"
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      // Sample items for the selected date
      setAdditionalInfo({ 
        date: dateString,
        items: [
          { time: '9:38 PM', title: 'Birthday gift for mom' },
          { time: '12:11 PM', title: 'Workout routine reminder' },
          { time: '8:30 AM', title: 'Lyric idea for new track' }
        ]
      });
      
      // Call onDateSelect callback if provided
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };
  
  // Render weekday headers
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
  
  // Render month navigation
  const renderMonthHeader = (): JSX.Element => {
    const monthName = currentMonth.toLocaleDateString('en-US', {
      month: 'long',
    });
    
    return (
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity style={styles.highlightsButton}>
          <Text style={styles.highlightsText}>View highlights</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render calendar rows
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
                selectedDate && 
                !item.empty && 
                item.date &&
                selectedDate.getDate() === item.date.getDate() && 
                selectedDate.getMonth() === item.date.getMonth() && 
                selectedDate.getFullYear() === item.date.getFullYear() ? 
                  styles.selectedDay : null
              ]}
              disabled={item.empty}
              onPress={() => item.empty || !item.date ? null : handleDateSelect(item.date, rowIndex)}
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
          <Animated.View 
            style={[
              styles.expandedContainer, 
              { height: expandedHeight }
            ]}
          >
            <Text style={styles.dateHeaderText}>{additionalInfo.date}</Text>
            {additionalInfo.items.map((item, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventTime}>{item.time}</Text>
                <Text style={styles.eventTitle}>{item.title}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    ));
  };

  // Render the streak footer
  const renderStreakFooter = (): JSX.Element => {
    return (
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>
          🔥 You are on a 15-day streak and rank 111 globally.
        </Text>
      </View>
    );
  };

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    >
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
    fontWeight: 'bold',
    color: '#000',
  },
  highlightsButton: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f5f5f5',
  },
  calendarDayText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  emptyDay: {
    backgroundColor: 'transparent',
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
    overflow: 'hidden',
    borderColor: '#f0f0f0',
    borderWidth: 1,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    justifyContent: 'center'
  },
  streakText: {
    fontSize: 13,
    color: '#555',
  },
});

export default ExpandableCalendar;