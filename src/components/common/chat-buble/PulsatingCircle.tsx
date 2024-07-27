import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const PulsatingSVG = ({ svg = '', size = 12 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]);

    const rotate = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: true,
    });

    Animated.parallel([
      Animated.loop(pulse),
      Animated.loop(rotate),
    ]).start();

    return () => {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', marginLeft: 4, marginBottom: 1 }}>
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        }}
      >
        <SvgXml xml={svg} width={size} height={size} />
      </Animated.View>
    </View>
  );
};

export default PulsatingSVG;