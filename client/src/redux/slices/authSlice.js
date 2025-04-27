import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/authService';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      console.log('Auth Slice: Registering user', userData.email);
      const response = await authService.register(userData);
      
      // Ensure user object has the correct structure
      if (response.user) {
        // Make sure hp and mp are objects with current and max properties
        if (response.user.hp && typeof response.user.hp !== 'object') {
          response.user.hp = { current: response.user.hp, max: response.user.hp };
        }
        
        if (response.user.mp && typeof response.user.mp !== 'object') {
          response.user.mp = { current: response.user.mp, max: response.user.mp };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Registration error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      console.log('Auth Slice: Logging in user', userData.email);
      const response = await authService.login(userData);
      
      // Ensure user object has the correct structure
      if (response.user) {
        // Make sure hp and mp are objects with current and max properties
        if (response.user.hp && typeof response.user.hp !== 'object') {
          response.user.hp = { current: response.user.hp, max: response.user.hp };
        }
        
        if (response.user.mp && typeof response.user.mp !== 'object') {
          response.user.mp = { current: response.user.mp, max: response.user.mp };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Demo login
export const demoLogin = createAsyncThunk(
  'auth/demoLogin',
  async (_, thunkAPI) => {
    try {
      console.log('Auth Slice: Using demo login');
      return await authService.demoLogin();
    } catch (error) {
      console.error('Demo login error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Demo login failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      console.log('Auth Slice: Logging out user');
      authService.logout();
      return { success: true };
    } catch (error) {
      console.error('Logout error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, thunkAPI) => {
    try {
      console.log('Auth Slice: Getting current user');
      return await authService.getCurrentUser();
    } catch (error) {
      console.error('Get current user error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to get current user');
    }
  }
);

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, thunkAPI) => {
    try {
      console.log('Auth Slice: Requesting password reset for', email);
      const response = await authService.requestPasswordReset(email);
      
      // Display OTP in an alert for easy testing in the mock implementation
      if (response.message && response.message.includes('OTP is:')) {
        const otpMatch = response.message.match(/OTP is: (\d+)/);
        if (otpMatch && otpMatch[1]) {
          alert(`Your OTP for password reset is: ${otpMatch[1]}\nPlease use this code to verify your email.`);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Password reset request error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to send password reset code');
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, thunkAPI) => {
    try {
      console.log('Auth Slice: Verifying OTP', data);
      return await authService.verifyOtp(data.email, data.otp);
    } catch (error) {
      console.error('OTP verification error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Invalid verification code');
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, thunkAPI) => {
    try {
      console.log('Auth Slice: Resetting password for', data.email);
      return await authService.resetPassword(data.email, data.otp, data.newPassword);
    } catch (error) {
      console.error('Password reset error in slice:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
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
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Demo login cases
      .addCase(demoLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(demoLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(demoLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Only update the user if we got a valid user object
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
        }
        // If no user was found, don't set an error, just keep the user as null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Request password reset cases
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Verify OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
