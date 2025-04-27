import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questService from '../../api/questService';

const initialState = {
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
      const response = await questService.acceptQuest(questId);
      console.log('Quest accepted response:', response);
      return response;
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
      return await questService.abandonQuest(questId);
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
    clearQuestErrors: (state) => {
      state.isError = false;
      state.message = '';
    },
    updateQuestLocal: (state, action) => {
      // Update a quest locally without making an API call
      const { questId, updates } = action.payload;
      
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
        state.quests = action.payload.quests;
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
        state.activeQuests = action.payload.quests;
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
        state.completedQuests = action.payload.quests;
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
        // Remove the quest from available quests
        state.quests = state.quests.filter(
          quest => quest._id !== action.payload.quest.id
        );
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
        // Update the progress of the quest in active quests
        const index = state.activeQuests.findIndex(
          quest => quest.quest._id === action.payload.quest.quest
        );
        if (index !== -1) {
          state.activeQuests[index].progress = action.payload.quest.progress;
        }
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
        // Remove the quest from active quests
        state.activeQuests = state.activeQuests.filter(
          quest => quest.quest._id !== action.meta.arg.questId
        );
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
        // Remove the quest from active quests
        state.activeQuests = state.activeQuests.filter(
          quest => quest.quest._id !== action.meta.arg
        );
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
        state.dailyQuests = action.payload.quests;
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
        state.emergencyQuests = action.payload;
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
        state.punishmentQuests = action.payload;
      })
      .addCase(getPunishmentQuests.rejected, (state, action) => {
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
        state.customQuests.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createCustomQuest.rejected, (state, action) => {
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
        state.customQuests = action.payload;
      })
      .addCase(getCustomQuests.rejected, (state, action) => {
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
      })
      .addCase(submitVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = questSlice.actions;
export default questSlice.reducer;
