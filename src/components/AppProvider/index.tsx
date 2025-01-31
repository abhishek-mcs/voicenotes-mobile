import { ContextProvider } from "context";
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "redux/store/store";
import { KeyboardProvider } from "react-native-keyboard-controller";
import database from '@react-native-firebase/database';

database().setPersistenceEnabled(true);

// Setup React Query
const queryClient = new QueryClient();

interface AppProviderProps {
  children: ReactNode; // Define the children prop
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <KeyboardProvider statusBarTranslucent={true}>
        <ContextProvider>
          <QueryClientProvider client={queryClient} contextSharing={true}>
            {children}
          </QueryClientProvider>
        </ContextProvider>
      </KeyboardProvider>
    </PersistGate>
  </Provider>
);

export default AppProvider;
