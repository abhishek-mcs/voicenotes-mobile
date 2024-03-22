import { Stack } from 'expo-router/stack';
import AppProvider from 'components/AppProvider';

export default function Layout() {
  return (
          <AppProvider>
            <Stack screenOptions={{headerShown:false,contentStyle:{padding:0,flex:1}}} />
          </AppProvider>
        );
}