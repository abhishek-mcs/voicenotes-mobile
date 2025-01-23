import Colors from 'assets/Colors';
import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, LayoutAnimation, ActivityIndicator } from 'react-native';
import { screenWidth } from 'utils/common';
import CircularLoader from '../loaders/circular-loader';
import { useTheme } from 'context';

const { width } = Dimensions.get('window');

interface SnackbarProps {
    message: string;
    actionText?: string;
    onAction?: () => void;
    snackHeight?: number;
    count?:number;
}

export default forwardRef(({ message, actionText, onAction, snackHeight = 50,count=0}:SnackbarProps,ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0));
  const opacity = useRef(new Animated.Value(0));
  const { Colors } = useTheme()
  const styles = useStyles()

  const onLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }

  const toggleSnackbar = () => {
    onLayoutAnimation()
    setVisible(!visible);
  };

  const hideSnackbar = () => {
    onLayoutAnimation()
    setVisible(false);
  };

  const showSnackbar = () => {
    onLayoutAnimation()
    setVisible(true);
    setTimeout(hideSnackbar, 1500);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY.current, {
        toValue: visible ? -120 : 0,
        useNativeDriver: true,
        duration: visible ? 80 : 150,
      }),
      Animated.timing(opacity.current, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        duration: visible ? 80 : 50,
      }),
    ]).start();
  },[visible]);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {
            showSnackbar();
        },
        close() {
            hideSnackbar();
        },
        toggle() {
            toggleSnackbar();
        }
      };
    },
    [visible]
  );

  return (
        <Animated.View style={[styles.snackbarContainer,{opacity:opacity.current,transform:[{translateY:translateY.current}]}]}>
          <Text style={styles.message}>{message}</Text>
          {count>0?
          <View style={{justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:Colors.whiteWithOpacity(1),fontSize:10,fontFamily:'Primary-Medium',position:'absolute'}}>{count}</Text>
            <CircularLoader height={25} width={25} color={Colors.whiteWithOpacity(1)} />
          </View>
          :onAction ? (
            <TouchableOpacity onPress={onAction}>
              <Text style={styles.action}>{actionText}</Text>
            </TouchableOpacity>
          ):null}
        </Animated.View>
      )
});

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    bottom: -100,
    left: 16,
    right: 16,
    backgroundColor:Colors.snack,
    paddingHorizontal: 16,
    // borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom:12,
    height:40,
    borderRadius:12,
    alignSelf:'center'
  },
  message: {
    color: Colors.text4,
    fontSize: 14,
    fontFamily:'Primary-Medium',
    lineHeight:20
  },
  action: {
    color: Colors.whiteWithOpacity(1),
    fontSize: 16,
    fontFamily:'Primary-Bold'
  },
}), [Colors]); // Recreate styles when Colors change
};
