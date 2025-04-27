import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import skillsService from '../../api/skillsService';
import { addNotification } from './notificationSlice';
import { resetUserState } from './userSlice';

// Async thunks
export const fetchUserSkills = createAsyncThunk(
  'skills/fetchUserSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillsService.getUserSkills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skills');
    }
  }
);

export const fetchSkillTree = createAsyncThunk(
  'skills/fetchSkillTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillsService.getSkillTree();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skill tree');
    }
  }
);

export const fetchAvailableSkills = createAsyncThunk(
  'skills/fetchAvailableSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillsService.getAvailableSkills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available skills');
    }
  }
);

export const unlockSkill = createAsyncThunk(
  'skills/unlockSkill',
  async (skillId, { rejectWithValue, dispatch }) => {
    try {
      const response = await skillsService.unlockSkill(skillId);
      dispatch(addNotification({
        type: 'success',
        message: `Skill ${response.data.name} unlocked!`,
        title: 'New Skill Unlocked',
        duration: 5000,
        playSound: true,
        soundType: 'skillUnlock'
      }));
      
      // Update user stats to reflect new skill points
      if (response.data.skillPoints !== undefined) {
        dispatch(resetUserState({ skillPoints: response.data.skillPoints }));
      }
      
      // Refresh skill tree after unlocking
      dispatch(fetchSkillTree());
      
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to unlock skill',
        title: 'Error',
        duration: 5000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to unlock skill');
    }
  }
);

export const equipSkill = createAsyncThunk(
  'skills/equipSkill',
  async ({ skillId, slotIndex }, { rejectWithValue, dispatch }) => {
    try {
      const response = await skillsService.equipSkill(skillId, slotIndex);
      dispatch(addNotification({
        type: 'success',
        message: `Skill ${response.data.name} equipped!`,
        title: 'Skill Equipped',
        duration: 3000
      }));
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to equip skill',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to equip skill');
    }
  }
);

export const unequipSkill = createAsyncThunk(
  'skills/unequipSkill',
  async (skillId, { rejectWithValue, dispatch }) => {
    try {
      const response = await skillsService.unequipSkill(skillId);
      dispatch(addNotification({
        type: 'info',
        message: `Skill ${response.data.name} unequipped`,
        title: 'Skill Unequipped',
        duration: 3000
      }));
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to unequip skill',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to unequip skill');
    }
  }
);

export const useSkill = createAsyncThunk(
  'skills/useSkill',
  async ({ skillId, targetId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await skillsService.useSkill(skillId, targetId);
      dispatch(addNotification({
        type: 'info',
        message: response.data.message || `Skill used successfully!`,
        title: 'Skill Activated',
        duration: 3000,
        playSound: true,
        soundType: 'skillActivate'
      }));
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to use skill',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to use skill');
    }
  }
);

export const levelUpSkill = createAsyncThunk(
  'skills/levelUpSkill',
  async (skillId, { rejectWithValue, dispatch }) => {
    try {
      const response = await skillsService.levelUpSkill(skillId);
      dispatch(addNotification({
        type: 'success',
        message: `Skill ${response.data.name} leveled up to level ${response.data.level}!`,
        title: 'Skill Level Up',
        duration: 5000,
        playSound: true,
        soundType: 'skillLevelUp'
      }));
      
      // Update user stats to reflect new skill points
      if (response.data.skillPoints !== undefined) {
        dispatch(resetUserState({ skillPoints: response.data.skillPoints }));
      }
      
      // Refresh skill tree after leveling up
      dispatch(fetchSkillTree());
      
      return response.data;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to level up skill',
        title: 'Error',
        duration: 3000
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to level up skill');
    }
  }
);

// Initial state
const initialState = {
  userSkills: [],
  availableSkills: [],
  equippedSkills: [],
  skillTree: {},
  loading: false,
  error: null,
  skillPoints: 0,
  maxEquippedSkills: 5,
  selectedSkill: null
};

