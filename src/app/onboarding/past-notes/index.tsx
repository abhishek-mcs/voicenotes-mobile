import { View, Text, SafeAreaView, StyleSheet, Image, Platform, Animated, Easing } from 'react-native'
import LargeButton from 'components/Largebutton'
import { screenWidth, isAndroid, screenHeight } from 'utils/common';
import Swiper from "react-native-deck-swiper";
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics";
import { setSelectedScreen } from 'redux/reducers/onboardingData';
import { useDispatch } from 'react-redux';

const PastNotes = () => {
    const styles = useStyles()
    const {Colors}=useTheme()
    const dispatch=useDispatch()
    const [index, setIndex] = useState(0);

    // Rotation Animation
    const handRotation = useRef(new Animated.Value(0)).current;

    const handleSwiped = () => {
        setIndex((prevIndex) => (prevIndex + 1) % data.length); 
    };

    const data = [
        {
          id: "1",
          image: <Image source={require('../../../assets/images/pastnotes1.png')} style={styles.noteImage} />,
        },
        {
          id: "2",
          image: <Image source={require('../../../assets/images/pastnotes2.png')} style={styles.noteImage} />,
        },
        {
          id: "3",
          image: <Image source={require('../../../assets/images/pastnotes3.png')} style={styles.noteImage} />,
        },
    ];

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        dispatch(setSelectedScreen(11))
    }

    useEffect(() => {
        Animated.loop(
            Animated.timing(handRotation, {
                toValue: 1,
                duration: 1000, // Smoother transition
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

    const rotateInterpolation2 = handRotation.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-5deg", "5deg"], // Less rotation for a subtle effect
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
            <Swiper
                cards={data}
                renderCard={(item, cardIndex) => (
                  <Animated.View 
                    style={[
                        styles.cardImage,
                        cardIndex === 0
                            ? { transform: [{ rotate: rotateInterpolation2 }] } // Rotate only the first card
                            : {},
                    ]}
                  >
                    {item.image}
                  </Animated.View>
                )}
                onSwiped={handleSwiped}
                cardIndex={index}
                infinite
                backgroundColor="transparent"
                stackSize={3}
            />
            {/* Hand Icon Animation */}
            <Animated.Image
                source={require('../../../assets/images/hand.png')}
                style={[
                    styles.handIcon,
                    {
                        transform: [{ rotate: rotateInterpolation }],
                    },
                ]}
            />
        </View>
        <View style={[styles.buttonContainer1, styles.footerContainer]}>
            <LargeButton
                underlayColor={Colors.settingsBtnBg}
                style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                onPress={onContinue}
                text="Continue"
                isLoading={false}
                color={Colors.text4}
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
            marginTop: Platform.OS === 'ios' ? 0 : 40
        },
        mainTextContainer: {
            marginTop: 20,
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 48,
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
            // width: screenWidth * 0.9,
            height: screenHeight * 0.4,
            // borderRadius: 10,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
        },
        noteImage: {
            width: screenWidth / 1.2,
            resizeMode: 'contain',
        },
        firstImage: {
            width: screenWidth,
            resizeMode: 'contain',
        },
        handIcon: {
            width: 60,
            height: 50,
            position: "absolute",
            bottom: -(screenHeight/2.2), // Adjust as needed
            right: 30,
            opacity: 0.8,
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
            height: isAndroid ? 50 : 70,
            position: 'absolute',
            bottom: 27,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default PastNotes