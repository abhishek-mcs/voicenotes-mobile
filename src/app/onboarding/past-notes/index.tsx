import { View, Text, SafeAreaView, StyleSheet, Image, Animated, Easing } from 'react-native'
import LargeButton from 'components/LargeButton'
import { screenWidth, screenHeight, isIOS } from 'utils/common';
import Swiper from "react-native-deck-swiper";
import LottieView from 'lottie-react-native';
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics";
import { setSelectedScreen } from 'redux/reducers/onboardingData';
import { useDispatch } from 'react-redux';
import { analytics } from '../../../../firebaseConfig';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { SvgXml } from 'react-native-svg';
import { onboardingSvg } from 'assets/svg/onboardingSvg';

const PastNotes = () => {
    const styles = useStyles()
    const {Colors,isLightMode}=useTheme()
    const dispatch=useDispatch()
    const [index, setIndex] = useState(0);
    const [swiped, setSwiped] = useState(false)
    const [finished, setFinished] = useState(false);
    const [animationCompleted, setAnimationCompleted] = useState(false);

    const animatedValues = useMemo(() =>
        [new Animated.Value(screenWidth), new Animated.Value(screenWidth), new Animated.Value(screenWidth)],
        []
      );
  
    useEffect(() => {
        Animated.stagger(150, animatedValues.map((anim) =>
            Animated.timing(anim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        )).start(() => setAnimationCompleted(true));
    }, [animatedValues]);

    // Rotation Animation
    const handRotation = useRef(new Animated.Value(0)).current;

    const handleSwiped = () => {
        setIndex((prevIndex) => {
            if (prevIndex < data.length - 1) {
                return prevIndex + 1;
            }
            setFinished(true);
            return prevIndex;
        });
    };

    const data = [
        {
          id: "1",
          image: <Image source={isLightMode ? require('../../../assets/images/pastnotes1.png') : require('../../../assets/images/pastnotes1-dark.png')} style={styles.noteImage} />,
        },
        {
          id: "2",
          image: <Image source={isLightMode ? require('../../../assets/images/pastnotes2.png') : require('../../../assets/images/pastnotes2-dark.png')} style={styles.noteImage} />,
        },
        {
          id: "3",
          image: <Image source={isLightMode ? require('../../../assets/images/pastnotes3.png') : require('../../../assets/images/pastnotes3-dark.png')} style={styles.noteImage} />,
        },
    ];

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        analytics().logEvent('onboarding_past_notes').catch(e=>{console.log(e)})
        AppEventsLogger.logEvent('fb_onboarding_past_notes');
        dispatch(setSelectedScreen(11))
    }

    useEffect(() => {
        Animated.loop(
            Animated.timing(handRotation, {
                toValue: 1,
                duration: 700, // Smoother transition
                easing: Easing.inOut(Easing.sin), // Natural back-and-forth easing
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // Interpolate rotation value to degrees
    const rotateInterpolation = handRotation.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-15deg", "15deg"], // Rotate between -15° and 15°
    });


  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Voicenotes brings your past notes to life</Text>
        </View>
        <View style={styles.subheadingContainer}>
            <Text style={styles.subheading}>Our AI automatically resurfaces your past notes</Text>
        </View>
        <View style={styles.cardContainer}>
        {!finished ? (
            <Swiper
                cards={data}
                renderCard={(item: any) => (
                    <Animated.View style={[styles.cardImage, { transform: [{ translateX: animatedValues[index] }] }]}>                            
                        {item.image}
                    </Animated.View>
                )}
                onSwiped={handleSwiped}
                cardIndex={index}
                infinite={false} // Stop after last card
                backgroundColor="transparent"
                stackSize={3}
                onSwiping={() => setSwiped(true)}
            />
        ) : (
            <View style={{ height: '60%',justifyContent: 'center', alignItems: 'center'}}>
                <SvgXml xml={onboardingSvg.check} />
            </View> 
        )}
            {/* Hand Icon Animation */}
            {/* <Animated.Image
                source={require('../../../assets/images/hand.png')}
                style={[
                    styles.handIcon,
                    {
                        transform: [{ rotate: rotateInterpolation }],
                    },
                ]}
            /> */}
            {!swiped && !finished && <View style={styles.handContainer}>
                <LottieView source={isLightMode ? require('../../../assets/lottie/hand.json') : require('../../../assets/lottie/hand-dark.json')} autoPlay loop style={styles.handIcon}/>
            </View>}
        </View>
        
        <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.blackWithOpacity(0.8)}
                style={[styles.button, { backgroundColor: Colors.black2 }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.white1}
            />
        </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
        const { Colors } = useTheme();
        return useMemo(() => StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: Colors.whiteWithOpacity(1),
            // marginTop: Platform.OS === 'ios' ? 0 : 40
        },
        mainTextContainer: {
            marginTop: screenHeight > 720 ? 20 : 0,
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: screenWidth/9,
            lineHeight: 56,
            textAlign: 'center',
            color: Colors.black2
        },
        subheadingContainer: {
            paddingHorizontal: 16,
            paddingTop: 16,
            // paddingBottom: 5,
            justifyContent: 'center',
            alignItems: 'center',
        },
        subheading: {
            fontFamily: 'Primary',
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            color: Colors.grey3
        },
        cardContainer: {
            // flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        cardImage: {
            width: screenWidth * 0.9,
            // borderRadius: 10,
            // overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: "#fff",
            
            shadowColor: Colors.blackWithOpacity(0.6),
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,

            position: 'absolute',
            bottom: screenHeight > 900 ? 300 : screenHeight > 800 && screenHeight < 900 ? 200 : screenHeight > 700 && screenHeight < 800 ? 150 : 80,
            right: 0,
            left: 0
        },
        noteImage: {
            width: screenWidth,
            resizeMode: 'contain',
        },
        firstImage: {
            width: screenWidth,
            resizeMode: 'contain',
        },
        handContainer: {
            // flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        handIcon: {
            width: 120,
            height: 120,
            position: "absolute",
            bottom: isIOS ? -screenHeight/2 : -screenHeight/1.9,
            // right: 0,
            // opacity: 0.8,
        },
        caughtUpText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.black2,
            textAlign: 'center',
            marginTop: 20,
        },
        text: { 
            fontFamily:'Primary-Semibold',
            fontSize:16
        },
        buttonContainer1: {
            padding: 16,
            paddingBottom: 0,
        },
        button: {
            height:48,
            justifyContent:'center',
            alignItems:'center',
            borderRadius:16,
            flexDirection:'row'
        },
        footerContainer: {
            // height: isAndroid ? 50 : 70,
            position: 'absolute',
            bottom: 27,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default PastNotes