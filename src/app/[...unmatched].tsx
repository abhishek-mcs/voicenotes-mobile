// app/[...unmatched].tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function CatchAllRoute(): null {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'home' }],
    });
  }, [navigation]);

  return null;
}