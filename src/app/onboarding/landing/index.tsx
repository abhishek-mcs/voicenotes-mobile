import { View, Text, SafeAreaView, StyleSheet, FlatList } from 'react-native'
import { setSelectedScreen } from 'redux/reducers/onboardingData'
import LargeButton from 'components/LargeButton'
import { screenHeight, screenWidth } from 'utils/common'
import { useTheme } from "context"
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Image } from 'react-native'
import { useDispatch } from 'react-redux'
import * as Haptics from "expo-haptics";


const Landing = () => {
    const styles = useStyles()
    const router = useRouter()
    const {Colors, isLightMode}=useTheme()
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setActiveIndex(slideIndex);
    };

    const data = [
        {
          id: "1",
          image: <Image source={isLightMode ? require('../../../assets/images/landing1.png') : require('../../../assets/images/landing1-dark.png')} style={styles.landingImage} />,
        },
        {
          id: "2",
          image: <Image source={isLightMode ? require('../../../assets/images/landing2.png') : require('../../../assets/images/landing2-dark.png')} style={styles.landingImage} />,
        },
        {
          id: "3",
          image: <Image source={isLightMode ? require('../../../assets/images/landing3.png') : require('../../../assets/images/landing3-dark.png')} style={styles.landingImage} />,
        },
    ];

    const getStarted = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        dispatch(setSelectedScreen(2))
    }

    const onAccount = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {}
        );
        // router.push("/onboarding/")
        router.push("/auth/landingPage/")
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>Record and Remember</Text>
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
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.image}
              </View>
            )}
          />
        
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {data.map((_, index) => (
              <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
            ))}
          </View>
        </View>
        <View style={styles.footerContainer}>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.settingsBtnBg}
                    style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                    onPress={getStarted}
                    text="Get started"
                    isLoading={false}
                    color={Colors.text4}
                />
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.bgColor3(0.1)}
                    style={[styles.button, { backgroundColor: Colors.bgColor3(0.1) }]}
                    onPress={onAccount}
                    text="I already have an account"
                    isLoading={false}
                    color={Colors.black2}
                />
            </View>
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
            justifyContent: 'center',
            alignItems: 'center',
        },
        mainText: {
            fontFamily: 'Secondary',
            fontSize: 64,
            textAlign: 'center',
            color: Colors.black2
        },
        imageContainer: {
            paddingTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: screenWidth,
            height: screenHeight/2.5,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pagination: {
            flexDirection: "row",
            marginTop: 20,
            alignItems: 'center'
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.grey8,
            marginHorizontal: 5,
        },
        activeDot: {
            backgroundColor: Colors.black2,
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        landingImage: {
            width: screenWidth/1.2,
            resizeMode: 'contain',
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
            position: 'absolute',
            bottom: 40,
            right: 0,
            left: 0
        }
    }), [Colors]);
}

export default Landing