import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, LayoutAnimation} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { commonSvg } from 'assets/svg/commonSvg';
import { useTheme } from 'context';

interface SnackbarProps {
    message: string;
    actionText?: string;
    onAction?: () => void;
    snackHeight?: number;
    count?:number;
}

export default forwardRef(({ message, actionText, onAction, snackHeight = 50,count=0}:SnackbarProps,ref) => {
  const [visible, setVisible] = useState(false);
  const height = new Animated.Value(0);
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
    // setTimeout(hideSnackbar, 5000);
  };

  useEffect(() => {
    Animated.timing(height, {
      toValue: visible?snackHeight:0,
      useNativeDriver: false,
      duration:visible?200:500
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

  return (
        <Animated.View style={[styles.snackbarContainer,{height},{marginBottom:visible?12:0}]}>
          <View style={{alignItems:"flex-start",flexDirection:'row',flex:1}}>
            {visible&&<SvgXml xml={commonSvg.info} style={[{marginRight:3,marginTop:3}]} />}
            <Text style={styles.message}>{message}</Text>
          </View>
          {onAction&&visible && (
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={styles.action}>{actionText}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )
});

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  snackbarContainer: {
    backgroundColor:Colors.yellowWithOpacity(0.1),
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom:12
  },
  message: {
    color: Colors.yellow,
    fontSize: 12,
    fontFamily:'Primary-Medium',
    lineHeight:18,
  },
  action: {
    color: Colors.yellow,
    fontSize: 12,
    fontFamily:'Primary-Semibold'
  },
  actionBtn:{
    backgroundColor:Colors.yellowWithOpacity(0.2),
    padding:7,
    paddingHorizontal:13,
    marginLeft:20,
    borderRadius:12
  }
}), [Colors]); // Recreate styles when Colors change
};
