import mockAuthService from './mockService';

// Direct implementation using mock service without any conditional logic
const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Auth Service: Registering user', userData.email);
      const result = await mockAuthService.register(userData);
      
      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const result = await mockAuthService.login(credentials);
      
      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('Auth Service: Login successful, token and user stored in localStorage');
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
    
    // Save current user data to soloLevelingUsers before removing from localStorage
    try {
      const currentUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
        
        // Check if user already exists in saved users
        const existingUserIndex = savedUsers.findIndex(u => u._id === user._id || u.email === user.email);
        
        if (existingUserIndex !== -1) {
          // Update existing user
          savedUsers[existingUserIndex] = { ...savedUsers[existingUserIndex], ...user };
        } else {
          // Add new user
          savedUsers.push(user);
        }
        
        localStorage.setItem('soloLevelingUsers', JSON.stringify(savedUsers));
        console.log('Auth Service: User data saved before logout');
      }
    } catch (error) {
      console.error('Error saving user data before logout:', error);
    }
    
    // Remove auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('Auth Service: Getting current user');
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        console.log('No user logged in yet');
        // Return a successful response with null user instead of throwing an error
        return { user: null, token: null };
      }
      
      return { user: JSON.parse(user), token };
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
      
      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
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
