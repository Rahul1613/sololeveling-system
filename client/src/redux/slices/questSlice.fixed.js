import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questService from '../../api/questService';
import { v4 as uuidv4 } from 'uuid';

// Load initial state from localStorage if available
const loadState = () => {
  try {
    // Try to get from localStorage first
    let savedState = localStorage.getItem('questState');
    
    // If not in localStorage, try sessionStorage
    if (!savedState) {
      savedState = sessionStorage.getItem('questState');
    }
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('Loaded quest state from storage:', parsedState);
      return parsedState;
    }
  } catch (error) {
    console.error('Error loading quest state from localStorage:', error);
  }
  return null;
};

// Default initial state
const defaultState = {
  quests: [],
  activeQuests: [],
  completedQuests: [],
  dailyQuests: [],
  emergencyQuests: [],
  punishmentQuests: [],
  customQuests: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  lastUpdated: null
};

// Use saved state or default
const initialState = loadState() || defaultState;

// Ensure all arrays are initialized
Object.keys(defaultState).forEach(key => {
  if (Array.isArray(defaultState[key]) && !initialState[key]) {
    initialState[key] = [];
  }
});

// Helper function to save state to localStorage
const saveState = (state) => {
  try {
    // Make sure all arrays are initialized before saving
    const ensureArray = (arr) => Array.isArray(arr) ? arr : [];
    
    // Only save necessary data (not loading states, etc.)
    const stateToSave = {
      quests: ensureArray(state.quests),
      activeQuests: ensureArray(state.activeQuests),
      completedQuests: ensureArray(state.completedQuests),
      dailyQuests: ensureArray(state.dailyQuests),
      emergencyQuests: ensureArray(state.emergencyQuests),
      punishmentQuests: ensureArray(state.punishmentQuests),
      customQuests: ensureArray(state.customQuests),
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('questState', JSON.stringify(stateToSave));
    
    // Also save to sessionStorage as a backup
    sessionStorage.setItem('questState', JSON.stringify(stateToSave));
    
    console.log('Quest state saved to localStorage and sessionStorage');
  } catch (error) {
    console.error('Error saving quest state to localStorage:', error);
  }
};

// Get all available quests
export const getQuests = createAsyncThunk(
  'quests/getAll',
  async (filters, thunkAPI) => {
    try {
      return await questService.getQuests(filters);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user's active quests
export const getActiveQuests = createAsyncThunk(
  'quests/getActive',
  async (_, thunkAPI) => {
    try {
      return await questService.getActiveQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user's completed quests
export const getCompletedQuests = createAsyncThunk(
  'quests/getCompleted',
  async (_, thunkAPI) => {
    try {
      return await questService.getCompletedQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Accept a quest
export const acceptQuest = createAsyncThunk(
  'quests/accept',
  async (questId, thunkAPI) => {
    try {
      console.log('Accepting quest with ID:', questId);
      
      // Get current state before making the API call
      const state = thunkAPI.getState().quests;
      
      // Find the quest in all quest arrays
      let questToAccept = null;
      let sourceArray = null;
      
      // Check in each quest array
      const questArrays = [
        { name: 'quests', array: state.quests || [] },
        { name: 'dailyQuests', array: state.dailyQuests || [] },
        { name: 'emergencyQuests', array: state.emergencyQuests || [] },
        { name: 'punishmentQuests', array: state.punishmentQuests || [] },
        { name: 'customQuests', array: state.customQuests || [] }
      ];
      
      for (const { name, array } of questArrays) {
        const quest = array.find(q => q._id === questId);
        if (quest) {
          questToAccept = { ...quest };
          sourceArray = name;
          break;
        }
      }
      
      if (!questToAccept) {
        throw new Error(`Quest with ID ${questId} not found in any quest array`);
      }
      
      // Make the API call
      const response = await questService.acceptQuest(questId);
      console.log('Quest accepted response:', response);
      
      // Return both the API response and the local quest data
      return {
        response,
        questId,
        quest: questToAccept,
        sourceArray
      };
    } catch (error) {
      console.error('Error accepting quest:', error);
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update quest progress
export const updateQuestProgress = createAsyncThunk(
  'quests/updateProgress',
  async ({ questId, progress }, thunkAPI) => {
    try {
      return await questService.updateQuestProgress(questId, progress);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Complete a quest
export const completeQuest = createAsyncThunk(
  'quests/complete',
  async ({ questId, proofFile }, thunkAPI) => {
    try {
      return await questService.completeQuest(questId, proofFile);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Abandon a quest
export const abandonQuest = createAsyncThunk(
  'quests/abandon',
  async (questId, thunkAPI) => {
    try {
      console.log('Abandoning quest with ID:', questId);
      
      // Get current state before making the API call
      const state = thunkAPI.getState().quests;
      
      // Find the quest in active quests
      const activeQuests = state.activeQuests || [];
      const questToAbandon = activeQuests.find(q => q._id === questId);
      
      if (!questToAbandon) {
        throw new Error(`Active quest with ID ${questId} not found`);
      }
      
      // Make the API call
      const response = await questService.abandonQuest(questId);
      console.log('Quest abandoned response:', response);
      
      // Return both the API response and the local quest data
      return {
        response,
        questId,
        quest: questToAbandon
      };
    } catch (error) {
      console.error('Error abandoning quest:', error);
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get daily quests
export const getDailyQuests = createAsyncThunk(
  'quests/getDaily',
  async (_, thunkAPI) => {
    try {
      return await questService.getDailyQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get emergency quests
export const getEmergencyQuests = createAsyncThunk(
  'quests/getEmergency',
  async (_, thunkAPI) => {
    try {
      return await questService.getEmergencyQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get punishment quests
export const getPunishmentQuests = createAsyncThunk(
  'quests/getPunishment',
  async (_, thunkAPI) => {
    try {
      return await questService.getPunishmentQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get custom quests
export const getCustomQuests = createAsyncThunk(
  'quests/getCustom',
  async (_, thunkAPI) => {
    try {
      return await questService.getCustomQuests();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a custom quest
export const createCustomQuest = createAsyncThunk(
  'quests/createCustom',
  async (questData, thunkAPI) => {
    try {
      return await questService.createCustomQuest(questData);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Submit verification for a quest
export const submitVerification = createAsyncThunk(
  'quests/submitVerification',
  async ({ questId, verificationData }, thunkAPI) => {
    try {
      return await questService.submitVerification(questId, verificationData);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    saveQuestState: (state) => {
      saveState(state);
      return state;
    },
    clearQuestErrors: (state) => {
      state.isError = false;
      state.message = '';
    },
    updateQuestLocal: (state, action) => {
      // Update a quest locally without making an API call
      const { questId, updates } = action.payload;
      
      // Ensure all arrays exist
      if (!state.quests) state.quests = [];
      if (!state.activeQuests) state.activeQuests = [];
      if (!state.dailyQuests) state.dailyQuests = [];
      if (!state.emergencyQuests) state.emergencyQuests = [];
      if (!state.punishmentQuests) state.punishmentQuests = [];
      if (!state.customQuests) state.customQuests = [];
      
      // Update in all relevant arrays
      const updateInArray = (array) => {
        const index = array.findIndex(quest => quest._id === questId);
        if (index !== -1) {
          array[index] = { ...array[index], ...updates };
        }
      };
      
      updateInArray(state.quests);
      updateInArray(state.activeQuests);
      updateInArray(state.dailyQuests);
      updateInArray(state.emergencyQuests);
      updateInArray(state.punishmentQuests);
      updateInArray(state.customQuests);
      
      state.lastUpdated = new Date().toISOString();
      
      // Save state to localStorage
      saveState(state);
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all quests cases
      .addCase(getQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quests = action.payload?.quests || [];
      })
      .addCase(getQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get active quests cases
      .addCase(getActiveQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeQuests = action.payload?.quests || [];
      })
      .addCase(getActiveQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get completed quests cases
      .addCase(getCompletedQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompletedQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.completedQuests = action.payload?.quests || [];
      })
      .addCase(getCompletedQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Accept quest cases
      .addCase(acceptQuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure arrays exist
        if (!state.activeQuests) state.activeQuests = [];
        
        // Extract quest ID from payload
        const questId = action.payload.questId || action.meta.arg;
        
        // Find the quest in all quest arrays
        let questToAccept = null;
        
        // Check in each quest array
        const questArrays = [
          { name: 'quests', array: state.quests || [] },
          { name: 'dailyQuests', array: state.dailyQuests || [] },
          { name: 'emergencyQuests', array: state.emergencyQuests || [] },
          { name: 'punishmentQuests', array: state.punishmentQuests || [] },
          { name: 'customQuests', array: state.customQuests || [] }
        ];
        
        for (const { name, array } of questArrays) {
          const quest = array.find(q => q._id === questId);
          if (quest) {
            questToAccept = { ...quest, status: 'active' };
            
            // Update the quest status in its source array
            state[name] = array.map(q => 
              q._id === questId ? { ...q, status: 'active' } : q
            );
            break;
          }
        }
        
        // If quest was found, add to active quests if not already there
        if (questToAccept && !state.activeQuests.some(q => q._id === questId)) {
          state.activeQuests.push(questToAccept);
        }
        
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(acceptQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update quest progress cases
      .addCase(updateQuestProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuestProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure activeQuests array exists
        if (!state.activeQuests) state.activeQuests = [];
        
        // Update the quest progress in activeQuests
        const { questId, progress } = action.meta.arg;
        state.activeQuests = state.activeQuests.map(quest => 
          quest._id === questId ? { ...quest, progress } : quest
        );
        
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(updateQuestProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Complete quest cases
      .addCase(completeQuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure arrays exist
        if (!state.activeQuests) state.activeQuests = [];
        if (!state.completedQuests) state.completedQuests = [];
        
        // Move the quest from active to completed
        const { questId } = action.meta.arg;
        const questIndex = state.activeQuests.findIndex(quest => quest._id === questId);
        
        if (questIndex !== -1) {
          const completedQuest = {
            ...state.activeQuests[questIndex],
            status: 'completed',
            completedAt: new Date().toISOString()
          };
          
          // Remove from active quests
          state.activeQuests.splice(questIndex, 1);
          
          // Add to completed quests
          state.completedQuests.push(completedQuest);
          
          // Update in all arrays
          ['quests', 'dailyQuests', 'emergencyQuests', 'punishmentQuests', 'customQuests'].forEach(arrayName => {
            if (state[arrayName]) {
              state[arrayName] = state[arrayName].map(quest => 
                quest._id === questId ? { ...quest, status: 'completed' } : quest
              );
            }
          });
        }
        
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Abandon quest cases
      .addCase(abandonQuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(abandonQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure arrays exist
        if (!state.activeQuests) state.activeQuests = [];
        
        // Extract quest ID from payload
        const questId = action.payload.questId || action.meta.arg;
        
        // Remove from active quests
        state.activeQuests = state.activeQuests.filter(quest => quest._id !== questId);
        
        // Update status in all arrays
        ['quests', 'dailyQuests', 'emergencyQuests', 'punishmentQuests', 'customQuests'].forEach(arrayName => {
          if (state[arrayName]) {
            state[arrayName] = state[arrayName].map(quest => 
              quest._id === questId ? { ...quest, status: 'available' } : quest
            );
          }
        });
        
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(abandonQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get daily quests cases
      .addCase(getDailyQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyQuests = action.payload || [];
      })
      .addCase(getDailyQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get emergency quests cases
      .addCase(getEmergencyQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEmergencyQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.emergencyQuests = action.payload || [];
      })
      .addCase(getEmergencyQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get punishment quests cases
      .addCase(getPunishmentQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPunishmentQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.punishmentQuests = action.payload || [];
      })
      .addCase(getPunishmentQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get custom quests cases
      .addCase(getCustomQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customQuests = action.payload || [];
      })
      .addCase(getCustomQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create custom quest cases
      .addCase(createCustomQuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure customQuests array exists
        if (!state.customQuests) {
          state.customQuests = [];
        }
        
        state.customQuests.push(action.payload);
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(createCustomQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Submit verification cases
      .addCase(submitVerification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure arrays exist
        if (!state.activeQuests) state.activeQuests = [];
        if (!state.completedQuests) state.completedQuests = [];
        
        // If the verification resulted in quest completion, update the quest status
        if (action.payload.questCompleted) {
          const { questId } = action.payload;
          
          // Move quest from active to completed
          const questIndex = state.activeQuests.findIndex(q => q._id === questId);
          if (questIndex !== -1) {
            const completedQuest = {
              ...state.activeQuests[questIndex],
              status: 'completed',
              completedAt: new Date().toISOString()
            };
            
            state.activeQuests.splice(questIndex, 1);
            state.completedQuests.push(completedQuest);
          }
        }
        
        state.lastUpdated = new Date().toISOString();
        
        // Save state to localStorage
        saveState(state);
      })
      .addCase(submitVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, saveQuestState, clearQuestErrors, updateQuestLocal } = questSlice.actions;
export default questSlice.reducer;
