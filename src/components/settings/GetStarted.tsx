import { settingsSvg } from "assets/svg/settingsSvg";
import { useTheme } from "context/theme-context";
import { useEffect, useMemo } from "react";
import { Animated, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import { SvgXml } from "react-native-svg";

interface GetStartedProps {
    onGetStarted: () => void;
    screenSlide: Animated.Value;
}

const GetStarted = ({ onGetStarted, screenSlide }: GetStartedProps): JSX.Element => {
    const { Colors } = useTheme();
    const styles = useStyles();

    const svgScale = new Animated.Value(0);
    const textSlide = new Animated.Value(-20); // Changed from 30 to -20
    const textOpacity = new Animated.Value(0);
    const buttonSlide = new Animated.Value(-20); // Changed from 30 to -20
    const buttonOpacity = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            // SVG pop animation
            Animated.spring(svgScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 40,
                friction: 5,
            }),
            // Text and button animations
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(textSlide, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 300,
                    delay: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonSlide, {
                    toValue: 0,
                    duration: 300,
                    delay: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View 
            style={[
                styles.getstarted,
                {
                    transform: [{
                        translateX: screenSlide.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -400]
                        })
                    }]
                }
            ]}
        >
            <Animated.View style={{ transform: [{ scale: svgScale }] }}>
                <SvgXml
                    xml={settingsSvg.publish}
                    width={Dimensions.get('window').width * 1}
                    height={Dimensions.get('window').height * 0.5}
                />
            </Animated.View>
            
            <Animated.Text 
                style={[
                    styles.gsheader,
                    { 
                        transform: [{ translateY: textSlide }],
                        opacity: textOpacity
                    }
                ]}
            >
                Start a Voicenotes page
            </Animated.Text>
            
            <Animated.Text 
                style={[
                    styles.gscaption,
                    { 
                        transform: [{ translateY: textSlide }],
                        opacity: textOpacity
                    }
                ]}
            >
                Turn your voice notes into mini-podcasts — record on the fly and hit publish.
            </Animated.Text>
            
            <Animated.View 
                style={[
                    { 
                        transform: [{ translateY: buttonSlide }],
                        opacity: buttonOpacity,
                        width: '100%',
                        alignItems: 'center'
                    }
                ]}
            >
                <Pressable onPress={onGetStarted} style={styles.gsbutton}>
                    <Text style={styles.gsactionlabel}>Get started</Text>
                    <SvgXml 
                        xml={settingsSvg.rightArrow.replace("white", Colors.whiteWithOpacity(1))} 
                        width={15}
                    />
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

const useStyles = () => {
    const { Colors } = useTheme()
    const screenWidth = Dimensions.get('window').width;

    return useMemo(() => StyleSheet.create({
        getstarted: {
            flex: 1,
            width: '90%',
            alignItems: 'center',
            paddingHorizontal: screenWidth * 0.02
        },
        imageContainer: {
            marginBottom: screenWidth * 0.05,
        },
        gsheader: {
            color: Colors.text,
            fontSize: screenWidth * 0.05,
            fontFamily: 'Primary-Medium',
            textAlign: 'center',
            marginTop: screenWidth * 0.03,
        },
        gscaption: {
            color: Colors.text10,
            fontSize: screenWidth * 0.042,
            fontFamily: 'Primary',
            marginTop: screenWidth * 0.037,
            textAlign: 'center',
            paddingHorizontal: screenWidth * 0.02,
        },
        gsbutton: {
            width: '90%',
            backgroundColor: Colors.askLogo,
            height: screenWidth * 0.12,
            marginTop: screenWidth * 0.075,
            borderRadius: screenWidth * 0.06,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: screenWidth * 0.025,
        },
        gsactionlabel: {
            color: Colors.whiteWithOpacity(1),
            fontFamily: 'Primary-Bold',
            fontSize: screenWidth * 0.035,
        }
    }), [Colors])
}

export default GetStarted
