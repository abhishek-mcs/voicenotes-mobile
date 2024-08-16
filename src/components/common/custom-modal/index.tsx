import React, { useImperativeHandle, forwardRef, useState, useRef, useEffect } from 'react';
import {
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Easing,
} from 'react-native';
import { screenHeight, screenWidth } from 'utils/common';

interface CustomModalProps {
    visible: boolean;
    children: React.ReactNode;
}

const CustomModal = forwardRef(({ visible, children }:CustomModalProps, ref) => {
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [isVisible, setIsVisible] = useState(visible);
  
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
      <Animated.View style={[styles.modal, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    );
  });
  
  const styles = StyleSheet.create({
    modal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: screenWidth,
      height: screenHeight,
      backgroundColor: 'white',
      zIndex: 1000,flex:1,
      paddingVertical:60
    },
  });
  
  export default CustomModal;