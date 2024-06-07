import Colors from 'assets/Colors';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, LayoutAnimation, ActivityIndicator } from 'react-native';
import { screenWidth } from 'utils/common';
import CircularLoader from '../loaders/circular-loader';

const { width } = Dimensions.get('window');

interface SnackbarProps {
    message: string;
    actionText?: string;
    onAction?: () => void;
    duration?: number;
    count?:number;
}

export default forwardRef(({ message, actionText, onAction, duration = 3000,count=0}:SnackbarProps,ref) => {
  const [visible, setVisible] = useState(false);
  const height = new Animated.Value(0);

  const toggleSnackbar = () => {
    LayoutAnimation.configureNext({
      duration: visible?300:0,
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
    setVisible(!visible);
  };

  const showSnackbar = () => {
    setVisible(true);
  };
  const hideSnackbar = () => {
    setVisible(false);
  };

  useEffect(() => {
    Animated.timing(height, {
      toValue: visible?50:0,
      useNativeDriver: false,
      duration:200
    }).start();
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

if(!visible)
    return null;
  return (
        <Animated.View style={[styles.snackbarContainer,{height}]}>
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

const styles = StyleSheet.create({
  snackbarContainer: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    marginLeft:-18,
    width:screenWidth,
    backgroundColor:Colors.darkWithOpacity(1),
    paddingHorizontal: 16,
    // borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: Colors.whiteWithOpacity(1),
    fontSize: 16,
    fontFamily:'Primary'
  },
  action: {
    color: Colors.whiteWithOpacity(1),
    fontSize: 16,
    fontFamily:'Primary-Bold'
  },
});
