import React from 'react';
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { isIOS } from "utils/common";

interface SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    trackColor?: {
        true: string;
        false: string;
    };
    thumbColor?: string;
    style?: any;
}

const SwitchAndroid: React.FC<SwitchProps> = ({
    value,
    onValueChange,
    trackColor = { true: '#34C759', false: '#e9e9ea' },
    thumbColor = '#ffffff',
    style
}) => {
    if (isIOS) return null;

    const [animatedValue] = React.useState(new Animated.Value(value ? 1 : 0));

    React.useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: value ? 1 : 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values for proper thumb movement
    });

    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={[styles.container, style]}
        >
            <Animated.View
                style={[
                    styles.track,
                    {
                        backgroundColor: value ? trackColor.true : trackColor.false,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX }],
                            backgroundColor: thumbColor,
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 51,
        height: 31,
    },
    track: {
        width: 51,
        height: 31,
        borderRadius: 31,
        justifyContent: 'center',
    },
    thumb: {
        width: 27,
        height: 27,
        borderRadius: 27,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 2,
    }
});

export default SwitchAndroid;