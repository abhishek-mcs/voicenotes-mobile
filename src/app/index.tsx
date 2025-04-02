import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import useFBEventTracking from 'hooks/fbsdk/useFBEventTracking';
import { LogBox, Platform, UIManager } from 'react-native';
import useIAPSetup from 'hooks/iap/useIAPSetup';
import { setTempIsIAPPurchased } from 'redux/reducers/IAPStates';
import notifee, { EventType } from '@notifee/react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { setSelectedScreen } from 'redux/reducers/onboardingData';

notifee.registerForegroundService(() => {
  return new Promise(() => {});
});

// use this handler to handle notification clicks in the future
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('User pressed notification in background', detail.notification);
  }
  
  if (type === EventType.DISMISSED) {
    console.log('User dismissed notification in background', detail.notification);
  }
});

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
  const netinfo = useNetInfo()
  
  useIAPSetup()
  useEffect(() => {
    dispatch(setTempIsIAPPurchased(false));
  }, []);

  useEffect(() => {
    if(token) {
      console.log('Token exists');
    } else {
      dispatch(setSelectedScreen(1))
    }
  },[token])

  if (token) {
    return <Redirect href="/home/" />;
  }else{
    return (
      <Redirect href="/onboarding/" />
      // <Redirect href="/auth/landingPage/" />
    );
  }
}
