import { useEffect, useState} from 'react';
import { Redirect, router } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import useFBEventTracking from 'hooks/fbsdk/useFBEventTracking';
import { LogBox, Platform, UIManager } from 'react-native';

LogBox.ignoreLogs(['Require cycle: src']);
LogBox.ignoreLogs(['Warning: Overriding previous layout animation with new']);
LogBox.ignoreLogs(['Warning: Overriding previous layout animation with new one before the first began:'])
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
  
  useFBEventTracking()

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

  if (token) {
    return <Redirect href="/home/" />;
  }else{
    return (
      <Redirect href="/auth/landingPage/" />
    );
  }
}
