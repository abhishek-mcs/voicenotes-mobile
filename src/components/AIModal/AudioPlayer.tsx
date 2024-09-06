import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import Colors from 'assets/Colors';
import { SvgXml } from 'react-native-svg';
import { playerSvg } from 'assets/svg/playerSvg';
import { useSignedUrlForChat } from 'queries/home';
import CircularLoader from 'components/common/loaders/circular-loader';
import { Waveform, type IWaveformRef } from '@simform_solutions/react-native-audio-waveform';
import { screenWidth } from 'utils/common';

export default ({isAI=false,url=''}) => {
  const [sound, setSound] = useState<Audio.SoundObject|any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<any>('');
  const [position, setPosition] = useState(0);
  const signedURL=useSignedUrlForChat()
  const waveformRef=useRef<IWaveformRef>(null)
  const [source,setUrl]=useState('')

  useEffect(() => {
    const loadSound = async () => {
    if (!!url)
     signedURL.mutate(url,{
        onSuccess:async(data:any)=>{
          const uri=data?.request?.responseURL
          setUrl(uri)
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

  const formattedDuration=useMemo(()=>new Date(duration).toISOString().substring(14, 19),[duration])
  return (
    <View style={styles.container}>
      {sound == null ? (
        <CircularLoader
          width={24}
          height={24}
          color={!isAI ? "white" : Colors.primary}
        />
      ) : (
        <Pressable onPress={handlePlayPause}>
          <SvgXml
            xml={
              !isPlaying
                ? playerSvg.play?.replace(
                    "color",
                    isAI ? Colors.whiteWithOpacity(1) : Colors.primary
                  )
                : playerSvg.pause?.replace(
                    "color",
                    isAI ? Colors.whiteWithOpacity(1) : Colors.primary
                  )
            }
          />
        </Pressable>
      )}
      <View style={styles.sliderContainer}>
        <Waveform
          mode="static"
          ref={waveformRef}
          path={'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav'}
          candleSpace={2}
          candleWidth={4}
          candleHeightScale={4}
          waveColor='#0d0d0d'
          scrubColor="#0d0d0d"
          containerStyle={{width:100,flex:1,height:25,backgroundColor:'blue'}}
          onPlayerStateChange={(playerState) => console.log(playerState)}
          onPanStateChange={(isMoving) => console.log(isMoving)}
        />
        <Text
          style={{
            color: Colors.grey,
            fontFamily: "Primary-Medium",
            fontSize: 12,
          }}
        >
          {formattedDuration}
        </Text>
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
    width:'68%',marginRight:12
  },
  thumb:{ backgroundColor: Colors.primary,width: 12, height: 12, borderRadius: 10},
  waveformContainer: {
  },
});