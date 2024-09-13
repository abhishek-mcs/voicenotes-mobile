import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "components/home/drawer-content";
import { useEffect, useState } from "react";
import { PortalProvider } from "@gorhom/portal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Linking from 'expo-linking';

export default function Layout() {
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const handleDeepLink = (event: { url: any; }) => {
      console.log("event: ", event.url);

      if (event.url === "voicenotes://ask") {
        console.log("type: ask");
      }
      if (event.url === "voicenotes://record") {
        console.log("type: record");
      }
    };

    // Add event listener for deep linking
    Linking.addEventListener('url', handleDeepLink);

    // Handle if the app was opened via a deep link initially
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
  }, []);

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
              overlayColor: "rgba(0,0,0,0)",
              headerShown: false,
              drawerStyle: { width: "60%" },
            }}
          />
    // </GestureHandlerRootView>
  );
}