// Slice
const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSelectedSkill: (state, action) => {
      state.selectedSkill = action.payload;
    },
    clearSelectedSkill: (state) => {
      state.selectedSkill = null;
    },
    updateSkillCooldown: (state, action) => {
      const { skillId, cooldownEnds } = action.payload;
      const skill = state.userSkills.find(s => s._id === skillId);
      if (skill) {
        skill.cooldownEnds = cooldownEnds;
      }
      
      const equippedSkill = state.equippedSkills.find(s => s._id === skillId);
      if (equippedSkill) {
        equippedSkill.cooldownEnds = cooldownEnds;
      }
    },
    resetSkillState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch user skills
      .addCase(fetchUserSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.userSkills = action.payload.userSkills;
        state.equippedSkills = action.payload.equippedSkills;
        state.skillPoints = action.payload.skillPoints;
        state.maxEquippedSkills = action.payload.maxEquippedSkills;
      })
      .addCase(fetchUserSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch available skills
      .addCase(fetchAvailableSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSkills = action.payload;
      })
      .addCase(fetchAvailableSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Unlock skill
      .addCase(unlockSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.userSkills.push(action.payload.skill);
        state.skillPoints = action.payload.remainingSkillPoints;
        
        // Remove from available skills
        state.availableSkills = state.availableSkills.filter(
          skill => skill._id !== action.payload.skill._id
        );
      })
      .addCase(unlockSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Equip skill
      .addCase(equipSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(equipSkill.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the user skill
        const skillIndex = state.userSkills.findIndex(
          skill => skill._id === action.payload.skill._id
        );
        
        if (skillIndex !== -1) {
          state.userSkills[skillIndex] = {
            ...state.userSkills[skillIndex],
            isEquipped: true,
            slotIndex: action.payload.slotIndex
          };
        }
        
        // Update equipped skills
        const existingIndex = state.equippedSkills.findIndex(
          skill => skill.slotIndex === action.payload.slotIndex
        );
        
        if (existingIndex !== -1) {
          // Replace existing skill in this slot
          state.equippedSkills[existingIndex] = {
            ...action.payload.skill,
            isEquipped: true,
            slotIndex: action.payload.slotIndex
          };
        } else {
          // Add to equipped skills
          state.equippedSkills.push({
            ...action.payload.skill,
            isEquipped: true,
            slotIndex: action.payload.slotIndex
          });
        }
      })
      .addCase(equipSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Unequip skill
      .addCase(unequipSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unequipSkill.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the user skill
        const skillIndex = state.userSkills.findIndex(
          skill => skill._id === action.payload.skill._id
        );
        
        if (skillIndex !== -1) {
          state.userSkills[skillIndex] = {
            ...state.userSkills[skillIndex],
            isEquipped: false,
            slotIndex: -1
          };
        }
        
        // Remove from equipped skills
        state.equippedSkills = state.equippedSkills.filter(
          skill => skill._id !== action.payload.skill._id
        );
      })
      .addCase(unequipSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Use skill
      .addCase(useSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(useSkill.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update cooldown for the skill
        const skillId = action.payload.skillId;
        const cooldownEnds = action.payload.cooldownEnds;
        
        // Update in user skills
        const skillIndex = state.userSkills.findIndex(s => s._id === skillId);
        if (skillIndex !== -1) {
          state.userSkills[skillIndex].cooldownEnds = cooldownEnds;
        }
        
        // Update in equipped skills
        const equippedIndex = state.equippedSkills.findIndex(s => s._id === skillId);
        if (equippedIndex !== -1) {
          state.equippedSkills[equippedIndex].cooldownEnds = cooldownEnds;
        }
        
        // Update user stats if provided
        if (action.payload.userStats) {
          // This will be handled by the user slice
        }
      })
      .addCase(useSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Level up skill
      .addCase(levelUpSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(levelUpSkill.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the skill in userSkills
        const skillIndex = state.userSkills.findIndex(
          skill => skill._id === action.payload.skill._id
        );
        
        if (skillIndex !== -1) {
          state.userSkills[skillIndex] = action.payload.skill;
        }
        
        // Update in equipped skills if equipped
        const equippedIndex = state.equippedSkills.findIndex(
          skill => skill._id === action.payload.skill._id
        );
        
        if (equippedIndex !== -1) {
          state.equippedSkills[equippedIndex] = action.payload.skill;
        }
        
        // Update skill points
        state.skillPoints = action.payload.remainingSkillPoints;
        
        // Update selected skill if it's the one being leveled up
        if (state.selectedSkill && state.selectedSkill._id === action.payload.skill._id) {
          state.selectedSkill = action.payload.skill;
        }
      })
      .addCase(levelUpSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to level up skill';
      })
      
      // Fetch skill tree
      .addCase(fetchSkillTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillTree.fulfilled, (state, action) => {
        state.loading = false;
        state.skillTree = action.payload.skillTree;
        state.skillPoints = action.payload.skillPoints;
      })
      .addCase(fetchSkillTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch skill tree';
      });
  }
});

// Export actions and reducer
export const { 
  setSelectedSkill, 
  clearSelectedSkill, 
  updateSkillCooldown,
  resetSkillState
} = skillsSlice.actions;

export default skillsSlice.reducer;
