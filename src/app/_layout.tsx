import { Stack } from "expo-router/stack";
import AppProvider from "components/AppProvider";
import "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { isIOS } from "utils/common";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://794cc208d64f43a4069e118c7521c135@o4508691521863680.ingest.us.sentry.io/4508691555942400',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.2,
  enableCaptureFailedRequests:true,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis:10000,
  environment: "production",
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      maskAllVectors: true,
    })
  ],
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function Layout() {
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
  if (!fontsLoaded) {
    return null;
  }
  return (
    <>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
          <PortalProvider>
            <BottomSheetModalProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    padding: 0,
                    flex: 1,
                    backgroundColor: "#000",
                  },
                }}
              >
                <Stack.Screen
                  name="home/index"
                  options={{ animation: "none" }}
                />
                <Stack.Screen
                  name="auth/landingPage/index"
                  options={{ animation: "none" }}
                />
                <Stack.Screen name="auth/login/loginPassword" />
                <Stack.Screen name="auth/signup/index" />
                <Stack.Screen name="auth/signup/premium" />
                <Stack.Screen name="RelatedNotes/index" />
                <Stack.Screen
                  name="settings/index"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="ask-my-ai/index"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="create/index"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="transcript"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="search/index"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="premium/index"
                  options={{ presentation: "fullScreenModal" }}
                />
                <Stack.Screen
                  name="add-tags/index"
                  options={{ presentation: "formSheet" }}
                />
                <Stack.Screen
                  name="edit-note/index"
                  options={{ presentation: "formSheet" }}
                />
                <Stack.Screen
                  name="plan/index"
                  options={{ presentation: "formSheet" }}
                />
                <Stack.Screen
                  name="ask/index"
                  options={{ animation: "none" }}
                />
                <Stack.Screen
                  name="record/index"
                  options={{ animation: "none" }}
                />
                <Stack.Screen
                  name="review/index"
                  options={{ presentation: "formSheet" }}
                />
                <Stack.Screen
                  name="text-note/index"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="translate/index"
                  options={{
                    presentation: "formSheet",
                    animation: isIOS ? "ios" : "slide_from_bottom",
                  }}
                />
              </Stack>
            </BottomSheetModalProvider>
          </PortalProvider>
        </GestureHandlerRootView>
      </AppProvider>
      <Toast />
    </>
  );
}

export default Sentry.wrap(Layout)