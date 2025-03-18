import { View, Text, SafeAreaView, StyleSheet, Image, Dimensions, FlatList, Platform } from 'react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics"
import { isAndroid, screenHeight, screenWidth } from 'utils/common'
import { useDispatch } from 'react-redux'
import { setSelectedScreen } from 'redux/reducers/onboardingData'
import { Animated } from 'react-native'
import { analytics } from '../../../../firebaseConfig'

const { width } = Dimensions.get("window");

const Meetings = () => {
    const styles = useStyles()
    const {Colors}=useTheme()
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    const animatedValues = useMemo(() =>
        [new Animated.Value(screenWidth), new Animated.Value(screenWidth), new Animated.Value(screenWidth)],
        []
      );
    
    useEffect(() => {
      Animated.stagger(150, animatedValues.map(anim => 
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      )).start();
    }, [animatedValues]);

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(slideIndex);
    };

    const data = [
        {
          id: "1",
          image: <Image source={require('../../../assets/images/meetings1.png')} style={styles.meetingImage1} />,
        },
        {
          id: "2",
          image: <Image source={require('../../../assets/images/meetings2.png')} style={styles.meetingImage2} />,
        },
        {
          id: "3",
          image: <Image source={require('../../../assets/images/meetings3.png')} style={styles.meetingImage3} />,
        },
    ];

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        analytics().logEvent('onboarding_meetings').catch(e=>{console.log(e)})
        dispatch(setSelectedScreen(9))
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Great for in-person & virtual meetings</Text>
        </View>
        <View style={styles.subheadingContainer}>
            <Text style={styles.subheading}>Transcribe, summarize, ask AI, and share.</Text>
        </View>
        <View style={styles.imageContainer}>
          {/* Slider */}
          <FlatList
            ref={flatListRef}
            data={data}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            renderItem={({ item, index }) => (
              <Animated.View style={[styles.card, { transform: [{ translateX: animatedValues[index] }] }]}> 
                {item.image}
              </Animated.View>
            )}
          />

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {data.map((_, index) => (
              <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
            ))}
          </View>
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
            // marginTop: Platform.OS === 'ios' ? 0 : 40
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
            paddingTop: 12,
            paddingBottom: 10,
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
        imageContainer: {
            paddingTop: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: width,
            height: screenHeight/2.2,
            justifyContent: 'center',
            alignItems: 'center'
        },
        pagination: {
            flexDirection: "row",
            alignItems: 'center'
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.grey8,
            marginHorizontal: 5,
            marginTop: 10
        },
        activeDot: {
            backgroundColor: Colors.black2,
            width: 10,
            height: 10,
            borderRadius: 5,
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
        meetingImage1: {
            width: screenWidth / 1.2,
            resizeMode: 'contain',
        },
        meetingImage2: {
            width: screenWidth / 1.3,
            resizeMode: 'contain',
        },
        meetingImage3: {
            width: screenWidth / 1.1,
            resizeMode: 'contain',
        },
        footerContainer: {
            height: isAndroid ? 50 : 70,
            position: 'absolute',
            bottom: 32,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Meetings