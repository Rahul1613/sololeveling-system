import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/userService';

// Async thunks for user-related actions
export const getRankings = createAsyncThunk(
  'user/getRankings',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getRankings();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch rankings');
    }
  }
);

export const getUserStats = createAsyncThunk(
  'user/getUserStats',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getUserStats(userId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user stats');
    }
  }
);

export const updateExperience = createAsyncThunk(
  'user/updateExperience',
  async ({ userId, experiencePoints }, { rejectWithValue }) => {
    try {
      return await userService.updateExperience(userId, experiencePoints);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update experience');
    }
  }
);

export const allocateStatPoints = createAsyncThunk(
  'user/allocateStatPoints',
  async ({ userId, statType, points }, { rejectWithValue }) => {
    try {
      return await userService.allocateStatPoints(userId, statType, points);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to allocate stat points');
    }
  }
);

// Initial state for the user slice
const initialState = {
  rankings: [],
  userStats: null,
  skills: [],
  titles: [],
  dungeonKeys: [],
  loading: false,
  error: null,
  success: false,
  message: ''
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    unlockSkill: (state, action) => {
      const { skillId } = action.payload;
      const skillIndex = state.skills.findIndex(skill => skill.id === skillId);
      if (skillIndex !== -1) {
        state.skills[skillIndex].unlocked = true;
      }
    },
    levelUpSkill: (state, action) => {
      const { skillId } = action.payload;
      const skillIndex = state.skills.findIndex(skill => skill.id === skillId);
      if (skillIndex !== -1 && state.skills[skillIndex].level < state.skills[skillIndex].maxLevel) {
        state.skills[skillIndex].level += 1;
      }
    },
    acquireTitle: (state, action) => {
      const { titleId } = action.payload;
      const titleIndex = state.titles.findIndex(title => title.id === titleId);
      if (titleIndex !== -1) {
        state.titles[titleIndex].acquired = true;
      }
    },
    useDungeonKey: (state, action) => {
      const { keyId } = action.payload;
      const keyIndex = state.dungeonKeys.findIndex(key => key.id === keyId);
      if (keyIndex !== -1 && state.dungeonKeys[keyIndex].count > 0) {
        state.dungeonKeys[keyIndex].count -= 1;
      }
    },
    addDungeonKey: (state, action) => {
      const { keyId, count } = action.payload;
      const keyIndex = state.dungeonKeys.findIndex(key => key.id === keyId);
      if (keyIndex !== -1) {
        state.dungeonKeys[keyIndex].count += count;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get rankings
      .addCase(getRankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRankings.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload;
      })
      .addCase(getRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user stats
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update experience
      .addCase(updateExperience.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExperience.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        
        // Update user stats if available
        if (state.userStats) {
          state.userStats.experience = action.payload.experience;
          state.userStats.experienceToNextLevel = action.payload.experienceToNextLevel;
          state.userStats.level = action.payload.newLevel;
          state.userStats.statPoints = action.payload.statPoints;
        }
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Allocate stat points
      .addCase(allocateStatPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(allocateStatPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        
        // Update user stats if available
        if (state.userStats) {
          state.userStats.stats = action.payload.stats;
          state.userStats.statPoints = action.payload.statPoints;
        }
      })
      .addCase(allocateStatPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  resetUserState, 
  unlockSkill, 
  levelUpSkill, 
  acquireTitle, 
  useDungeonKey, 
  addDungeonKey 
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
