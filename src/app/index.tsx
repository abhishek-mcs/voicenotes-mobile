import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import useFBEventTracking from 'hooks/fbsdk/useFBEventTracking';
import { LogBox, Platform, UIManager } from 'react-native';
import useIAPSetup from 'hooks/iap/useIAPSetup';
import { setTempIsIAPPurchased } from 'redux/reducers/IAPStates';
import { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from 'services/api/axios-api';

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
  
  useFBEventTracking()
  useIAPSetup()
  useEffect(() => {
    WebBrowser?.warmUpAsync();
    // InteractionManager.runAfterInteractions(()=>{
      // setTimeout(async() => {
      //   await SplashScreen.hideAsync()
      //   setIsLoading(false)
      // }, 2000);
    // })
    dispatch(setTempIsIAPPurchased(false))
    return () => {
      WebBrowser?.coolDownAsync();
    };
  }, []);

  useEffect(()=>{
    (async function(){
      const t = await AsyncStorage.getItem('authToken')??''
      if(!!t){
        setAuthToken(t,false,netinfo);
      }
    })()
  },[])

  if (token) {
    return <Redirect href="/home/" />;
  }else{
    return (
      <Redirect href="/auth/landingPage/" />
    );
  }
}
