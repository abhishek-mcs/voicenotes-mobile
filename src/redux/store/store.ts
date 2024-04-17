import { configureStore,combineReducers } from '@reduxjs/toolkit'
import hashReducer from 'redux/reducers/hashSlice'
import userDetails from 'redux/reducers/userDetails'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import suggestionState from 'redux/reducers/suggestionState';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist:['userDetails']
};

const rootReducer = combineReducers({
    hash:hashReducer,
    userDetails:userDetails,
    suggestionState:suggestionState
})
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch