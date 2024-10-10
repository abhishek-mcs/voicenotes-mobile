import { ContextProvider } from "context";
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "redux/store/store";

// Setup React Query
const queryClient = new QueryClient();

interface AppProviderProps {
  children: ReactNode; // Define the children prop
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => (
  <ContextProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient} contextSharing={true}>
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </ContextProvider>
);

export default AppProvider;
