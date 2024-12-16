import { useTheme } from 'context';
import React, { useImperativeHandle, forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import {
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Easing,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import { screenHeight, screenWidth } from 'utils/common';

interface CustomModalProps {
    visible: boolean;
    children: React.ReactNode;
}

const CustomModal = forwardRef(({ visible, children }:CustomModalProps, ref) => {
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [isVisible, setIsVisible] = useState(visible);
    const styles = useStyles();

    const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to touches that start from the left edge
        return evt.nativeEvent.locationX < 20;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond if the gesture started from the left edge
        if (evt.nativeEvent.locationX > 20) return false;
        
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState: PanResponderGestureState) => {
        // Update position as user drags
        if (gestureState.dx > 0) { // Only allow right swipe
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState: PanResponderGestureState) => {
        // If dragged more than 1/3 of screen width, close modal
        if (gestureState.dx > screenWidth / 3) {
          close();
        } else {
          // Otherwise snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }), []);
  
    useEffect(() => {
      if (visible) {
        open();
      } else {
        close();
      }
    }, [visible]);
  
    useImperativeHandle(ref, () => ({
      open: () => open(),
      close: () => close(),
    }));
  
    const open = () => {
      setIsVisible(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    };
  
    const close = () => {
      Animated.timing(translateX, {
        toValue: screenWidth,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    };
  
    if (!isVisible) return null;
  
    return (
      <Animated.View 
        {...panResponder.panHandlers}
        style={[styles.modal, { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.View>
    );
  });
  
  const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
      modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: screenWidth,
        height: screenHeight+100,
        backgroundColor: Colors.whiteWithOpacity(1),
        zIndex: 1000,
        flex: 1,
        paddingTop: 60
      },
    }), [Colors]);
  };
  
  export default CustomModal;