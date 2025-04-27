import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import marketplaceService from '../../api/marketplaceService';

const initialState = {
  items: [],
  featuredItems: [],
  recommendedItems: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get marketplace items
export const getMarketplaceItems = createAsyncThunk(
  'marketplace/getItems',
  async (filters, thunkAPI) => {
    try {
      return await marketplaceService.getMarketplaceItems(filters);
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

// Buy an item from the marketplace
export const buyItem = createAsyncThunk(
  'marketplace/buy',
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      return await marketplaceService.buyItem(itemId, quantity);
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

// Sell an item to the marketplace
export const sellItem = createAsyncThunk(
  'marketplace/sell',
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      return await marketplaceService.sellItem(itemId, quantity);
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

// Get featured marketplace items
export const getFeaturedItems = createAsyncThunk(
  'marketplace/getFeatured',
  async (_, thunkAPI) => {
    try {
      return await marketplaceService.getFeaturedItems();
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

// Get recommended items based on user level and stats
export const getRecommendedItems = createAsyncThunk(
  'marketplace/getRecommended',
  async (_, thunkAPI) => {
    try {
      return await marketplaceService.getRecommendedItems();
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

export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get marketplace items cases
      .addCase(getMarketplaceItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMarketplaceItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload.items;
      })
      .addCase(getMarketplaceItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Buy item cases
      .addCase(buyItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(buyItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // If the item is limited, update its quantity in the marketplace
        if (action.payload.item.isLimited) {
          state.items = state.items.map(item => 
            item._id === action.payload.item._id 
              ? { ...item, limitedQuantity: action.payload.item.limitedQuantity }
              : item
          );
        }
      })
      .addCase(buyItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Sell item cases
      .addCase(sellItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sellItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(sellItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get featured items cases
      .addCase(getFeaturedItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.featuredItems = action.payload.items;
      })
      .addCase(getFeaturedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get recommended items cases
      .addCase(getRecommendedItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecommendedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recommendedItems = action.payload.items;
      })
      .addCase(getRecommendedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
