import { useEffect, useState} from 'react';
import { Redirect, router } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import useFBEventTracking from 'hooks/fbsdk/useFBEventTracking';
import { LogBox, Platform, StatusBar, UIManager } from 'react-native';
import useIAPSetup from 'hooks/iap/useIAPSetup';
import { setTempIsIAPPurchased } from 'redux/reducers/IAPStates';

LogBox.ignoreLogs(['Sending `onInstallConversionDataLoaded` with no listeners registered.']);
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
  const dispatch = useDispatch()
  
  useFBEventTracking()
  useIAPSetup()
  useEffect(() => {
    WebBrowser.warmUpAsync();
    // InteractionManager.runAfterInteractions(()=>{
      // setTimeout(async() => {
      //   await SplashScreen.hideAsync()
      //   setIsLoading(false)
      // }, 2000);
    // })
    StatusBar.setBarStyle("dark-content")
    dispatch(setTempIsIAPPurchased(false))
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
