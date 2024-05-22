import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Button, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { color, Slider } from '@rneui/base';
import Colors from 'assets/Colors';
import { SvgXml } from 'react-native-svg';
import { playerSvg } from 'assets/svg/playerSvg';
import { useSignedUrlForChat } from 'queries/home';
import CircularLoader from 'components/common/loaders/circular-loader';

const { width } = Dimensions.get('window');

export default ({isAI=false,url=''}) => {
  const [sound, setSound] = useState<Audio.SoundObject|any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(100);
  const [status, setStatus] = useState<any>('');
  const [position, setPosition] = useState(0);
  const signedURL=useSignedUrlForChat()

  useEffect(() => {
    const loadSound = async () => {
     signedURL.mutateAsync(url,{
        onSuccess:async(data:any)=>{
          const uri=data?.request?.responseURL
          if (uri) {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false ,progressUpdateIntervalMillis:100},
            onPlaybackStatusUpdate
          );
          setSound(sound);
        }}})
    };

    loadSound();

    return () => {
      if (sound) {
        if(isPlaying){
          sound?.pauseAsync()
          setIsPlaying(false)
        }
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(()=>{
    return () => {
      if (sound) {
        if(isPlaying){
          sound?.pauseAsync()
          setIsPlaying(false)
        }
        sound.unloadAsync();
      }
    };
  },[sound])

  const onPlaybackStatusUpdate = (status:any) => {
    if (status?.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      setStatus(status);
    }
  };
  
  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      }else if((duration-position)<=100) {
        await sound.replayAsync()
      }else {
        await sound.playAsync();
      }
    }
  };

  const handleSliderValueChange = async (value:any) => {
    if (sound) {
      const newPosition = value;
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSliderSlidingComplete = async () => {
    if (sound) {
      await sound.playAsync();
    }
  };

  return (
    <View style={styles.container}>
        {sound==null?
        <CircularLoader width={24} height={24} color={isAI?'white':Colors.primary}/>
        :<Pressable onPress={handlePlayPause}>
            <SvgXml xml={!isPlaying?playerSvg.play?.replace("color",isAI?Colors.whiteWithOpacity(1):Colors.primary):playerSvg.pause?.replace("color",isAI?Colors.whiteWithOpacity(1):Colors.primary)} />
        </Pressable>}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          disabled={sound==null}
          value={position}
          onValueChange={handleSliderValueChange}
          onSlidingComplete={handleSliderSlidingComplete}
          thumbStyle={[styles.thumb,isAI?{backgroundColor:'white'}:{}]}
          minimumTrackTintColor={isAI?'white':Colors.primary}
          maximumTrackTintColor={isAI?Colors.whiteWithOpacity(0.5):Colors.primaryWithOpacity(0.1)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft:12
  },
  slider: {
    width:'92%'
  },
  thumb:{ backgroundColor: Colors.primary,width: 12, height: 12, borderRadius: 10}
});