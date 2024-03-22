import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

export default () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleOptions = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const optionsStyles = {
    transform: [{ rotate: rotateInterpolation }],
    opacity: animation,
  };

  return (
    <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
      <TouchableOpacity onPress={toggleOptions}>
        <Text>Show more options</Text>
      </TouchableOpacity>
      <Animated.View style={[{ marginTop: 10 }, optionsStyles]}>
        {isOpen && (
          <View style={{ backgroundColor: 'lightgray', padding: 10 }}>
            <TouchableOpacity onPress={() => console.log('Option 1 pressed')}>
              <Text>Option 1</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Option 2 pressed')}>
              <Text>Option 2</Text>
            </TouchableOpacity>
            {/* Add more options as needed */}
          </View>
        )}
      </Animated.View>
    </View>
  );
};
