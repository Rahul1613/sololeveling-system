import mockAuthService from './mockService';
import databaseService from './databaseService';

// Direct implementation using mock service without any conditional logic
const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Auth Service: Registering user', userData.email);
      const result = await mockAuthService.register(userData);
      
      // Store token and user data using database service
      if (result.token) {
        databaseService.saveAuthData({
          token: result.token,
          user: result.user
        });
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Auth Service: Logging in user', credentials.email);
      
      // Clear any existing auth data first to prevent conflicts
      databaseService.clearAuthData();
      
      const result = await mockAuthService.login(credentials);
      
      // Store token and user data using database service
      if (result.token) {
        databaseService.saveAuthData({
          token: result.token,
          user: result.user
        });
        console.log('Auth Service: Login successful, token and user stored');
      } else {
        console.error('Auth Service: Login response missing token');
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    console.log('Auth Service: Logging out user');
    databaseService.clearAuthData();
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('Auth Service: Getting current user');
      return await databaseService.getCurrentUser();
    } catch (error) {
      console.error('Get current user error:', error);
      // Return a successful response with null user instead of throwing an error
      return { user: null, token: null };
    }
  },

  // Demo account login
  demoLogin: async () => {
    try {
      console.log('Auth Service: Using demo login');
      const result = await mockAuthService.demoLogin();
      
      // Store token and user data using database service
      if (result.token) {
        databaseService.saveAuthData({
          token: result.token,
          user: result.user
        });
      }
      
      return result;
    } catch (error) {
      console.error('Demo login error:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      console.log('Auth Service: Requesting password reset for', email);
      return await mockAuthService.requestPasswordReset(email);
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      console.log('Auth Service: Verifying OTP for', email);
      return await mockAuthService.verifyOtp(email, otp);
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    try {
      console.log('Auth Service: Resetting password for', email);
      return await mockAuthService.resetPassword(email, otp, newPassword);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};

export default authService;
