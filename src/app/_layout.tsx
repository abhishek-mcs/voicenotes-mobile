import { Stack } from "expo-router/stack";
import AppProvider from "components/AppProvider";
import "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
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
              <Stack.Screen name="home" options={{animation:"none"}}/>
              <Stack.Screen name="auth/landingPage/index" options={{animation:"none"}}/>
              <Stack.Screen name="auth/login/loginPassword" />
              <Stack.Screen name="auth/signup/index" />
              <Stack.Screen name="auth/signup/premium" />
              <Stack.Screen name="RelatedNotes/index" />
              <Stack.Screen
                name="settings/index"
                options={{ presentation: "formSheet" }}
              />
              <Stack.Screen
                name="search/index"
                options={{ animation: "fade" }}
              />
              <Stack.Screen
                name="premium/index"
                options={{ presentation: "formSheet" }}
              />
              <Stack.Screen
                name="add-tags/index"
                options={{ presentation: "formSheet" }}
              />
              <Stack.Screen
                name="edit-note/index"
                options={{ presentation: "fullScreenModal" }}
              />
            </Stack>
          </AppProvider>
        </BottomSheetModalProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}
