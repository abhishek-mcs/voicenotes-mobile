import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Audio } from 'expo-av';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'context';
import { screenWidth } from 'utils/common';

interface Props {
  recording?: Audio.Recording | null;
  isAI?:boolean
}
const waveViewWidth = 0.85
const tabGap = 36
const waveWidth = 2
const waveGap = 2
const numOfWaves = Math.ceil(((screenWidth-tabGap)*waveViewWidth)/(waveWidth+waveGap)+2)

const generateDummyWaveformData = () => {
  return Array.from({ length: numOfWaves }, (_, i) => 1);
}

const Waveform: React.FC<Props> = ({ recording,isAI=false}) => {
  const [barHeights, setBarHeights] = useState(new Array(70).fill(1));
  const animatedValues = useRef(barHeights.map(() => new Animated.Value(1)));
  const styles = useStyles()

  useEffect(() => {
    if (recording) {
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering != null) {
          updateWaveform(status.metering);
        }
      });
    }else{
      setBarHeights(generateDummyWaveformData())
    }
  }, [recording]);

  const updateWaveform = (metering:number) => {
    // console.log(metering)
    // Normalize metering value (Expo AV returns values like -160 to 0 dB)
    const normalizedMetering = Math.max(1, 25 + metering / 6.4); // Convert to range 0-25
    const newWaveformData = [...barHeights.slice(1),normalizedMetering];

    // Randomly select a few indices to change
    const numberOfBarsToChange = 5; // Number of bars to randomly change
    const indicesToChange = new Set<number>();

    // Randomly select unique indices
    while (indicesToChange.size < numberOfBarsToChange) {
      const randomIndex = Math.floor(Math.random() * numOfWaves);
      indicesToChange.add(randomIndex);
    }

    // Update the selected indices with random heights
    indicesToChange.forEach(index => {
      const randomHeight = Math.floor(Math.random() * 25); // Random height between 0 and 25
      newWaveformData[index] = Math.min(randomHeight, 25); // Cap the height to a maximum value
    });
    console.log(indicesToChange,numOfWaves)
    // Smooth the data (optional: moving average)
    const smoothedWaveform = smoothWaveform(newWaveformData, 25);
    // console.log(smoothedWaveform)
    setBarHeights(smoothedWaveform);

    // Animate bar heights
    smoothedWaveform.forEach((height:number, index:number) => {
      Animated.timing(animatedValues?.current[index], {
        toValue: height,
        duration: 100,
        useNativeDriver: false,
      }).start();
    });
  };

  const smoothWaveform = (data:number[], windowSize:number) => {
    return data.map((_, i, array) => {
      const start = Math.max(1, i - Math.floor(windowSize / 2));
      const end = Math.min(array.length, i + Math.ceil(windowSize / 2));
      const window = array.slice(start, end);
      return window.reduce((sum, value) => sum + value, 0) / window.length;
    });
  };

  return (
    <View style={styles.container}>
      {animatedValues.current?.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: animatedValue,
            },
          ]}
        />
      ))}
    </View>
  );
};


const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center",
    maxHeight: 25
  },
  bar: {
    width: 2,
    marginHorizontal: 1, // Total gap = 2 (1 + 1)
    backgroundColor: Colors.blackWithOpacity(1),
  },
}),[Colors])}

export default Waveform;