import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../api/inventoryService';

const initialState = {
  inventory: null,
  items: [],
  currentItem: null,
  recipes: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  lastUpdated: null
};

// Get user inventory
export const getInventory = createAsyncThunk(
  'inventory/get',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.getInventory();
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

// Equip an item
export const equipItem = createAsyncThunk(
  'inventory/equip',
  async (itemId, thunkAPI) => {
    try {
      return await inventoryService.equipItem(itemId);
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

// Unequip an item
export const unequipItem = createAsyncThunk(
  'inventory/unequip',
  async (itemId, thunkAPI) => {
    try {
      return await inventoryService.unequipItem(itemId);
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

// Use a consumable item
export const consumeItem = createAsyncThunk(
  'inventory/use',
  async (itemId, thunkAPI) => {
    try {
      return await inventoryService.consumeItem(itemId);
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

// Discard an item
export const discardItem = createAsyncThunk(
  'inventory/discard',
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      return await inventoryService.discardItem(itemId, quantity);
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

// Get all available items
export const getItems = createAsyncThunk(
  'inventory/getItems',
  async (filters, thunkAPI) => {
    try {
      return await inventoryService.getItems(filters);
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

// Get item details
export const getItemDetails = createAsyncThunk(
  'inventory/getItemDetails',
  async (itemId, thunkAPI) => {
    try {
      return await inventoryService.getItemDetails(itemId);
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

// Craft an item
export const craftItem = createAsyncThunk(
  'inventory/craft',
  async (recipeId, thunkAPI) => {
    try {
      return await inventoryService.craftItem(recipeId);
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

// Enhance an item
export const enhanceItem = createAsyncThunk(
  'inventory/enhance',
  async ({ itemId, materialItemIds }, thunkAPI) => {
    try {
      return await inventoryService.enhanceItem(itemId, materialItemIds);
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

// Get available recipes
export const getRecipes = createAsyncThunk(
  'inventory/getRecipes',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.getRecipes();
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

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearInventoryErrors: (state) => {
      state.isError = false;
      state.message = '';
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    updateItemLocal: (state, action) => {
      // Update an item locally without making an API call
      const { itemId, updates } = action.payload;
      
      // Update in inventory if it exists
      if (state.inventory) {
        const index = state.inventory.findIndex(item => item._id === itemId);
        if (index !== -1) {
          state.inventory[index] = { ...state.inventory[index], ...updates };
        }
      }
      
      // Update in items list if it exists
      const itemsIndex = state.items.findIndex(item => item._id === itemId);
      if (itemsIndex !== -1) {
        state.items[itemsIndex] = { ...state.items[itemsIndex], ...updates };
      }
      
      // Update currentItem if it's the same item
      if (state.currentItem && state.currentItem._id === itemId) {
        state.currentItem = { ...state.currentItem, ...updates };
      }
      
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Get inventory cases
      .addCase(getInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventory = action.payload.inventory;
      })
      .addCase(getInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Equip item cases
      .addCase(equipItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(equipItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventory = action.payload.inventory;
      })
      .addCase(equipItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Unequip item cases
      .addCase(unequipItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unequipItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventory = action.payload.inventory;
      })
      .addCase(unequipItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Use item cases
      .addCase(consumeItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(consumeItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventory = action.payload.inventory;
      })
      .addCase(consumeItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Discard item cases
      .addCase(discardItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(discardItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventory = action.payload.inventory;
      })
      .addCase(discardItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get items cases
      .addCase(getItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get item details cases
      .addCase(getItemDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getItemDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentItem = action.payload;
        
        // Update the item in the items array if it exists
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        
        // Update the item in the inventory if it exists
        if (state.inventory) {
          const inventoryIndex = state.inventory.findIndex(item => item._id === action.payload._id);
          if (inventoryIndex !== -1) {
            state.inventory[inventoryIndex] = action.payload;
          }
        }
      })
      .addCase(getItemDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Craft item cases
      .addCase(craftItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(craftItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Add the crafted item to inventory
        if (!state.inventory) {
          state.inventory = [];
        }
        
        // Check if item already exists in inventory
        const { item, updatedInventory } = action.payload;
        
        if (updatedInventory) {
          state.inventory = updatedInventory;
        } else if (item) {
          const existingIndex = state.inventory.findIndex(i => i._id === item._id);
          if (existingIndex !== -1) {
            // Update existing item
            state.inventory[existingIndex] = item;
          } else {
            // Add new item
            state.inventory.push(item);
          }
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(craftItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Enhance item cases
      .addCase(enhanceItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(enhanceItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update the enhanced item in inventory
        const { enhancedItem, updatedInventory } = action.payload;
        
        if (updatedInventory) {
          state.inventory = updatedInventory;
        } else if (enhancedItem) {
          // Find and update the item in inventory
          const index = state.inventory.findIndex(item => item._id === enhancedItem._id);
          if (index !== -1) {
            state.inventory[index] = enhancedItem;
          }
          
          // Update currentItem if it's the same item
          if (state.currentItem && state.currentItem._id === enhancedItem._id) {
            state.currentItem = enhancedItem;
          }
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(enhanceItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get recipes cases
      .addCase(getRecipes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recipes = action.payload;
      })
      .addCase(getRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = inventorySlice.actions;
export default inventorySlice.reducer;
