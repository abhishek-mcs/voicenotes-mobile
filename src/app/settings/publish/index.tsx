import { settingsSvg } from "assets/svg/settingsSvg";
import GetStarted from "components/settings/GetStarted";
import Header from "components/settings/header";
import { useTheme } from "context/theme-context";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { SvgXml } from "react-native-svg";

function Publish() {
    const router = useRouter();
    const styles = useStyles();
    const { Colors } = useTheme()

    const [authorSetup, setAuthorSetup] = useState<boolean>(false)

    const screenSlide = new Animated.Value(0);

    // Screen transition animation
    useEffect(() => {
        Animated.timing(screenSlide, {
            toValue: authorSetup ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [authorSetup]);

    return <Header
        onCancel={() => router.back()}
        label=""
        cancelLabel="Back"
        working={false}
    >
        {!authorSetup ? 
            <GetStarted
                onGetStarted={() => setAuthorSetup(true)}
                screenSlide={screenSlide}
            /> :
            <Animated.View 
                style={[
                    styles.root,
                    {
                        transform: [{
                            translateX: screenSlide.interpolate({
                                inputRange: [0, 1],
                                outputRange: [400, 0]
                            })
                        }]
                    }
                ]}
            >
                <Text>Test</Text>
            </Animated.View>}
    </Header>
}

const useStyles = () => {
    const { Colors } = useTheme()
    
    return useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            width: '100%',
            backgroundColor: 'red'
        }
    }), [Colors])
}

export default Publish;
