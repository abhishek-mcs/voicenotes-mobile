import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Rect } from 'react-native-svg';
import { RecordingStatus } from 'expo-av/build/Audio';

interface Props {
  recording: Audio.Recording | null;
}

const Waveform: React.FC<Props> = ({ recording }) => {
  const [meteringValues, setMeteringValues] = useState<number[]>([]);
  const animatedHeights = useRef<Animated.Value[]>([]).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const containerWidth = 300; // Adjust this value based on your desired width
  const translateX = useRef<Animated.Value[]>([]).current;

  const width = 6;
  const spacing = 5;
  const baseHeight = 50; // Base height for the waveform (center line)

  const updateAnimatedHeights = (newValues: number[]) => {
    newValues.forEach((value, index) => {
      if (!animatedHeights[index]) {
        animatedHeights[index] = new Animated.Value(0);
      }
      if (!translateX[index]) {
        translateX[index] = new Animated.Value(0);
      }
      const height = Math.abs((value + 65)>5?(value + 65):6);
      const x=index * (width + spacing)
      // console.log('x',x)
      Animated.timing(animatedHeights[index], {
        toValue: height,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

    // Animated.timing(translateX[index], {
    //   toValue: x,
    //   duration: 1000,
    //   easing: Easing.linear,
    //   useNativeDriver: false,
    // }).start();
    });
  };

  useEffect(() => {
    if (recording) {
      const prepareRecording = async () => {
        recording.setOnRecordingStatusUpdate((status: RecordingStatus) => {
          if (status.isRecording && status.metering !== undefined) {
            setMeteringValues((prevValues: any) => {
              const newValues = [...prevValues, status.metering];
              if (newValues.length > 100) newValues.shift(); // Keep only the latest 100 values
              updateAnimatedHeights(newValues);

              // Animate the scroll
              // Animated.timing(scrollX, {
              //   toValue: -(newValues.length * (width + spacing) - containerWidth),
              //   duration: 300,
              //   easing: Easing.linear,
              //   useNativeDriver: false,
              // }).start();

              return newValues;
            });
          }
        });
      };

      prepareRecording();
    }
  }, [recording]);


  const renderWaveform = () => {

    return meteringValues.map((value, index) => {
      const animatedHeight = animatedHeights[index] || new Animated.Value(0);
      const x = translateX[index] || new Animated.Value(0);
      return (
        <AnimatedRect
          key={index}
          x={index*(width+spacing)}
          y={animatedHeight.interpolate({
            inputRange: [0, 100],
            outputRange: [baseHeight, baseHeight - 100],
            extrapolate: 'clamp',
          })}
          width={width}
        //   transform={[{ translateX: scrollX }]}
          height={animatedHeight.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 200],
            extrapolate: 'clamp',
          })}
          fill="#0D0D0D"
          rx={2}
          ry={2}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* <Animated.View style={{ transform: [{ translateX }], flex: 1 }}> */}
        <Svg height="70%" width={'100%'} viewBox={`0 0 ${(meteringValues.length * (6 + 5))} 100`}>
          {renderWaveform()}
        </Svg>
      {/* </Animated.View> */}
    </View>
  );
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex:1
  },
});

export default Waveform;