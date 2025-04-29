import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  sampleMarketplaceItems, 
  getFeaturedItems as fetchFeaturedItems, 
  getRecommendedItems as fetchRecommendedItems 
} from '../../utils/marketplaceData';

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
      // Check if we're in development/mock mode
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                          process.env.REACT_APP_USE_MOCK_API === 'true' || 
                          window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // For testing, use our sample data instead of API call
        console.log('Using mock data for marketplace items');
        return sampleMarketplaceItems;
      }
      
      // In production, make an actual API call
      const response = await axios.get('/api/marketplace/items', { params: filters });
      console.log('API response for marketplace items:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      
      // If API call fails in production, fall back to sample data as a last resort
      if (process.env.NODE_ENV === 'production') {
        console.warn('Falling back to sample marketplace data due to API error');
        return sampleMarketplaceItems;
      }
      
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
      // For testing, simulate a successful purchase
      const item = sampleMarketplaceItems.find(item => item._id === itemId);
      if (!item) {
        return thunkAPI.rejectWithValue('Item not found');
      }
      
      // Return a mock response
      return {
        success: true,
        item: item,
        quantity: quantity,
        message: `Successfully purchased ${quantity} ${item.name}`
      };
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
  async ({ itemId, quantity, itemData }, thunkAPI) => {
    try {
      // For testing, simulate a successful sale
      // If itemData is provided (for new listings), use that
      // Otherwise find the item in the sample data
      const item = itemData || sampleMarketplaceItems.find(item => item._id === itemId);
      if (!item && !itemData) {
        return thunkAPI.rejectWithValue('Item not found');
      }
      
      // Return a mock response
      return {
        success: true,
        item: itemData || item,
        quantity: quantity,
        message: itemData ? 'Item listed successfully' : `Successfully sold ${quantity} ${item.name}`
      };
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
      // For testing, use our sample data instead of API call
      // Use the imported function from marketplaceData.js
      const featuredItems = fetchFeaturedItems();
      console.log('Featured items:', featuredItems);
      return featuredItems;
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
      // For testing, use our sample data instead of API call
      // Use the imported function from marketplaceData.js
      const recommendedItems = fetchRecommendedItems(5); // Assume user level 5 for testing
      console.log('Recommended items:', recommendedItems);
      return recommendedItems;
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
        state.items = action.payload; // Direct assignment, not action.payload.items
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
        state.featuredItems = action.payload; // Direct assignment, not action.payload.items
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
        state.recommendedItems = action.payload; // Direct assignment, not action.payload.items
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
