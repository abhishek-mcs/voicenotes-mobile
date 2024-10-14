import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const PulsatingSVG = ({ svg = '', size = 12,status="" }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.6,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ])

    const rotate = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    });

    Animated.parallel([
      status!="processing"?Animated.loop(pulse)
      :Animated.loop(rotate),
    ]).start();

    return () => {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [status]);

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