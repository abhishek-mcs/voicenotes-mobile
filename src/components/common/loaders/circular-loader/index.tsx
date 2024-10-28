import { useTheme } from 'context';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';

export default ({ width=22,height=22, strokeWidth = 2, color = '#0d0d0d' }) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const styles = useStyles()
  
    useEffect(() => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, [spinValue]);
  
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  
    return (
      <View style={{ width,height }}>
        <Animated.View
          style={[
            styles.loader,
            {
              width,
              height,
              borderWidth: strokeWidth,
              borderRadius: width / 2,
              borderTopColor: color,
              borderRightColor:color,
              transform: [{ rotate: spin }],
            },
          ]}
        />
      </View>
    );
  };
  
const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
    loader: {
      borderLeftColor: Colors.greyWithOpacity(0.3),
      borderBottomColor: Colors.greyWithOpacity(0.3),
      position: 'absolute',
    },
  }), [Colors]); // Recreate styles when Colors change
};