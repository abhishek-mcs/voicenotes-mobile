import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import DrawerContent from 'components/home/drawer-content';
import { useEffect, useState } from 'react';

export default function Layout() {
  const [filter, setFilter] = useState<string|null>(null);

  useEffect(() => {
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <DrawerContent {...props} setFilter={setFilter} />} screenOptions={{headerShown:false,drawerStyle:{width:'60%'}}}/>
    </GestureHandlerRootView>
  );
}
