import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;

const ExpandableCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Animation value for swipe transition
  const positionX = useRef(new Animated.Value(0)).current;
  
  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    
    const days = [];
    
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
    const rows = [];
    let cells = [];
    
    days.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        rows.push(cells);
        cells = [];
      }
      cells.push(day);
    });
    
    // Push the last row
    if (cells.length > 0) {
      rows.push(cells);
      
      // Fill the last row with empty cells if needed
      while (cells.length < 7) {
        cells.push({ day: '', empty: true });
      }
    }
    
    return rows;
  };
  
  // Handle month change
  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    
    // Animate the transition
    Animated.timing(positionX, {
      toValue: -direction * CALENDAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMonth(newMonth);
      positionX.setValue(0);
      // Reset selection when changing months
      setSelectedDate(null);
      setExpandedRowIndex(null);
      setExpandedHeight(0);
    });
  };
  
  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => 
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        positionX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right - go to previous month
          changeMonth(-1);
        } else if (gestureState.dx < -50) {
          // Swipe left - go to next month
          changeMonth(1);
        } else {
          // Return to current position
          Animated.spring(positionX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  // Handle date selection
  const handleDateSelect = (date, rowIndex) => {
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
      setAdditionalInfo(`Details for ${dateString}`);
    }
  };
  
  // Render weekday headers
  const renderWeekdays = () => {
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
  const renderMonthHeader = () => {
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
  const renderCalendarDays = () => {
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
                selectedDate.getDate() === item.day && 
                selectedDate.getMonth() === currentMonth.getMonth() ? 
                  styles.selectedDay : null
              ]}
              disabled={item.empty}
              onPress={() => item.empty ? null : handleDateSelect(item.date, rowIndex)}
            >
              <Text 
                style={[
                  styles.calendarDayText,
                  selectedDate && 
                  !item.empty && 
                  selectedDate.getDate() === item.day && 
                  selectedDate.getMonth() === currentMonth.getMonth() ? 
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
    <Animated.View 
      style={[
        styles.container,
        {transform: [{ translateX: positionX }]}
      ]}
      {...panResponder.panHandlers}
    >
      {renderMonthHeader()}
      {renderWeekdays()}
      {renderCalendarDays()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CALENDAR_WIDTH,
    height: '25%',
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