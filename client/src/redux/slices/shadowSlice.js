import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shadowService from '../../api/shadowService';
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
  'shadows/getAll',
  async (_, thunkAPI) => {
    try {
      return await shadowService.getShadows();
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
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
  'shadows/update',
  async ({ shadowId, shadowData }, thunkAPI) => {
    try {
      return await shadowService.updateShadow(shadowId, shadowData);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
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
export const extractShadow = createAsyncThunk(
  'shadows/extract',
  async (extractionData, thunkAPI) => {
    try {
      return await shadowService.extractShadow(extractionData);
    } catch (error) {
      const message = errorHandler.formatErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
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
