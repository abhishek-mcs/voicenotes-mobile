import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, Animated, Easing } from 'react-native'
import LargeButton from 'components/LargeButton'
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import { LinearGradient } from 'expo-linear-gradient'
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from "expo-haptics";
import { SvgXml } from 'react-native-svg'
import { isIOS, screenHeight } from 'utils/common'
import { useDispatch } from 'react-redux';
import { setSelectedScreen } from 'redux/reducers/onboardingData';

const Reviews = () => {
    const styles = useStyles()
    const dispatch=useDispatch()
    const {Colors, isLightMode}=useTheme()
    const [isPermissionGranted, setIsPermissionGranted] = useState(false)
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [contentHeight, setContentHeight] = useState(0);
    const SCROLL_DURATION = 150000; 
    
    // const CARD_HEIGHT = 160; 
    // const SCROLL_INTERVAL = 15000;

    const reviews = [
        {
            id: 1,
            profileImage: <Image source={require('../../../assets/images/profile1.png')} style={styles.profileImage} />,
            name: "David Singleton",
            rating: 5,
            review: "16 of those were me! I now have the iOS app wired to my action button and it's been wonderful. The speed and quality of voice recognition is amazing!",
        },
        {
            id: 2,
            profileImage: <Image source={require('../../../assets/images/profile2.png')} style={styles.profileImage} />,
            name: "Product Hunt",
            rating: 5,
            review: "Me doing voice notes and loving the simple UI",
        },
        {
            id: 3,
            profileImage: <Image source={require('../../../assets/images/profile3.png')} style={styles.profileImage} />,
            name: "Chris",
            rating: 5,
            review: "Voicenotes feels like an app I can show a family member and they can understand a real-world use case for it. So much of AI apps aren't.",
        },
        {
            id: 4,
            profileImage: <Image source={require('../../../assets/images/profile4.png')} style={styles.profileImage} />,
            name: "TechCrunch",
            rating: 5,
            review: "Built by creator-tipping platform Buy Me a Coffee's founder Jijo Sunny and his wife Aleesha, Voicenotes aims to set itself apart by including an AI assistant that lets you ask questions.",
        },
    ];

    const ReviewCard = ({ profileImage, name, rating, review }: any) => {
        return (
          <View style={[styles.card, isIOS ? styles.iosCard : styles.androidCard]}>
            {/* Profile Picture and Name */}
            <View style={styles.header}>
              {profileImage}
              <Text style={styles.name}>{name}</Text>
              {/* Star Rating */}
              <View style={styles.rating}>
                {Array.from({ length: rating }).map((_, index) => (
                  <SvgXml key={index} xml={onboardingSvg.star} />
                ))}
              </View>
            </View>
      
            {/* Review Text */}
            <Text style={styles.review}>{review}</Text>
          </View>
        );
    };

    useEffect(() => {
        // Start animation only after content height is known
        if (contentHeight > 0) {
            // Reset animation when reaching the end
            scrollY.addListener(({ value }) => {
                if (value >= contentHeight - screenHeight) {
                    scrollY.setValue(0);
                }
            });

            // Create smooth infinite scroll animation
            const startAnimation = () => {
                Animated.timing(scrollY, {
                    toValue: contentHeight,
                    duration: SCROLL_DURATION,
                    useNativeDriver: true,
                    easing: Easing.linear
                }).start((finished) => {
                    if (finished) {
                        scrollY.setValue(0);
                        startAnimation();
                    }
                });
            };

            startAnimation();
        }

        return () => {
            scrollY.removeAllListeners();
        };
    }, [contentHeight]);

    const checkNotificationPermission = async () => {
        const settings = await notifee.getNotificationSettings()
        if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
            setIsPermissionGranted(true)
        }
    }

    useEffect(() => {
      checkNotificationPermission()
    },[])

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        // dispatch(setSelectedScreen(12))
        if (isPermissionGranted) {
            dispatch(setSelectedScreen(13))
        } else {
            dispatch(setSelectedScreen(12))
        }
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.scrollContainer}>
            <Animated.ScrollView 
                ref={scrollViewRef} 
                style={[{ 
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    paddingHorizontal: 16, 
                    // marginTop: 25,
                    },
                    {
                        transform: [{ 
                            translateY: scrollY.interpolate({
                                inputRange: [0, contentHeight],
                                outputRange: [0, -contentHeight]
                            })
                        }]
                    }
                ]}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                scrollEnabled={false} // Disable manual scrolling
                onContentSizeChange={(_, height) => setContentHeight(height)}
                contentContainerStyle={{ 
                    paddingBottom: screenHeight/2,
                }} // Add padding to ensure smooth loop
            >
                {[...reviews, ...reviews].map((review, index) => (
                  <ReviewCard
                    key={index}
                    profileImage={review.profileImage}
                    name={review.name}
                    rating={review.rating}
                    review={review.review}
                  />
                ))}
            </Animated.ScrollView>
        </View>
        <View style={styles.footerContainer}>
            
            <View style={styles.mainTextContainer}>
                <Text style={styles.mainText}>Loved by 150,000 note-takers</Text>
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.settingsBtnBg}
                    style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                    onPress={onContinue}
                    text="Continue"
                    isLoading={false}
                    color={Colors.text4}
                />
            </View>
            <LinearGradient
              colors={isLightMode ? [Colors.whiteWithOpacity(0), Colors.whiteWithOpacity(1)] : [Colors.bgColor10(0), Colors.bgColor10(1)]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
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
            marginTop: isIOS ? 0 : 40
        },
        scrollContainer: {
            height: screenHeight * 0.8, // Adjust this value as needed
            overflow: 'hidden',
        },
        reviewsList: {
            paddingTop: 24,
            paddingHorizontal: 24,
        },
        reviewContainer: {
            paddingBottom: 8,
            backgroundColor: Colors.bottomBarButtonBg1,
            borderRadius: 12,
            minHeight: 30,
        },
        reviewHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
        },
        reviewText: {
            paddingBottom: 16,
            paddingHorizontal: 16,
            fontFamily: 'Primary',
            fontSize: 14,
            lineHeight: 18,
        },
        mainTextContainer: {
            // marginTop: 20,
            backgroundColor: Colors.whiteWithOpacity(1),
            paddingHorizontal: 16,
            paddingBottom: 18,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 30,
            lineHeight: 39,
            textAlign: 'center',
            color: Colors.black2
        },
        text: { 
            fontFamily:'Primary-Semibold',
            fontSize:16
        },
        card: {
            backgroundColor: Colors.bottomBarButtonBg1,
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
        },
        iosCard: {
            shadowColor:  Colors.text,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        androidCard: {
            shadowColor:  Colors.text,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        profileImage: {
            width: 24,
            height: 24,
            borderRadius: 12,
            marginRight: 16,
        },
        name: {
            fontSize: 14,
            fontFamily: 'Primary-Medium',
            color: Colors.black2,
            flex: 1,
        },
        rating: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4
        },
        starIcon: {
            marginLeft: 2,
        },
        review: {
            fontSize: 14,
            lineHeight: 19,
            fontFamily: 'Primary',
            color: Colors.black2,
        },
        buttonContainer1: {
            paddingHorizontal: 16,
        },
        button: {
            height:48,
            justifyContent:'center',
            alignItems:'center',
            borderRadius:16,
            flexDirection:'row'
        },
        gradient: {
            position: "absolute",
            // bottom: 100, // Adjust based on button height
            top: -50,
            left: 0,
            right: 0,
            height: 50,
        },
        footerContainer: {
            paddingBottom: 32,
            backgroundColor: Colors.whiteWithOpacity(1),
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Reviews