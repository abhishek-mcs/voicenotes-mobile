import { useTheme } from 'context';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface WaveformProps {
  recording: any;
}

const BAR_COUNT = 50; // Number of bars in the waveform
const MIN_HEIGHT = 2; // Minimum height of bars
const MAX_HEIGHT = 24; // Maximum height of bars
const BAR_SPACING = 2; // Space between bars

const Waveform: React.FC<WaveformProps> = ({ recording }) => {
  const { Colors } = useTheme();
  const animatedBars = useRef<Animated.Value[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize animated values if not already done
  useEffect(() => {
    if (!isInitialized) {
      animatedBars.current = Array(BAR_COUNT).fill(0).map(() => new Animated.Value(MIN_HEIGHT));
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (recording) {
      recording.setOnRecordingStatusUpdate((status: any) => {
        if (status.metering !== undefined) {
          // Convert metering value to a scale of 0-1
          const normalizedMeter = Math.max(0, (status.metering + 160) / 160);
          
          // Animate each bar with a slight delay to create a wave effect
          animatedBars.current.forEach((bar, index) => {
            const delay = index * 10; // Stagger the animations
            const randomFactor = 0.7 + Math.random() * 0.6; // Add some randomness
            const targetHeight = MIN_HEIGHT + (normalizedMeter * (MAX_HEIGHT - MIN_HEIGHT) * randomFactor);

            Animated.sequence([
              Animated.delay(delay),
              Animated.spring(bar, {
                toValue: targetHeight,
                useNativeDriver: false,
                tension: 50,
                friction: 3,
              })
            ]).start();
          });
        }
      });
    } else {
      // Reset all bars to minimum height when recording stops
      animatedBars.current.forEach((bar) => {
        Animated.spring(bar, {
          toValue: MIN_HEIGHT,
          useNativeDriver: false,
          tension: 40,
          friction: 5,
        }).start();
      });
    }
  }, [recording]);

  const renderBars = () => {
    return animatedBars.current.map((bar, index) => (
      <Animated.View
        key={index}
        style={[
          styles.bar,
          {
            height: bar,
            backgroundColor: Colors.blackWithOpacity(0.8),
            marginHorizontal: BAR_SPACING / 2,
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {isInitialized && renderBars()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MAX_HEIGHT,
    paddingHorizontal: 4,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});

export default Waveform;