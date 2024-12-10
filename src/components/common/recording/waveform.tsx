import { useTheme } from 'context';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Rect, Svg } from 'react-native-svg';

interface WaveformProps {
  recording: any; // Replace 'any' with your Recording type
  barCount?: number;
  baseHeight?: number;
  color?: string;
}

const Waveform: React.FC<WaveformProps> = ({
  recording,
}) => {
  const [meterLevel, setMeterLevel] = useState(1);
  const barCount = 70;
  const maxHeight = 25;
  const { Colors } = useTheme()

  useEffect(() => {
    if (recording) {
      recording.setOnRecordingStatusUpdate((status: any) => {
        if (status.metering) {
          // Convert metering value to a scale of 0-1
          const normalizedMeter = Math.max(0, (status.metering + 160) / 160);
          setMeterLevel(normalizedMeter);
        }
      });
    }else{
      setMeterLevel(1)
    }
  }, [recording]);

  return (
    <View style={styles.container}>
      <Svg width="100%" height={25}>
        {Array.from({ length: barCount }, (_, index) => (
          <Rect
            key={index}
            x={index * 6}
            y={50 - meterLevel * 50 }
            width={2}
            height={50 * meterLevel}
            fill={Colors.blackWithOpacity(1)}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent:'center',
    height: 25,
  }
});

export default Waveform