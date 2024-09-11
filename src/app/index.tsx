import { useEffect, useState} from 'react';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Home from './home';
import { Redirect, SplashScreen } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';
import useIAPSetup from 'hooks/iap/useIAPSetup';
import * as WebBrowser from 'expo-web-browser';
import { InteractionManager, LogBox, Platform, StatusBar, UIManager } from 'react-native';

LogBox.ignoreLogs(['Require cycle: src']);
// SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '/home/',
};

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function App() {
  const {token} = useSelector((state: RootState) => state.userDetails);
  // const [isLoading,setIsLoading]=useState(true)
  const [fontsLoaded,error] = useFonts({
    "Primary-Bold": require('../assets/fonts/Inter-Bold.ttf'),
    "Primary-Medium": require('../assets/fonts/Inter-Medium.ttf'),
    "Primary": require('../assets/fonts/Inter-Regular.ttf'),
    "Primary-Semibold": require('../assets/fonts/Inter-SemiBold.ttf'),
    "Primary-Italic": require('../assets/fonts/Inter-Italic.ttf'),
    "Secondary": require('../assets/fonts/InstrumentSerif-Regular.ttf'),
    "Secondary-Italic": require('../assets/fonts/InstrumentSerif-Italic.ttf'),
    ...FontAwesome.font,
  });
  
  useEffect(() => {
    WebBrowser.warmUpAsync();
    // InteractionManager.runAfterInteractions(()=>{
      // setTimeout(async() => {
      //   await SplashScreen.hideAsync()
      //   setIsLoading(false)
      // }, 2000);
    // })
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  
  useIAPSetup()

  if (!fontsLoaded) {
    return null;
  }
  if (token) {
    return <Redirect href="/home/" />;
  }else{
    return (
      <Redirect href="/auth/landingPage/" />
    );
  }
}
