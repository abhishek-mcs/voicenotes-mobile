import { useEffect} from 'react';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store/store';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '/home/',
};

// SplashScreen.preventAutoHideAsync();


export default function App() {
  
  const token= useSelector((state: RootState) => state.userDetails.token)

  const [fontsLoaded,error] = useFonts({
    "Primary-Bold": require('../assets/fonts/Inter-Bold.ttf'),
    "Primary-Medium": require('../assets/fonts/Inter-Medium.ttf'),
    "Primary": require('../assets/fonts/Inter-Regular.ttf'),
    "Primary-Semibold": require('../assets/fonts/Inter-SemiBold.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // useEffect(() => {
  //   const loadFontsAndHideSplashScreen = async () => {
  //     if (fontsLoaded) {
  //       await SplashScreen.hideAsync();
  //     }
  //   };

  //   loadFontsAndHideSplashScreen();
  // }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  if (token) {
    return <Redirect href="/home/" />;
  }else{
    return (
      <Redirect href="/home/" />
    );
  }
}
