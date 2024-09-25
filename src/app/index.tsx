import { useEffect, useState} from 'react';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Home from './home';
import { Redirect, router } from 'expo-router';
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';
import useIAPSetup from 'hooks/iap/useIAPSetup';
import * as WebBrowser from 'expo-web-browser';
import useFBEventTracking from 'hooks/fbsdk/useFBEventTracking';
import { LogBox, Platform, UIManager } from 'react-native';
import * as Linking from "expo-linking";

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

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  
  useIAPSetup()

  // useEffect(() => {
    const handleDeepLink = (event: { url: any; }) => {
      console.log("event: ", event.url);

      switch (event.url) {
        case 'voicenotes://ask':
          console.log('Performing action for Ask AI');
          router.replace({
            pathname: '/home/',
            params: {
              action: 'ask'
            }
          })
          // setTimeout(() => {
          //   onAsk();
          // }, 500)
          break;
        case 'voicenotes://record':
          console.log('Performing action for Recording');
          router.replace({
            pathname: '/home/',
            params: {
              action: 'record'
            }
          })
          // setTimeout(() => {
          //   onStartRecord({repeat: false, parent_id: recordingParentId});
          // }, 500)
          break;
        case 'voicenotes://search':
          console.log('Performing action for Search');
          setTimeout(() => {
            router.replace("/search/");
          }, 500)
          break;
        default:
          console.log('No matching shortcut action');
      }
    };

    // useEffect(() => {
    //   Linking.addEventListener('url', handleDeepLink);

      // Linking.getInitialURL().then((url) => {
      //   console.log("URL: ", url)
      //   if (url) {
      //     handleDeepLink({ url });
      //   }
      // }).catch(e => {
      //   console.log("ERROR: ", e)
      // });
    // }, []);

    // Handle if the app was opened via a deep link initially
    
  // }, []);

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
