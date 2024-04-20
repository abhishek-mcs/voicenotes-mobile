import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const useAnimatedSlide = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(50)).current;
  const [isHidden, setIsHidden] = useState(true);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const toggleSlide = () => {
    let toValue = 475; // Default value

    if (isHidden) {
      toValue = 0;
    }

    Animated.spring(bounceValue, {
      toValue: toValue,
      velocity: 10,
      tension: 3,
      friction: 6,
      useNativeDriver: true,
    }).start();

    setIsHidden(!isHidden);
  };

  useEffect(() => {
    toggleSlide();
    fadeIn();
  }, []);

  return { fadeAnim, bounceValue, isHidden, toggleSlide };
};

export default useAnimatedSlide;
