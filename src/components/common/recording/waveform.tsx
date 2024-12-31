import { useTheme } from 'context';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Platform, Dimensions } from 'react-native';

interface WaveformProps {
  recording: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 35;
const BAR_WIDTH = 3;
const BAR_SPACING = 2;
const BAR_COUNT = Math.floor(SCREEN_WIDTH / (BAR_WIDTH + BAR_SPACING));
const TOTAL_BAR_WIDTH = BAR_WIDTH + BAR_SPACING;

// Platform-specific metering ranges
const IOS_NOISE_THRESHOLD = -50;
const IOS_SPEECH_LEVEL = -5;
const ANDROID_NOISE_THRESHOLD = -60;
const ANDROID_SPEECH_LEVEL = -35;

interface BarData {
  height: number;
  position: Animated.Value;
  opacity: Animated.Value;
}

const Waveform: React.FC<WaveformProps> = ({ recording }) => {
  const { Colors } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const lastMeterValue = useRef<number>(0);
  const barsRef = useRef<BarData[]>([]);
  const startX = SCREEN_WIDTH; // Starting position for new bars

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
    return () => {
      barsRef.current = [];
    };
  }, []);

  const normalizeMeterLevel = (meter: number) => {
    const noiseThreshold = Platform.OS === 'ios' ? IOS_NOISE_THRESHOLD : ANDROID_NOISE_THRESHOLD;
    const speechLevel = Platform.OS === 'ios' ? IOS_SPEECH_LEVEL : ANDROID_SPEECH_LEVEL;
    
    let normalizedValue = (meter - noiseThreshold) / (speechLevel - noiseThreshold);
    normalizedValue = Math.max(0, Math.min(1, normalizedValue));
    
    if (Platform.OS === 'ios') {
      normalizedValue = Math.pow(normalizedValue, 1.5);
      if (normalizedValue < 0.2) {
        normalizedValue *= 0.2;
      } else if (normalizedValue > 0.8) {
        normalizedValue = 0.8 + (normalizedValue - 0.8) * 0.5;
      } else {
        normalizedValue = 0.2 + (normalizedValue - 0.2) * 1.2;
      }
    } else {
      normalizedValue = Math.pow(normalizedValue, 1.5);
      if (normalizedValue < 0.2) {
        normalizedValue *= 0.3;
      } else {
        normalizedValue = 0.2 + (normalizedValue - 0.2) * 1.5;
      }
    }
    
    return Math.min(1, normalizedValue);
  };

  useEffect(() => {
    if (recording) {
      recording.setOnRecordingStatusUpdate((status: any) => {
        if (status.metering !== undefined) {
          const normalizedMeter = normalizeMeterLevel(status.metering);
          lastMeterValue.current = normalizedMeter;

          // Create new bar
          const randomFactor = Platform.OS === 'ios'
            ? (normalizedMeter > 0.8 
              ? 0.7 + Math.random() * 0.6
              : 0.4 + Math.random() * 1.2)
            : 0.4 + Math.random() * 1.2;
          
          // Ensure minimum height of 1
          const barHeight = Math.max(MIN_HEIGHT, MIN_HEIGHT + (normalizedMeter * (MAX_HEIGHT - MIN_HEIGHT) * randomFactor));
          
          // Create new bar data
          const newBar: BarData = {
            height: barHeight,
            position: new Animated.Value(startX),
            opacity: new Animated.Value(1)
          };

          // Add new bar to array
          barsRef.current.push(newBar);

          // If we exceed BAR_COUNT, remove the oldest bar
          if (barsRef.current.length > BAR_COUNT) {
            const oldestBar = barsRef.current[0];
            // Fade out the oldest bar
            Animated.timing(oldestBar.opacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true
            }).start(() => {
              // Remove the oldest bar from the array
              barsRef.current = barsRef.current.slice(1);
            });
          }

          // Animate all bars to the left
          barsRef.current.forEach((bar, index) => {
            const targetX = -TOTAL_BAR_WIDTH + (SCREEN_WIDTH - ((barsRef.current.length - 1 - index) * TOTAL_BAR_WIDTH));
            Animated.spring(bar.position, {
              toValue: targetX,
              useNativeDriver: true,
              stiffness: Platform.OS === 'ios' ? 300 : 200,
              damping: Platform.OS === 'ios' ? 15 : 12,
              mass: 0.3,
            }).start();
          });
        }
      });
    } else {
      // Clear all bars when recording stops
      barsRef.current = [];
    }
  }, [recording]);

  const renderBars = () => {
    return barsRef.current.map((bar, index) => (
      <Animated.View
        key={index}
        style={[
          styles.bar,
          {
            backgroundColor: Colors.blackWithOpacity(0.8),
            height: bar.height,
            transform: [{ translateX: bar.position }],
            opacity: bar.opacity,
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
    overflow: 'hidden',
  },
  waveformContainer: {
    width: '100%',
    height: MAX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
  },
});

export default Waveform;