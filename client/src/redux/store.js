import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import questReducer from './slices/questSlice';
import inventoryReducer from './slices/inventorySlice';
import shadowReducer from './slices/shadowSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import skillsReducer from './slices/skillsSlice';
import titlesReducer from './slices/titlesSlice';
import notificationReducer from './slices/notificationSlice';

// Redux configuration

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  quests: questReducer,
  inventory: inventoryReducer,
  shadows: shadowReducer,
  marketplace: marketplaceReducer,
  skills: skillsReducer,
  titles: titlesReducer,
  notifications: notificationReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
