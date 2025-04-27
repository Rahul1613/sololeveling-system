import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import titlesService from '../../api/titlesService';
import { addNotification } from './notificationSlice';

// Async thunks
export const fetchUserTitles = createAsyncThunk(
  'titles/fetchUserTitles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await titlesService.getUserTitles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch titles');
    }
  }
);

export const fetchAvailableTitles = createAsyncThunk(
  'titles/fetchAvailableTitles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await titlesService.getAvailableTitles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available titles');
    }
  }
);

export const equipTitle = createAsyncThunk(
  'titles/equipTitle',
  async (titleId, { rejectWithValue, dispatch }) => {
    try {
      const response = await titlesService.equipTitle(titleId);
      dispatch(addNotification({
        type: 'success',
        message: `Title "${response.data.title.name}" equipped!`,
        title: 'Title Equipped',
        duration: 3000,
        playSound: true,
        soundType: 'titleEquip'
      }));
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to equip title',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to equip title');
    }
  }
);

export const unequipTitle = createAsyncThunk(
  'titles/unequipTitle',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await titlesService.unequipTitle();
      dispatch(addNotification({
        type: 'info',
        message: 'Title unequipped',
        title: 'Title Unequipped',
        duration: 3000
      }));
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to unequip title',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to unequip title');
    }
  }
);

// Initial state
const initialState = {
  userTitles: [],
  availableTitles: [],
  equippedTitle: null,
  loading: false,
  error: null,
  selectedTitle: null
};

// Slice
const titlesSlice = createSlice({
  name: 'titles',
  initialState,
  reducers: {
    setSelectedTitle: (state, action) => {
      state.selectedTitle = action.payload;
    },
    clearSelectedTitle: (state) => {
      state.selectedTitle = null;
    },
    resetTitleState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch user titles
      .addCase(fetchUserTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.userTitles = action.payload.userTitles;
        state.equippedTitle = action.payload.equippedTitle;
      })
      .addCase(fetchUserTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch available titles
      .addCase(fetchAvailableTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableTitles = action.payload;
      })
      .addCase(fetchAvailableTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Equip title
      .addCase(equipTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(equipTitle.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update equipped title
        state.equippedTitle = action.payload.title;
        
        // Update the title in userTitles
        const titleIndex = state.userTitles.findIndex(
          title => title._id === action.payload.title._id
        );
        
        if (titleIndex !== -1) {
          // Mark this title as equipped
          state.userTitles[titleIndex] = {
            ...state.userTitles[titleIndex],
            isEquipped: true
          };
          
          // Mark all other titles as not equipped
          state.userTitles = state.userTitles.map((title, index) => {
            if (index !== titleIndex) {
              return { ...title, isEquipped: false };
            }
            return title;
          });
        }
      })
      .addCase(equipTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Unequip title
      .addCase(unequipTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unequipTitle.fulfilled, (state) => {
        state.loading = false;
        
        // Clear equipped title
        state.equippedTitle = null;
        
        // Mark all titles as not equipped
        state.userTitles = state.userTitles.map(title => ({
          ...title,
          isEquipped: false
        }));
      })
      .addCase(unequipTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions and reducer
export const { 
  setSelectedTitle, 
  clearSelectedTitle,
  resetTitleState
} = titlesSlice.actions;

export default titlesSlice.reducer;
