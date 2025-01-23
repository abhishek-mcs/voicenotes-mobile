import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import AudioWaveform from './AudioWaveform';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  color?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = Dimensions.get('window').width - 40,
  height = 100,
  color = '#007AFF',
}) => {
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array(1024).fill(0));
  const recording = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    setupAudioRecording();
    return () => {
      stopRecording();
    };
  }, []);

  const setupAudioRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 1,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      });

      recording.current = newRecording;

      // Start recording and visualization
      await newRecording.startAsync();
      startVisualization();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const startVisualization = () => {
    if (!recording.current) return;

    // Update audio data based on recording metering
    recording.current.setOnRecordingStatusUpdate((status: any) => {
      if (status.metering !== undefined) {
        // Convert metering to audio data format
        const normalizedMeter = Math.max(0, (status.metering + 160) / 160);
        const newData = new Float32Array(1024);
        for (let i = 0; i < newData.length; i++) {
          newData[i] = normalizedMeter * Math.sin(i * 0.01); // Create a sine wave pattern
        }
        setAudioData(newData);
      }
    });
  };

  const stopRecording = async () => {
    if (recording.current) {
      await recording.current.stopAndUnloadAsync();
      recording.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <AudioWaveform
        audioData={audioData}
        width={width}
        height={height}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioVisualizer; 