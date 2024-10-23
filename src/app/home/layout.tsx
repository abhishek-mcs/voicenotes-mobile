import { Drawer } from "expo-router/drawer";
import DrawerContent from "components/home/drawer-content";
import { screenWidth } from "utils/common";
import Colors from "assets/Colors";

export default function Layout() {
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
