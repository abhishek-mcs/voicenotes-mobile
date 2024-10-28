import { Drawer } from "expo-router/drawer";
import DrawerContent from "components/home/drawer-content";
import { screenWidth } from "utils/common";
import { useTheme } from "context";

export default function Layout() {
  const { Colors } = useTheme()
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      detachInactiveScreens
      screenOptions={{
        overlayColor: Colors.blackWithOpacity(1),
        headerShown: false,
        drawerStyle:{width:screenWidth*.6}
      }}
    />
  );
}
