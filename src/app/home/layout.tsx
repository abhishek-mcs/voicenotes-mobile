import { Drawer } from "expo-router/drawer";
import DrawerContent from "components/home/drawer-content";
import { screenWidth } from "utils/common";

export default function Layout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      detachInactiveScreens
      screenOptions={{
        overlayColor: "rgba(0,0,0,0)",
        headerShown: false,
        drawerStyle:{width:screenWidth*.6}
      }}
    />
  );
}
