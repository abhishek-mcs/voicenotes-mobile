import { useTheme } from 'context';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';

interface WaveformProps {
  recording: any;
}

const BAR_COUNT = 50;
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 35;
const BAR_SPACING = 2;

// Platform-specific metering ranges
const IOS_NOISE_THRESHOLD = -30;
const IOS_SPEECH_LEVEL = -5;
const ANDROID_NOISE_THRESHOLD = -60;
const ANDROID_SPEECH_LEVEL = -35;

const Waveform: React.FC<WaveformProps> = ({ recording }) => {
  const { Colors } = useTheme();
  const animatedBars = useRef<Animated.Value[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastMeterValue = useRef<number>(0);
  const animationTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isInitialized) {
      animatedBars.current = Array(BAR_COUNT).fill(0).map(() => new Animated.Value(MIN_HEIGHT));
      setIsInitialized(true);
    }

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  const normalizeMeterLevel = (meter: number) => {
    const noiseThreshold = Platform.OS === 'ios' ? IOS_NOISE_THRESHOLD : ANDROID_NOISE_THRESHOLD;
    const speechLevel = Platform.OS === 'ios' ? IOS_SPEECH_LEVEL : ANDROID_SPEECH_LEVEL;
    
    let normalizedValue = (meter - noiseThreshold) / (speechLevel - noiseThreshold);
    normalizedValue = Math.max(0, Math.min(1, normalizedValue));
    
    if (Platform.OS === 'ios') {
      // Smoother scaling for iOS
      normalizedValue = Math.pow(normalizedValue, 1.5);
      
      // Progressive scaling based on input level
      if (normalizedValue < 0.2) {
        normalizedValue *= 0.2;
      } else if (normalizedValue > 0.8) {
        // Prevent extreme values that could cause bars to get stuck
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

          if (Math.abs(normalizedMeter - lastMeterValue.current) > (Platform.OS === 'ios' ? 0.02 : 0.03)) {
            lastMeterValue.current = normalizedMeter;

            if (animationTimeout.current) {
              clearTimeout(animationTimeout.current);
            }

            animatedBars.current.forEach((bar, index) => {
              const delay = index * (Platform.OS === 'ios' ? 4 : 8);
              // Reduce random variation for higher volumes on iOS
              const randomFactor = Platform.OS === 'ios'
                ? (normalizedMeter > 0.8 
                  ? 0.7 + Math.random() * 0.6  // Less variation for loud sounds
                  : 0.4 + Math.random() * 1.2)  // Normal variation for regular sounds
                : 0.4 + Math.random() * 1.2;
              
              const targetHeight = MIN_HEIGHT + (normalizedMeter * (MAX_HEIGHT - MIN_HEIGHT) * randomFactor);

              Animated.sequence([
                Animated.delay(delay),
                Animated.spring(bar, {
                  toValue: targetHeight,
                  useNativeDriver: false,
                  stiffness: Platform.OS === 'ios' ? 300 : 200,
                  damping: Platform.OS === 'ios' ? 15 : 12,
                  mass: 0.3,
                })
              ]).start();
            });

            animationTimeout.current = setTimeout(() => {
              animatedBars.current.forEach((bar) => {
                Animated.spring(bar, {
                  toValue: MIN_HEIGHT + (normalizedMeter < 0.2 ? 2 : 0),
                  useNativeDriver: false,
                  stiffness: 100,
                  damping: 10,
                  mass: 0.3,
                }).start();
              });
            }, Platform.OS === 'ios' ? 80 : 100);
          }
        }
      });
    } else {
      animatedBars.current.forEach((bar) => {
        Animated.spring(bar, {
          toValue: MIN_HEIGHT + Math.random() * 2,
          useNativeDriver: false,
          stiffness: 100,
          damping: 10,
          mass: 0.3,
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