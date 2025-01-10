import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import Svg, { Rect } from 'react-native-svg';
import { RecordingStatus } from 'expo-av/build/Audio';
import Animated, { Easing, FadeInRight, ReduceMotion, SlideInRight, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { screenWidth } from 'utils/common';
import Colors from 'assets/Colors';
import { useTheme } from 'context';

interface Props {
  recording?: Audio.Recording | null;
  isAI?:boolean
}

const Waveform: React.FC<Props> = ({ recording,isAI=false}) => {
  // const [meteringValues, setMeteringValues] = useState<number[]>([]);
  const [temp, setTemp] = useState([0]);
  const tempRef = useRef({ temp: [0,], isPlaying: false })
  const width = useSharedValue(10);
  const { Colors } = useTheme()

  const linear = Easing.linear
  const customEasing = (value: number) => {
    'worklet'
    // Perform calculations here
    return value; // Ensure a number is returned
  };

  const style = useAnimatedStyle(() => {
    return {
      transform:[{translateX: withTiming(width.value, {
        duration: 100,
        easing: customEasing,
        reduceMotion: ReduceMotion.Never
      }, () => {

      }),}]

    };
  });

  const generateDummyWaveformData = () => {
    return Array.from({ length: 30 }, (_, i) => (  Math.floor(Math.random() * 25) + 1 ));
  };

  useEffect(() => {
    if (recording) {
      const prepareRecording = async () => {
        recording?.setOnRecordingStatusUpdate((status: RecordingStatus) => {
          if (status.isRecording && status.metering !== undefined) {
            console.log(status.metering)
            let temp1 = [...tempRef.current.temp, (status.metering + 37) * 1.2]
            tempRef.current.temp = temp1
            setTemp(temp1)
            width.value = (width.value) % (screenWidth-200)
          }
        });
      };

      prepareRecording();
    }else{
      setTemp(generateDummyWaveformData())
    }
  }, [recording]);

  return (
    <View style={{height:25,width:screenWidth-200,overflow:'hidden'}}>
    <Animated.View style={{ backgroundColor: 'transparent', height: 25,width:screenWidth-200, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <Animated.View entering={FadeInRight} style={[{ display: 'flex', flexDirection: 'row', overflow: 'hidden', backgroundColor: 'transparent', gap: 1, alignItems: 'center' }, style]}>
      {temp.map(t => {
        return <Animated.View entering={ZoomIn} style={{ height: t>25?25:t > 10 ? t : 1.15, borderWidth:2, borderRadius: 200, borderColor: Colors.darkWithOpacity(1), }} />
      })}
    </Animated.View>
    </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex:1
  },
});

export default Waveform;