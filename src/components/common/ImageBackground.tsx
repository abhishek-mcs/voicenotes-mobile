import { Image } from 'expo-image';
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

type Props = {
    uri: string,
    children?: React.ReactNode,
    style?: any,
    imageStyle?: any,
    resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down',
};

const ImageBackground: React.FC<Props> = ({ uri, children, style, imageStyle, resizeMode = 'cover' }) => {
    return (
        <View style={[{ flex: 1 }, style]}>
            <Image
                source={{ uri }}
                style={[StyleSheet.absoluteFill, imageStyle]}
                contentFit={resizeMode}
                priority={'high'}
            />
            {children}
        </View>
    );
};

export default ImageBackground;