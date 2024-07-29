import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "components/home/drawer-content";
import { useEffect, useState } from "react";
import { PortalProvider } from "@gorhom/portal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function Layout() {
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {}, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <BottomSheetModalProvider>
          <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
              overlayColor: "rgba(0,0,0,0)",
              headerShown: false,
              drawerStyle: { width: "60%" },
            }}
          />
        </BottomSheetModalProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}
