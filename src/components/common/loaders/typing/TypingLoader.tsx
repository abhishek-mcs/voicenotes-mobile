import { useTheme } from 'context';
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const TypingLoader = () => {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;
  const styles = useStyles()

  useEffect(() => {
    const animateDot = (dot:any) => 
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      )
    

    Animated.stagger(200,[animateDot(dot1Opacity),
    animateDot(dot2Opacity),
    animateDot(dot3Opacity)]).start()
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]}/>
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]}/>
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]}/>
    </View>
  );
};

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop:8,
    marginLeft:2
  },
  dot: {
    backgroundColor: Colors.text,
    width:2,
    height:2,
    borderRadius:5,
    marginRight:4
  },
}), [Colors]); // Recreate styles when Colors change
};

export default TypingLoader;
