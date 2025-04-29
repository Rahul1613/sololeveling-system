import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

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

// Individual persist configs for each reducer
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token']
};

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'stats', 'currency', 'level', 'experience']
};

const questPersistConfig = {
  key: 'quests',
  storage,
  whitelist: ['dailyQuests', 'weeklyQuests', 'customQuests', 'completedQuests', 'activeQuests']
};

const inventoryPersistConfig = {
  key: 'inventory',
  storage,
  whitelist: ['inventory', 'items', 'equipped']
};

const shadowPersistConfig = {
  key: 'shadows',
  storage,
  whitelist: ['shadows', 'currentShadow', 'lastExtracted']
};

const skillsPersistConfig = {
  key: 'skills',
  storage,
  whitelist: ['skills', 'skillPoints']
};

const titlesPersistConfig = {
  key: 'titles',
  storage,
  whitelist: ['titles', 'activeTitle']
};

// Apply persist config to each reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedQuestReducer = persistReducer(questPersistConfig, questReducer);
const persistedInventoryReducer = persistReducer(inventoryPersistConfig, inventoryReducer);
const persistedShadowReducer = persistReducer(shadowPersistConfig, shadowReducer);
const persistedSkillsReducer = persistReducer(skillsPersistConfig, skillsReducer);
const persistedTitlesReducer = persistReducer(titlesPersistConfig, titlesReducer);

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  user: persistedUserReducer,
  quests: persistedQuestReducer,
  inventory: persistedInventoryReducer,
  shadows: persistedShadowReducer,
  marketplace: marketplaceReducer,
  skills: persistedSkillsReducer,
  titles: persistedTitlesReducer,
  notifications: notificationReducer,
});

// Custom state synchronization middleware
const stateSyncMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState();
  
  // Synchronize important state to localStorage directly for redundancy
  if (state.auth && state.auth.user) {
    localStorage.setItem('user', JSON.stringify(state.auth.user));
  }
  
  if (state.shadows && state.shadows.shadows) {
    localStorage.setItem('shadows', JSON.stringify(state.shadows.shadows));
  }
  
  if (state.inventory && state.inventory.items) {
    localStorage.setItem('inventory', JSON.stringify(state.inventory.items));
  }
  
  return result;
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
      },
    }).concat(stateSyncMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

export default store;
