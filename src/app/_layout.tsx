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

export default function Layout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <BottomSheetModalProvider>
          <AppProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { padding: 0, flex: 1 }
              }}
            >
              <Stack.Screen name="home/index" options={{animation:"none"}}/>
              <Stack.Screen name="auth/landingPage/index" options={{animation:"none"}}/>
              <Stack.Screen name="auth/login/loginPassword" />
              <Stack.Screen name="auth/signup/index" />
              <Stack.Screen name="auth/signup/premium" />
              <Stack.Screen name="RelatedNotes/index" />
              <Stack.Screen
                name="settings/index"
                options={{ presentation: "formSheet",animation:isIOS?"ios":"slide_from_bottom"  }}
              />
              <Stack.Screen
                name="ask-my-ai/index"
                options={{ presentation: "formSheet",animation:isIOS?"ios":"slide_from_bottom" }}
              />
              <Stack.Screen
                name="create/index"
                options={{ presentation: "formSheet",animation:isIOS?"ios":"slide_from_bottom" }}
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
                options={{ presentation: "fullScreenModal" }}
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
                options={{ presentation: 'formSheet' }}
              />
            </Stack>
          </AppProvider>
        </BottomSheetModalProvider>
      </PortalProvider>
    </GestureHandlerRootView>
    <Toast/>
    </>
  );
}
