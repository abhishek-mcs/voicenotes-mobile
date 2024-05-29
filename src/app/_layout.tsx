import { Stack } from 'expo-router/stack';
import AppProvider from 'components/AppProvider';

export default function Layout() {
  return (
          <AppProvider>
            <Stack screenOptions={{headerShown:false,contentStyle:{padding:0,flex:1}}} >
              <Stack.Screen name="home" />
              <Stack.Screen name="auth/login/loginPassword" />
              <Stack.Screen name="auth/signup/index" />
              <Stack.Screen name="RelatedNotes/index" />
              <Stack.Screen name="settings/index" options={{presentation:'modal'}}/>
              <Stack.Screen name="premium/index" options={{presentation:'modal'}}/>
            </Stack>
          </AppProvider>
        );
}