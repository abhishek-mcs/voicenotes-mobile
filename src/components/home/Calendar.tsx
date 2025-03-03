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
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  
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
      setAdditionalInfo('');
    } else {
      // Expand with new date
      setSelectedDate(date);
      setExpandedRowIndex(rowIndex);
      setExpandedHeight(80); // Height of expanded area
      
      // Generate some example additional info
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setAdditionalInfo(`Details for ${dateString}. You can add any content here that you want to display when a date is selected. This area will expand to fit the content.`);
      
      // Call onDateSelect callback if provided
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };
  
  // Render weekday headers
  const renderWeekdays = (): JSX.Element => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
      year: 'numeric',
    });
    
    return (
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>{monthName}</Text>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.navigationButton}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.navigationButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.additionalInfoText}>{additionalInfo}</Text>
          </Animated.View>
        )}
      </View>
    ));
  };

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {renderMonthHeader()}
      {renderWeekdays()}
      {renderCalendarDays()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CALENDAR_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  monthNavigation: {
    flexDirection: 'row',
  },
  navigationButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 10,
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    color: '#666',
    width: (CALENDAR_WIDTH - 20) / 7,
    textAlign: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  calendarDay: {
    width: (CALENDAR_WIDTH - 20) / 7,
    height: (CALENDAR_WIDTH - 20) / 7 * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#000',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  selectedDayText: {
    color: '#fff',
  },
  expandedContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    overflow: 'hidden',
  },
  additionalInfoText: {
    color: '#000',
  },
});

export default ExpandableCalendar;