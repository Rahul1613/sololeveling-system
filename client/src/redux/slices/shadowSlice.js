import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shadowService from '../../api/shadowService';
import databaseService from '../../api/databaseService';
import errorHandler from '../../utils/errorHandler';

const initialState = {
  shadows: [],
  currentShadow: null,
  extractionTargets: [],
  lastExtracted: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  lastUpdated: null
};

// Get user's shadow army
export const getShadows = createAsyncThunk(
  'shadows/getShadows',
  async (_, thunkAPI) => {
    try {
      console.log('Shadow Slice: Getting shadows');
      // Try to get from database service first
      const storedShadows = databaseService.loadFromStorage('shadows', []);
      if (storedShadows && storedShadows.length > 0) {
        console.log('Shadow Slice: Using cached shadows from storage');
        return { shadows: storedShadows };
      }
      
      // If not in storage, get from API
      const response = await shadowService.getShadows();
      return response;
    } catch (error) {
      console.error('Get shadows error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to get shadows');
    }
  }
);

// Get a specific shadow
export const getShadow = createAsyncThunk(
  'shadows/getOne',
  async (shadowId, thunkAPI) => {
    try {
      return await shadowService.getShadow(shadowId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new shadow
export const createShadow = createAsyncThunk(
  'shadows/create',
  async (shadowData, thunkAPI) => {
    try {
      return await shadowService.createShadow(shadowData);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a shadow
export const updateShadow = createAsyncThunk(
  'shadows/updateShadow',
  async ({ shadowId, shadowData }, thunkAPI) => {
    try {
      console.log('Shadow Slice: Updating shadow', shadowData);
      
      // Save to database service first for immediate persistence
      databaseService.saveShadow(shadowData);
      
      // Then send to API
      const response = await shadowService.updateShadow(shadowId, shadowData);
      return response;
    } catch (error) {
      console.error('Update shadow error in slice:', error);
      // Even if API call fails, we've already saved to local storage
      return thunkAPI.rejectWithValue(error.message || 'Failed to update shadow');
    }
  }
);

// Delete a shadow
export const deleteShadow = createAsyncThunk(
  'shadows/delete',
  async (shadowId, thunkAPI) => {
    try {
      return await shadowService.deleteShadow(shadowId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Level up a shadow
export const levelUpShadow = createAsyncThunk(
  'shadows/levelUp',
  async ({ shadowId, experience }, thunkAPI) => {
    try {
      return await shadowService.levelUpShadow(shadowId, experience);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Equip an item to a shadow
export const equipItemToShadow = createAsyncThunk(
  'shadows/equipItem',
  async ({ shadowId, itemId }, thunkAPI) => {
    try {
      return await shadowService.equipItemToShadow(shadowId, itemId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Unequip an item from a shadow
export const unequipItemFromShadow = createAsyncThunk(
  'shadows/unequipItem',
  async ({ shadowId, slot }, thunkAPI) => {
    try {
      return await shadowService.unequipItemFromShadow(shadowId, slot);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Deploy a shadow on a quest
export const deployShadow = createAsyncThunk(
  'shadows/deploy',
  async ({ shadowId, questId }, thunkAPI) => {
    try {
      return await shadowService.deployShadow(shadowId, questId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Return a deployed shadow
export const returnShadow = createAsyncThunk(
  'shadows/return',
  async (shadowId, thunkAPI) => {
    try {
      return await shadowService.returnShadow(shadowId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get available shadow extraction targets
export const getExtractionTargets = createAsyncThunk(
  'shadows/getExtractionTargets',
  async (_, thunkAPI) => {
    try {
      return await shadowService.getExtractionTargets();
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Extract a shadow from a defeated enemy
// Helper function to get current user ID
const getCurrentUserId = () => {
  try {
    // Try to get user from localStorage or sessionStorage
    const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
    return user && user._id ? user._id : 'guest';
  } catch (error) {
    console.error('Error getting current user:', error);
    return 'guest';
  }
};

export const extractShadow = createAsyncThunk(
  'shadows/extractShadow',
  async (extractionData, thunkAPI) => {
    try {
      console.log('Shadow Slice: Extracting shadow', extractionData);
      
      // Validate extraction data
      if (!extractionData) {
        throw new Error('No extraction data provided');
      }
      
      // Get current user ID
      const userId = getCurrentUserId();
      console.log(`Extracting shadow for user: ${userId}`);
      
      // Ensure shadow has user ID
      const shadowWithUserId = {
        ...extractionData,
        userId: userId
      };
      
      // Call shadow service to extract shadow
      const response = await shadowService.extractShadow(shadowWithUserId);
      
      // Get current state to access shadows array
      const state = thunkAPI.getState();
      const currentShadows = state.shadows.shadows || [];
      
      // Create a new shadow object with the response or the original data if no response
      const newShadow = response || shadowWithUserId;
      
      // Create user-specific storage keys
      const shadowKey = `${userId}_shadow_${newShadow._id}`;
      const shadowsKey = `${userId}_shadows`;
      
      // Save the new shadow to localStorage both individually and as part of the array
      databaseService.saveShadow(newShadow);
      
      // Also manually save to user-specific localStorage
      localStorage.setItem(shadowKey, JSON.stringify(newShadow));
      
      // Get existing user shadows and add the new one
      const userShadows = JSON.parse(localStorage.getItem(shadowsKey) || '[]');
      const updatedUserShadows = [...userShadows, newShadow];
      
      // Save to both localStorage and sessionStorage
      localStorage.setItem(shadowsKey, JSON.stringify(updatedUserShadows));
      sessionStorage.setItem(shadowsKey, JSON.stringify(updatedUserShadows));
      
      // Also save the entire updated shadows array to localStorage
      const updatedShadows = [...currentShadows, newShadow];
      databaseService.saveToStorage('shadows', updatedShadows);
      
      // Log the save operation
      console.log(`Shadow saved for user ${userId}:`, newShadow);
      console.log(`Updated shadows array for user ${userId}:`, updatedUserShadows);
      
      return newShadow;
    } catch (error) {
      console.error('Extract shadow error in slice:', error);
      
      // Even if there's an error, try to save the shadow to localStorage
      try {
        if (extractionData) {
          databaseService.saveShadow(extractionData);
          console.log('Shadow saved to localStorage despite error:', extractionData);
        }
      } catch (saveError) {
        console.error('Failed to save shadow to localStorage:', saveError);
      }
      
      return thunkAPI.rejectWithValue(error.message || 'Failed to extract shadow');
    }
  }
);

// Merge shadows to create a stronger one
export const mergeShadows = createAsyncThunk(
  'shadows/merge',
  async ({ primaryShadowId, secondaryShadowId }, thunkAPI) => {
    try {
      return await shadowService.mergeShadows(primaryShadowId, secondaryShadowId);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const shadowSlice = createSlice({
  name: 'shadows',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCurrentShadow: (state, action) => {
      state.currentShadow = action.payload;
    },
    clearShadowErrors: (state) => {
      state.isError = false;
      state.message = '';
    },
    updateShadowLocal: (state, action) => {
      // Update a shadow locally without making an API call
      const { shadowId, updates } = action.payload;
      
      // Find and update the shadow in the shadows array
      const index = state.shadows.findIndex(shadow => shadow._id === shadowId);
      if (index !== -1) {
        state.shadows[index] = { ...state.shadows[index], ...updates };
      }
      
      // Update currentShadow if it's the same shadow
      if (state.currentShadow && state.currentShadow._id === shadowId) {
        state.currentShadow = { ...state.currentShadow, ...updates };
      }
      
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all shadows cases
      .addCase(getShadows.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getShadows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = action.payload.shadows;
      })
      .addCase(getShadows.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get one shadow cases
      .addCase(getShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentShadow = action.payload.shadow;
      })
      .addCase(getShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create shadow cases
      .addCase(createShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows.push(action.payload.shadow);
      })
      .addCase(createShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update shadow cases
      .addCase(updateShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.map(shadow => 
          shadow._id === action.payload.shadow._id ? action.payload.shadow : shadow
        );
        if (state.currentShadow && state.currentShadow._id === action.payload.shadow._id) {
          state.currentShadow = action.payload.shadow;
        }
      })
      .addCase(updateShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete shadow cases
      .addCase(deleteShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.filter(shadow => 
          shadow._id !== action.meta.arg
        );
        if (state.currentShadow && state.currentShadow._id === action.meta.arg) {
          state.currentShadow = null;
        }
      })
      .addCase(deleteShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Level up shadow cases
      .addCase(levelUpShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(levelUpShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.map(shadow => 
          shadow._id === action.payload.shadow._id ? action.payload.shadow : shadow
        );
        if (state.currentShadow && state.currentShadow._id === action.payload.shadow._id) {
          state.currentShadow = action.payload.shadow;
        }
      })
      .addCase(levelUpShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Equip item to shadow cases
      .addCase(equipItemToShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(equipItemToShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.map(shadow => 
          shadow._id === action.payload.shadow._id ? action.payload.shadow : shadow
        );
        if (state.currentShadow && state.currentShadow._id === action.payload.shadow._id) {
          state.currentShadow = action.payload.shadow;
        }
      })
      .addCase(equipItemToShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Unequip item from shadow cases
      .addCase(unequipItemFromShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unequipItemFromShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.map(shadow => 
          shadow._id === action.payload.shadow._id ? action.payload.shadow : shadow
        );
        if (state.currentShadow && state.currentShadow._id === action.payload.shadow._id) {
          state.currentShadow = action.payload.shadow;
        }
      })
      .addCase(unequipItemFromShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Deploy shadow cases
      .addCase(deployShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deployShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows = state.shadows.map(shadow => 
          shadow._id === action.payload.shadow._id ? action.payload.shadow : shadow
        );
        if (state.currentShadow && state.currentShadow._id === action.payload.shadow._id) {
          state.currentShadow = action.payload.shadow;
        }
      })
      .addCase(deployShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Return shadow cases
      .addCase(returnShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(returnShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update the returned shadow in the shadows array
        const index = state.shadows.findIndex(shadow => shadow._id === action.payload._id);
        if (index !== -1) {
          state.shadows[index] = action.payload;
        }
        
        // Update currentShadow if it's the same shadow
        if (state.currentShadow && state.currentShadow._id === action.payload._id) {
          state.currentShadow = action.payload;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(returnShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Extract shadow cases
      .addCase(extractShadow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(extractShadow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shadows.push(action.payload);
        state.lastExtracted = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(extractShadow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get extraction targets cases
      .addCase(getExtractionTargets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExtractionTargets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.extractionTargets = action.payload;
      })
      .addCase(getExtractionTargets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Merge shadows cases
      .addCase(mergeShadows.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(mergeShadows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Remove the secondary shadow that was consumed in the merge
        const { primaryShadowId, secondaryShadowId, mergedShadow } = action.payload;
        
        // Filter out the secondary shadow
        state.shadows = state.shadows.filter(shadow => shadow._id !== secondaryShadowId);
        
        // Update the primary shadow with the merged result
        const primaryIndex = state.shadows.findIndex(shadow => shadow._id === primaryShadowId);
        if (primaryIndex !== -1) {
          state.shadows[primaryIndex] = mergedShadow;
        }
        
        // Update currentShadow if it's one of the merged shadows
        if (state.currentShadow && 
            (state.currentShadow._id === primaryShadowId || 
             state.currentShadow._id === secondaryShadowId)) {
          state.currentShadow = mergedShadow;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(mergeShadows.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, setCurrentShadow } = shadowSlice.actions;
export default shadowSlice.reducer;
