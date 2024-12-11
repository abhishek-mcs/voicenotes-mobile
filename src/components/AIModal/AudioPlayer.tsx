import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Slider } from '@rneui/base';
import { SvgXml } from 'react-native-svg';
import { playerSvg } from 'assets/svg/playerSvg';
import { useSignedUrlForChat } from 'queries/home';
import CircularLoader from 'components/common/loaders/circular-loader';
import { useTheme } from 'context';

const AudioPlayer = ({isAI=false,url=''}) => {
  const [sound, setSound] = useState<Audio.SoundObject|any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(100);
  const [status, setStatus] = useState<any>('');
  const [position, setPosition] = useState(0);
  const signedURL=useSignedUrlForChat()
  const { Colors } = useTheme()
  const styles = useStyles()

  useEffect(() => {
    const loadSound = async () => {
    if (!!url)
     signedURL.mutate(url,{
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 2,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 2,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground:true,
      });
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
        <CircularLoader width={24} height={24} color={Colors.bgColor}/>
        :<Pressable onPress={handlePlayPause}>
            <SvgXml xml={!isPlaying?playerSvg.play?.replace("color",isAI?Colors.bgColor13(1):Colors.primaryDark):playerSvg.pause?.replace("color",isAI?Colors.bgColor13(1):Colors.primaryDark)} />
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
          thumbStyle={[styles.thumb,isAI?{backgroundColor:Colors.bgColor13(1)}:{}]}
          minimumTrackTintColor={isAI?'white':Colors.primaryDark}
          maximumTrackTintColor={isAI?Colors.bgColor13(0.5):Colors.primaryDark3()}
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
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
  thumb:{ backgroundColor: Colors.primaryDark,width: 12, height: 12, borderRadius: 10}
}), [Colors]); // Recreate styles when Colors change
};

export default AudioPlayer;