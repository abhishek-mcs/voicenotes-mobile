import { configureStore,combineReducers } from '@reduxjs/toolkit'
import hashReducer from 'redux/reducers/hashSlice'
import userDetails from 'redux/reducers/userDetails'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import suggestionState from 'redux/reducers/suggestionState';
import IAPStates from 'redux/reducers/IAPStates';
import recordingStates from 'redux/reducers/recordingStates';
import editStates from 'redux/reducers/editStates';
import relatedNoteStates from 'redux/reducers/relatedNoteStates';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist:['userDetails','IAPStates','recordingStates','hash']
};

const rootReducer = combineReducers({
    hash:hashReducer,
    userDetails:userDetails,
    suggestionState:suggestionState,
    IAPStates:IAPStates,
    recordingStates:recordingStates,
    editStates:editStates,
    relatedNoteStates:relatedNoteStates
})
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    thunk:true,
    serializableCheck: false,
    immutableCheck: false,
  }),
});
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch