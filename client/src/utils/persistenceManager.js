/**
 * Persistence Manager
 * 
 * Handles data persistence and recovery for the Solo Leveling system.
 * Ensures user data is properly saved and can be recovered even if Redux persistence fails.
 */

// List of critical state items to manage
const CRITICAL_ITEMS = [
  { key: 'user', defaultValue: null },
  { key: 'shadows', defaultValue: [] },
  { key: 'inventory', defaultValue: [] },
  { key: 'quests', defaultValue: { daily: [], weekly: [], custom: [], active: [] } },
  { key: 'skills', defaultValue: [] },
  { key: 'titles', defaultValue: [] },
  { key: 'stats', defaultValue: { strength: 10, agility: 10, intelligence: 10, endurance: 10 } },
  { key: 'level', defaultValue: 1 },
  { key: 'experience', defaultValue: 0 },
  { key: 'currency', defaultValue: 0 }
];

/**
 * Save an item to localStorage
 * @param {string} key - The key to save under
 * @param {any} value - The value to save
 */
export const saveItem = (key, value) => {
  try {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`PersistenceManager: Saved ${key} to localStorage`);
    }
  } catch (error) {
    console.error(`PersistenceManager: Error saving ${key} to localStorage`, error);
  }
};

/**
 * Load an item from localStorage
 * @param {string} key - The key to load
 * @param {any} defaultValue - Default value if not found
 * @returns {any} The loaded value or default
 */
export const loadItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return defaultValue;
  } catch (error) {
    console.error(`PersistenceManager: Error loading ${key} from localStorage`, error);
    return defaultValue;
  }
};

/**
 * Save the entire state to localStorage
 * @param {Object} state - The Redux state
 */
export const saveState = (state) => {
  if (!state) return;

  try {
    // Save auth user
    if (state.auth && state.auth.user) {
      saveItem('user', state.auth.user);
    }

    // Save shadows
    if (state.shadows) {
      if (state.shadows.shadows) saveItem('shadows', state.shadows.shadows);
      if (state.shadows.lastExtracted) saveItem('lastExtractedShadow', state.shadows.lastExtracted);
    }

    // Save inventory
    if (state.inventory) {
      if (state.inventory.items) saveItem('inventory', state.inventory.items);
      if (state.inventory.equipped) saveItem('equippedItems', state.inventory.equipped);
    }

    // Save quests
    if (state.quests) {
      const questData = {
        daily: state.quests.dailyQuests || [],
        weekly: state.quests.weeklyQuests || [],
        custom: state.quests.customQuests || [],
        active: state.quests.activeQuests || [],
        completed: state.quests.completedQuests || []
      };
      saveItem('quests', questData);
    }

    // Save skills
    if (state.skills && state.skills.skills) {
      saveItem('skills', state.skills.skills);
    }

    // Save titles
    if (state.titles && state.titles.titles) {
      saveItem('titles', state.titles.titles);
    }

    // Save user stats
    if (state.user) {
      if (state.user.stats) saveItem('stats', state.user.stats);
      if (state.user.level) saveItem('level', state.user.level);
      if (state.user.experience) saveItem('experience', state.user.experience);
      if (state.user.currency) saveItem('currency', state.user.currency);
    }

    console.log('PersistenceManager: Full state saved to localStorage');
  } catch (error) {
    console.error('PersistenceManager: Error saving state to localStorage', error);
  }
};

/**
 * Load the entire state from localStorage
 * @returns {Object} The loaded state
 */
export const loadState = () => {
  const recoveredState = {};

  try {
    // Recover each critical item
    CRITICAL_ITEMS.forEach(item => {
      const value = loadItem(item.key, item.defaultValue);
      if (value !== null) {
        recoveredState[item.key] = value;
      }
    });

    console.log('PersistenceManager: State loaded from localStorage', recoveredState);
    return recoveredState;
  } catch (error) {
    console.error('PersistenceManager: Error loading state from localStorage', error);
    return {};
  }
};

/**
 * Initialize the persistence system
 * @param {Object} store - The Redux store
 */
export const initPersistence = (store) => {
  // Subscribe to store changes to save state
  store.subscribe(() => {
    saveState(store.getState());
  });

  // Initial load of state
  const initialState = loadState();
  console.log('PersistenceManager: Initial state loaded', initialState);

  // Return the loaded state for potential use
  return initialState;
};

export default {
  saveItem,
  loadItem,
  saveState,
  loadState,
  initPersistence
};
