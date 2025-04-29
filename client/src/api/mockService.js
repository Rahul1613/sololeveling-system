/**
 * Mock Service Layer
 * This file provides mock implementations of server API calls
 * to allow the application to work without a server connection
 */

// Mock data storage (simulates a database)
const mockDB = {
  users: [
    {
      _id: 'mock-user-1',
      username: 'demouser',
      email: 'demo@example.com',
      password: 'password123', // In a real app, this would be hashed
      level: 10,
      rank: 'E',
      experience: 5000,
      experienceToNextLevel: 7500,
      hp: { current: 100, max: 100 },
      mp: { current: 50, max: 50 },
      currency: 1000,
      statPoints: 5,
      stats: {
        strength: 25,
        agility: 25,
        intelligence: 25,
        endurance: 25,
        luck: 25
      },
      isDemoAccount: true,
      lastLogin: new Date().toISOString()
    },
    {
      _id: 'mock-user-2',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123', // Using a simple password for testing
      level: 5,
      rank: 'F',
      experience: 2000,
      experienceToNextLevel: 3000,
      hp: { current: 80, max: 80 },
      mp: { current: 40, max: 40 },
      currency: 500,
      statPoints: 3,
      stats: {
        strength: 15,
        agility: 15,
        intelligence: 15,
        endurance: 15,
        luck: 15
      },
      isDemoAccount: false,
      lastLogin: new Date().toISOString()
    },
    {
      _id: 'mock-user-3',
      username: 'rahul1613',
      email: 'sisoderahul643@gmail.com',
      password: 'password123', // Using a simple password for testing
      level: 15,
      rank: 'D',
      experience: 8000,
      experienceToNextLevel: 4000,
      hp: { current: 120, max: 120 },
      mp: { current: 60, max: 60 },
      currency: 1500,
      statPoints: 8,
      stats: {
        strength: 30,
        agility: 28,
        intelligence: 32,
        endurance: 27,
        luck: 25
      },
      isDemoAccount: false,
      lastLogin: new Date().toISOString()
    }
  ],
  inventory: {
    'mock-user-1': {
      items: [
        {
          _id: 'item-1',
          name: 'Training Sword',
          description: 'A basic sword for training',
          type: 'weapon',
          rarity: 'common',
          stats: { strength: 5 },
          equipped: true
        },
        {
          _id: 'item-2',
          name: 'Health Potion',
          description: 'Restores 50 HP',
          type: 'consumable',
          rarity: 'common',
          effect: { hp: 50 }
        }
      ]
    }
  },
  quests: [
    {
      _id: 'quest-1',
      title: 'Daily Training',
      description: 'Complete your daily training routine',
      type: 'daily',
      difficulty: 'easy',
      rewards: {
        experience: 100,
        currency: 50
      },
      completed: false
    },
    {
      _id: 'quest-2',
      title: 'Shadow Extraction',
      description: 'Extract a shadow from a defeated enemy',
      type: 'main',
      difficulty: 'medium',
      rewards: {
        experience: 500,
        currency: 200,
        items: ['shadow-essence']
      },
      completed: false
    }
  ],
  shadows: [
    {
      _id: 'shadow-1',
      name: 'Iron',
      level: 5,
      type: 'warrior',
      stats: {
        strength: 15,
        agility: 10,
        intelligence: 5,
        endurance: 12
      }
    }
  ],
  otps: {},
  verifications: []
};

// Try to load saved users from localStorage
try {
  if (typeof localStorage !== 'undefined') {
    const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
    
    // Add any saved users that aren't already in the mockDB
    savedUsers.forEach(savedUser => {
      // Check if this user already exists in mockDB
      const existingUser = mockDB.users.find(u => u._id === savedUser._id || u.email === savedUser.email);
      if (!existingUser && savedUser._id) {
        // Add the user to mockDB (need to add a password field)
        mockDB.users.push({
          ...savedUser,
          password: 'password123' // Using a simple password for testing
        });
        console.log('Mock: Restored user from localStorage on init:', savedUser.username);
      }
    });
  }
} catch (error) {
  console.warn('Mock: Failed to load saved users from localStorage during initialization:', error);
}

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a JWT-like token (not secure, just for simulation)
const generateMockToken = (userId) => {
  return `mock-token-${userId}-${Date.now()}`;
};

// Mock authentication service
const mockAuthService = {
  // Register new user
  register: async (userData) => {
    await delay();
    
    console.log('Mock: Attempting to register user:', { email: userData.email, username: userData.username });
    
    try {
      // Check if email already exists
      if (mockDB.users.some(u => u.email === userData.email)) {
        console.log('Mock: Registration failed - Email already exists:', userData.email);
        throw new Error('Email already in use. Please use a different email address.');
      }
      
      // Check if username already exists
      if (mockDB.users.some(u => u.username === userData.username)) {
        console.log('Mock: Registration failed - Username already exists:', userData.username);
        throw new Error('Username already taken. Please choose a different username.');
      }
      
      // Create new user
      const newUser = {
        _id: `user-${Date.now()}`, // Generate a unique ID
        username: userData.username,
        email: userData.email,
        password: userData.password, // In a real app, this would be hashed
        level: 1,
        rank: 'E',
        experience: 0,
        experienceToNextLevel: 1000,
        hp: { current: 100, max: 100 },
        mp: { current: 30, max: 30 },
        currency: 100,
        statPoints: 0,
        stats: {
          strength: 10,
          agility: 10,
          intelligence: 10,
          endurance: 10,
          luck: 10
        },
        isDemoAccount: false,
        lastLogin: new Date().toISOString(),
        registrationDate: new Date().toISOString()
      };
      
      // Add user to database
      mockDB.users.push(newUser);
      
      // Save user data to localStorage for persistence
      try {
        // Get existing users or initialize empty array
        const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
        
        // Add new user (without password for security)
        const { password, ...userWithoutPassword } = newUser;
        savedUsers.push(userWithoutPassword);
        
        // Save back to localStorage
        localStorage.setItem('soloLevelingUsers', JSON.stringify(savedUsers));
        console.log('Mock: User data saved to localStorage for persistence');
      } catch (storageError) {
        console.warn('Mock: Failed to save user data to localStorage:', storageError);
        // Continue registration process even if localStorage fails
      }
      
      // Generate token
      const token = generateMockToken(newUser._id);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      console.log('Mock: Registration successful for:', userData.email);
      
      return {
        success: true,
        token,
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          level: newUser.level,
          rank: newUser.rank,
          stats: newUser.stats,
          hp: newUser.hp,
          mp: newUser.mp,
          experience: newUser.experience,
          experienceToNextLevel: newUser.experienceToNextLevel,
          currency: newUser.currency,
          statPoints: newUser.statPoints
        }
      };
    } catch (error) {
      console.error('Mock Registration Error:', error.message);
      throw new Error(error.message);
    }
  },
  
  // Login user
  login: async (credentials) => {
    await delay();
    
    try {
      console.log('Mock: Login attempt for:', credentials.email);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      
      // Debug: Show current users in mockDB
      console.log('Mock: Current users in mockDB before login:', mockDB.users.map(u => ({ id: u._id, email: u.email, username: u.username })));
      
      // Load any saved users from localStorage first
      try {
        const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
        console.log('Mock: Saved users from localStorage:', savedUsers.map(u => ({ id: u._id, email: u.email, username: u.username })));
        
        // Add any saved users that aren't already in the mockDB
        savedUsers.forEach(savedUser => {
          // Check if this user already exists in mockDB by ID or email
          const existingUserIndex = mockDB.users.findIndex(u => u.email === savedUser.email);
          
          if (existingUserIndex === -1 && savedUser.email) {
            // Add the user to mockDB (need to add a password field)
            mockDB.users.push({
              ...savedUser,
              password: credentials.email === savedUser.email ? credentials.password : 'password123' // Using a simple password for testing
            });
            console.log('Mock: Added user from localStorage to mockDB:', savedUser.email);
          } else if (existingUserIndex !== -1 && savedUser.email === credentials.email) {
            // Update the existing user's password if this is the user trying to log in
            mockDB.users[existingUserIndex].password = credentials.password;
            console.log('Mock: Updated password for existing user:', savedUser.email);
          }
        });
      } catch (storageError) {
        console.warn('Mock: Failed to load saved users from localStorage:', storageError);
        // Continue login process even if localStorage fails
      }
      
      // Debug: Show updated users in mockDB
      console.log('Mock: Users in mockDB after loading from localStorage:', mockDB.users.map(u => ({ id: u._id, email: u.email, username: u.username })));
      
      // Find user by email
      const user = mockDB.users.find(u => u.email === credentials.email);
      
      // Debug: Show found user
      console.log('Mock: User found for login?', user ? 'Yes' : 'No', user ? user.email : 'none');
      
      // Check if user exists
      if (!user) {
        // If user not found in mockDB, create a new user with the provided credentials
        // This is a fallback for when localStorage persistence fails
        if (credentials.email === 'sisoderahul643@gmail.com' || 
            credentials.email === 'demo@example.com' || 
            credentials.email === 'test@example.com') {
          
          console.log('Mock: Creating fallback user for known email:', credentials.email);
          
          // Find the template user from the initial mockDB setup
          const templateUser = mockDB.users.find(u => u.email === credentials.email);
          
          if (templateUser) {
            // Clone the template user with the new password
            const newUser = {
              ...templateUser,
              password: credentials.password,
              lastLogin: new Date().toISOString()
            };
            
            // Add to mockDB
            mockDB.users.push(newUser);
            
            // Generate token
            const token = generateMockToken(newUser._id);
            
            // Store token in localStorage
            localStorage.setItem('token', token);
            
            // Return user data (excluding password) and token
            const { password, ...userWithoutPassword } = newUser;
            
            console.log('Mock: Login successful for fallback user:', credentials.email);
            
            return {
              user: userWithoutPassword,
              token
            };
          }
        }
        
        throw new Error('Invalid email or password');
      }
      
      // Check password (in a real app, this would use bcrypt.compare)
      if (user.password !== credentials.password) {
        console.log('Mock: Password mismatch. Expected:', user.password, 'Received:', credentials.password);
        
        // Force update password for known users to help with testing
        if (credentials.email === 'sisoderahul643@gmail.com' || 
            credentials.email === 'demo@example.com' || 
            credentials.email === 'test@example.com') {
          console.log('Mock: Forcing password update for known user:', credentials.email);
          user.password = credentials.password;
        } else {
          throw new Error('Invalid email or password');
        }
      }
      
      // Generate token
      const token = generateMockToken(user._id);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Save the updated user to localStorage
      try {
        const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
        const userIndex = savedUsers.findIndex(u => u.email === user.email);
        
        // Create a copy without the password
        const { password, ...userWithoutPassword } = user;
        
        if (userIndex !== -1) {
          // Update existing user
          savedUsers[userIndex] = userWithoutPassword;
        } else {
          // Add new user
          savedUsers.push(userWithoutPassword);
        }
        
        localStorage.setItem('soloLevelingUsers', JSON.stringify(savedUsers));
        console.log('Mock: Updated user saved to localStorage:', user.email);
      } catch (storageError) {
        console.warn('Mock: Failed to save updated user to localStorage:', storageError);
      }
      
      // Return user data (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      
      console.log('Mock: Login successful for:', credentials.email);
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Mock Login Error:', error.message);
      throw new Error(error.message);
    }
  },
  
  // Demo account login
  demoLogin: async () => {
    await delay();
    
    try {
      // Find the demo user
      const user = mockDB.users.find(u => u.email === 'demo@example.com');
      if (!user) {
        throw new Error('Demo account not found');
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Generate token
      const token = generateMockToken(user._id);
      
      // Return user data (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      
      console.log('Mock: Demo login successful');
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Mock: Demo login error:', error.message);
      throw new Error(error.message);
    }
  },
  
  // Google OAuth login
  googleLogin: async (tokenData) => {
    await delay();
    
    // Create or get Google user
    let googleUser = mockDB.users.find(u => u.email === 'google-demo@example.com');
    
    if (!googleUser) {
      googleUser = {
        _id: `mock-user-${mockDB.users.length + 1}`,
        username: 'googleuser',
        email: 'google-demo@example.com',
        password: 'password123', // Using a simple password for testing
        level: 1,
        rank: 'E',
        experience: 0,
        experienceToNextLevel: 1000,
        hp: { current: 100, max: 100 },
        mp: { current: 30, max: 30 },
        currency: 100,
        statPoints: 0,
        stats: {
          strength: 10,
          agility: 10,
          intelligence: 10,
          endurance: 10,
          luck: 10
        },
        profileImage: 'https://ui-avatars.com/api/?name=Google+User&background=random',
        authProvider: 'google',
        lastLogin: new Date().toISOString()
      };
      
      mockDB.users.push(googleUser);
      
      // Create inventory for new user
      mockDB.inventory[googleUser._id] = {
        items: [
          {
            _id: `item-${Date.now()}`,
            name: 'Starter Sword',
            description: 'A basic sword for beginners',
            type: 'weapon',
            rarity: 'common',
            stats: { strength: 3 },
            equipped: true
          }
        ]
      };
    }
    
    // Update last login
    googleUser.lastLogin = new Date().toISOString();
    
    // Generate token
    const token = generateMockToken(googleUser._id);
    
    return {
      success: true,
      token,
      user: {
        _id: googleUser._id,
        username: googleUser.username,
        email: googleUser.email,
        level: googleUser.level,
        rank: googleUser.rank,
        profileImage: googleUser.profileImage,
        stats: googleUser.stats,
        hp: { current: googleUser.hp.current, max: googleUser.hp.max },
        mp: { current: googleUser.mp.current, max: googleUser.mp.max },
        experience: googleUser.experience,
        experienceToNextLevel: googleUser.experienceToNextLevel,
        currency: googleUser.currency,
        statPoints: googleUser.statPoints
      }
    };
  },
  
  // Facebook OAuth login
  facebookLogin: async (userData) => {
    await delay();
    
    // Create or get Facebook user
    let fbUser = mockDB.users.find(u => u.email === 'facebook-demo@example.com');
    
    if (!fbUser) {
      fbUser = {
        _id: `mock-user-${mockDB.users.length + 1}`,
        username: 'facebookuser',
        email: 'facebook-demo@example.com',
        password: 'password123', // Using a simple password for testing
        level: 1,
        rank: 'E',
        experience: 0,
        experienceToNextLevel: 1000,
        hp: { current: 100, max: 100 },
        mp: { current: 30, max: 30 },
        currency: 100,
        statPoints: 0,
        stats: {
          strength: 10,
          agility: 10,
          intelligence: 10,
          endurance: 10,
          luck: 10
        },
        profileImage: 'https://ui-avatars.com/api/?name=Facebook+User&background=random',
        authProvider: 'facebook',
        lastLogin: new Date().toISOString()
      };
      
      mockDB.users.push(fbUser);
      
      // Create inventory for new user
      mockDB.inventory[fbUser._id] = {
        items: [
          {
            _id: `item-${Date.now()}`,
            name: 'Starter Sword',
            description: 'A basic sword for beginners',
            type: 'weapon',
            rarity: 'common',
            stats: { strength: 3 },
            equipped: true
          }
        ]
      };
    }
    
    // Update last login
    fbUser.lastLogin = new Date().toISOString();
    
    // Generate token
    const token = generateMockToken(fbUser._id);
    
    return {
      success: true,
      token,
      user: {
        _id: fbUser._id,
        username: fbUser.username,
        email: fbUser.email,
        level: fbUser.level,
        rank: fbUser.rank,
        profileImage: fbUser.profileImage,
        stats: fbUser.stats,
        hp: { current: fbUser.hp.current, max: fbUser.hp.max },
        mp: { current: fbUser.mp.current, max: fbUser.mp.max },
        experience: fbUser.experience,
        experienceToNextLevel: fbUser.experienceToNextLevel,
        currency: fbUser.currency,
        statPoints: fbUser.statPoints
      }
    };
  },
  
  // Logout user (client-side only)
  logout: () => {
    // Just clear local storage (no server call needed)
  },
  
  // Get current user
  getCurrentUser: async () => {
    await delay();
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Mock: No token found in localStorage');
      // Return a successful response with null user instead of throwing an error
      return {
        success: true,
        user: null
      };
    }
    
    // Extract user ID from token
    const userId = token.split('-')[1];
    
    // Find user by ID
    const user = mockDB.users.find(u => u._id === userId);
    if (!user) {
      console.log('Mock: User not found for ID:', userId);
      // Return a successful response with null user instead of throwing an error
      return {
        success: true,
        user: null
      };
    }
    
    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        rank: user.rank,
        stats: user.stats,
        hp: { current: user.hp.current, max: user.hp.max },
        mp: { current: user.mp.current, max: user.mp.max },
        experience: user.experience,
        experienceToNextLevel: user.experienceToNextLevel,
        currency: user.currency,
        statPoints: user.statPoints,
        isDemoAccount: user.isDemoAccount
      }
    };
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    await delay();
    
    // Check if email exists
    const user = mockDB.users.find(u => u.email === email);
    if (!user) {
      const error = new Error('Email not found');
      error.response = {
        data: {
          message: 'Email not found'
        },
        status: 404
      };
      throw error;
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP
    mockDB.otps[email] = {
      otp,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    };
    
    console.log(`Mock: Generated OTP for ${email}: ${otp}`);
    
    // In a real implementation, this would send an actual email
    // For now, we'll just log it and return a success message
    
    return {
      success: true,
      message: 'Password reset instructions sent to your email. Please check your inbox.'
    };
  },
  
  // Verify OTP
  verifyOtp: async (email, otp) => {
    await delay();
    
    console.log('Mock: Verifying OTP for email:', email, 'OTP:', otp);
    
    try {
      if (!mockDB.otps || !mockDB.otps[email]) {
        console.log('Mock: No OTP found for email:', email);
        throw new Error('Invalid or expired OTP. Please request a new one.');
      }
      
      const otpData = mockDB.otps[email];
      console.log('Mock: Stored OTP data:', otpData);
      
      // Check if OTP is expired
      if (new Date() > new Date(otpData.expiresAt)) {
        console.log('Mock: OTP expired for email:', email);
        delete mockDB.otps[email]; // Clean up expired OTP
        throw new Error('OTP has expired. Please request a new one.');
      }
      
      // Check if OTP matches
      if (otpData.otp !== otp) {
        console.log('Mock: OTP mismatch for email:', email, 'Expected:', otpData.otp, 'Received:', otp);
        throw new Error('Invalid OTP. Please try again.');
      }
      
      console.log('Mock: OTP verified successfully for email:', email);
      
      return {
        success: true,
        message: 'OTP verified successfully.'
      };
    } catch (error) {
      console.error('Mock OTP Verification Error:', error.message);
      throw new Error(error.message);
    }
  },
  
  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    await delay();
    
    console.log('Mock: Resetting password for email:', email);
    
    try {
      // Verify OTP first
      if (!mockDB.otps || !mockDB.otps[email]) {
        console.log('Mock: No OTP found for email:', email);
        throw new Error('Invalid or expired session. Please restart the password reset process.');
      }
      
      const otpData = mockDB.otps[email];
      
      // Check if OTP is expired
      if (new Date() > new Date(otpData.expiresAt)) {
        console.log('Mock: OTP expired for email:', email);
        delete mockDB.otps[email]; // Clean up expired OTP
        throw new Error('Your session has expired. Please restart the password reset process.');
      }
      
      // Check if OTP matches
      if (otpData.otp !== otp) {
        console.log('Mock: OTP mismatch for email:', email, 'Expected:', otpData.otp, 'Received:', otp);
        throw new Error('Invalid verification code. Please try again.');
      }
      
      // Find user and update password
      const userIndex = mockDB.users.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        console.log('Mock: User not found for email:', email);
        throw new Error('User not found. Please check your email address.');
      }
      
      // Update password
      mockDB.users[userIndex].password = newPassword;
      
      // Clean up used OTP
      delete mockDB.otps[email];
      
      console.log('Mock: Password reset successful for email:', email);
      
      return {
        success: true,
        message: 'Password reset successful. You can now log in with your new password.'
      };
    } catch (error) {
      console.error('Mock Password Reset Error:', error.message);
      throw new Error(error.message);
    }
  },
  
  // Mock user service for user-related functionality
  user: {
    // Generate mock users for rankings
    generateMockUsers: (count = 50) => {
      // Define ranks for potential future use in random rank generation
      // Currently not used directly but kept for reference
      // const ranks = ['S', 'A', 'B', 'C', 'D', 'E'];
      const mockUsers = [];
      
      // Add all real users from the database to the rankings
      const realUsers = mockDB.users.map(user => ({
        _id: user._id,
        username: user.username,
        rank: user.rank || 'E',
        level: user.level || 1,
        experience: user.experience || 0,
        isCurrentUser: false,
        lastLogin: user.lastLogin || null
      }));
      
      // Add real users to the list
      mockUsers.push(...realUsers);
      
      // Mark current user if logged in
      const token = localStorage.getItem('token');
      if (token) {
        const userId = token.split('-')[1];
        const currentUserIndex = mockUsers.findIndex(u => u._id === userId);
        
        if (currentUserIndex !== -1) {
          mockUsers[currentUserIndex].isCurrentUser = true;
        }
      }
      
      // Sort by experience (descending)
      mockUsers.sort((a, b) => b.experience - a.experience);
      
      // Add position property
      mockUsers.forEach((user, index) => {
        user.position = index + 1;
      });
      
      return mockUsers;
    },
    
    // Get global rankings
    getRankings: async () => {
      await delay(800); // Simulate network delay
      return mockAuthService.user.generateMockUsers(50); // Generate 50 mock users for rankings
    },
    
    // Update user rank based on experience
    updateRank: async (userId) => {
      await delay(300); // Simulate network delay
      
      // Find the user
      const user = mockDB.users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Calculate rank based on level
      let newRank = 'E';
      if (user.level >= 50) newRank = 'S';
      else if (user.level >= 40) newRank = 'A';
      else if (user.level >= 30) newRank = 'B';
      else if (user.level >= 20) newRank = 'C';
      else if (user.level >= 10) newRank = 'D';
      else newRank = 'E';
      
      // Update user's rank if changed
      if (user.rank !== newRank) {
        const oldRank = user.rank;
        user.rank = newRank;
        return {
          success: true,
          message: `Rank updated from ${oldRank || 'E'} to ${newRank}!`,
          oldRank: oldRank || 'E',
          newRank
        };
      }
      
      return {
        success: true,
        message: 'Rank unchanged',
        rank: user.rank
      };
    },
    
    // Get user skills
    getUserSkills: async (userId) => {
      await delay(300); // Simulate network delay
      
      // Find the user
      const user = mockDB.users.find(u => u._id === userId);
      if (!user) {
        console.log('Mock: User not found for skills, ID:', userId);
        // Return empty skills array instead of throwing an error
        return [];
      }
      
      // Mock skills based on user level
      const skills = [
        { id: 'skill-1', name: 'Basic Strength', level: Math.min(Math.floor(user.level / 5), 5), maxLevel: 5, description: 'Increases strength stat by 10% per level', icon: '💪', unlocked: user.level >= 5 },
        { id: 'skill-2', name: 'Enhanced Agility', level: Math.min(Math.floor(user.level / 7), 5), maxLevel: 5, description: 'Increases agility stat by 10% per level', icon: '🏃', unlocked: user.level >= 7 },
        { id: 'skill-3', name: 'Mental Focus', level: Math.min(Math.floor(user.level / 10), 5), maxLevel: 5, description: 'Increases intelligence stat by 10% per level', icon: '🧠', unlocked: user.level >= 15 },
        { id: 'skill-4', name: 'Iron Body', level: Math.min(Math.floor(user.level / 12), 5), maxLevel: 5, description: 'Increases endurance stat by 10% per level', icon: '🛡️', unlocked: user.level >= 20 },
        { id: 'skill-5', name: 'Fortune Finder', level: Math.min(Math.floor(user.level / 15), 5), maxLevel: 5, description: 'Increases luck stat by 10% per level', icon: '🍀', unlocked: user.level >= 25 }
      ];
      
      return skills;
    },
    
    // Get user titles
    getUserTitles: async (userId) => {
      await delay(300); // Simulate network delay
      
      // Find the user
      const user = mockDB.users.find(u => u._id === userId);
      if (!user) {
        console.log('Mock: User not found for titles, ID:', userId);
        // Return empty titles array instead of throwing an error
        return [];
      }
      
      // Mock titles based on user level
      const titles = [
        { id: 'title-1', name: 'Novice Hunter', description: 'Completed 10 quests', acquired: user.level >= 5, bonus: '+5% XP from quests' },
        { id: 'title-2', name: 'Shadow Master', description: 'Extracted 5 shadows', acquired: user.level >= 10, bonus: '+10% shadow strength' },
        { id: 'title-3', name: 'Dungeon Conqueror', description: 'Completed 5 dungeons', acquired: user.level >= 15, bonus: '+15% dungeon rewards' },
        { id: 'title-4', name: 'Stat Optimizer', description: 'Reach 50 in any stat', acquired: user.level >= 20, bonus: '+5% to all stats' },
        { id: 'title-5', name: 'Solo Leveler', description: 'Reach level 50', acquired: user.level >= 50, bonus: 'Unlock special skill tree' }
      ];
      
      return titles;
    },
    
    // Get user dungeon keys
    getUserDungeonKeys: async (userId) => {
      await delay(300); // Simulate network delay
      
      // Find the user
      const user = mockDB.users.find(u => u._id === userId);
      if (!user) {
        console.log('Mock: User not found for dungeon keys, ID:', userId);
        // Return empty dungeon keys array instead of throwing an error
        return [];
      }
      
      // Mock dungeon keys based on user rank
      const dungeonKeys = [
        { id: 'key-1', name: 'E-Rank Dungeon Key', rank: 'E', count: 3, cooldown: 0, description: 'Allows entry to E-Rank dungeons' },
        { id: 'key-2', name: 'D-Rank Dungeon Key', rank: 'D', count: user.rank === 'D' || user.rank === 'C' || user.rank === 'B' || user.rank === 'A' || user.rank === 'S' ? 2 : 0, cooldown: 0, description: 'Allows entry to D-Rank dungeons' },
        { id: 'key-3', name: 'C-Rank Dungeon Key', rank: 'C', count: user.rank === 'C' || user.rank === 'B' || user.rank === 'A' || user.rank === 'S' ? 1 : 0, cooldown: 12, description: 'Allows entry to C-Rank dungeons' },
        { id: 'key-4', name: 'B-Rank Dungeon Key', rank: 'B', count: user.rank === 'B' || user.rank === 'A' || user.rank === 'S' ? 1 : 0, cooldown: 24, description: 'Allows entry to B-Rank dungeons' },
        { id: 'key-5', name: 'A-Rank Dungeon Key', rank: 'A', count: user.rank === 'A' || user.rank === 'S' ? 1 : 0, cooldown: 48, description: 'Allows entry to A-Rank dungeons' },
        { id: 'key-6', name: 'S-Rank Dungeon Key', rank: 'S', count: user.rank === 'S' ? 1 : 0, cooldown: 72, description: 'Allows entry to S-Rank dungeons' }
      ];
      
      return dungeonKeys;
    }
  },
  
  // Mock verification service for video verification
  verification: {
    // Submit verification for a quest
    submitVerification: async (questId, submissionData) => {
      await delay(1000); // Simulate network delay
      
      console.log('Mock: Submitting verification for quest:', questId);
      
      try {
        // Find the quest
        const quest = mockDB.quests.find(q => q._id === questId);
        if (!quest) {
          throw new Error('Quest not found');
        }
        
        // Get current user ID from token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User not authenticated');
        }
        const userId = token.split('-')[1];
        
        // Create a unique ID for the submission
        const submissionId = `verification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Prepare verification data
        const verification = {
          _id: submissionId,
          user: userId,
          quest: questId,
          questTitle: quest.title,
          submissionType: submissionData.type || 'video',
          mediaUrl: submissionData.mediaUrl || null,
          submittedAt: new Date().toISOString(),
          verificationStatus: 'pending',
          aiVerificationResult: null,
          manualVerification: null
        };
        
        // Store verification in mock DB
        if (!mockDB.verifications) {
          mockDB.verifications = [];
        }
        mockDB.verifications.push(verification);
        
        // If AI verification is enabled, process it immediately
        if (submissionData.type === 'video') {
          // Start AI verification process (non-blocking)
          setTimeout(() => {
            mockAuthService.verification.processVideoWithAI(submissionId);
          }, 2000);
        }
        
        return {
          success: true,
          message: 'Verification submission received',
          submissionId
        };
      } catch (error) {
        console.error('Mock Verification Submission Error:', error.message);
        throw new Error(error.message);
      }
    },
    
    // Process video with AI
    processVideoWithAI: async (submissionId) => {
      console.log('Mock: Processing video with AI for submission:', submissionId);
      
      try {
        // Find the verification submission
        if (!mockDB.verifications) {
          mockDB.verifications = [];
          throw new Error('Verification submission not found');
        }
        
        const submission = mockDB.verifications.find(v => v._id === submissionId);
        if (!submission) {
          throw new Error('Verification submission not found');
        }
        
        // Find the quest to get verification criteria
        const quest = mockDB.quests.find(q => q._id === submission.quest);
        if (!quest) {
          throw new Error('Quest not found');
        }
        
        // Simulate AI processing delay
        await delay(3000 + Math.random() * 2000);
        
        // Determine verification criteria based on quest type
        let detectedObjects = [];
        let detectedActivities = [];
        let confidenceScore = 0;
        let success = false;
        let feedback = '';
        
        // Simulate different AI detection scenarios based on quest type
        switch (quest.type) {
          case 'fitness':
            detectedObjects = ['person'];
            detectedActivities = ['exercise', 'physical_activity'];
            confidenceScore = 0.65 + (Math.random() * 0.3); // 65-95% confidence
            success = confidenceScore > 0.7;
            feedback = success 
              ? 'Exercise detected with good form. Keep up the good work!' 
              : 'Exercise detected but form could be improved. Make sure your full body is visible in the video.';
            break;
            
          case 'study':
            detectedObjects = ['person', 'book', 'desk'];
            detectedActivities = ['reading', 'writing', 'studying'];
            confidenceScore = 0.7 + (Math.random() * 0.25); // 70-95% confidence
            success = confidenceScore > 0.75;
            feedback = success 
              ? 'Study session verified. Great focus observed!' 
              : 'Study materials detected but activity duration seems short. Ensure you record your full study session.';
            break;
            
          case 'creative':
            detectedObjects = ['person', 'art_supplies'];
            detectedActivities = ['creating', 'drawing', 'crafting'];
            confidenceScore = 0.75 + (Math.random() * 0.2); // 75-95% confidence
            success = confidenceScore > 0.8;
            feedback = success 
              ? 'Creative work verified. Impressive progress!' 
              : 'Creative activity detected but couldn\'t verify completion. Show the finished work clearly in your video.';
            break;
            
          default:
            // Generic verification for other quest types
            detectedObjects = ['person'];
            detectedActivities = ['activity'];
            confidenceScore = 0.6 + (Math.random() * 0.35); // 60-95% confidence
            success = confidenceScore > 0.7;
            feedback = success 
              ? 'Task completion verified successfully.' 
              : 'Task activity detected but couldn\'t verify completion. Please provide a clearer video showing the completed task.';
        }
        
        // Create AI verification result
        const aiResult = {
          success,
          confidence: confidenceScore,
          detectedObjects,
          detectedActivities,
          feedback,
          processedAt: new Date().toISOString()
        };
        
        // Update submission with AI result
        submission.aiVerificationResult = aiResult;
        submission.verificationStatus = success ? 'approved' : 'rejected';
        
        console.log('Mock: AI verification completed for submission:', submissionId, 'Result:', success ? 'Approved' : 'Rejected');
        
        // If verified successfully, complete the quest for the user
        if (success) {
          mockAuthService.verification.completeQuestForUser(submission.user, submission.quest);
        }
        
        return aiResult;
      } catch (error) {
        console.error('Mock AI Processing Error:', error.message);
        throw new Error(error.message);
      }
    },
    
    // Complete quest for user after successful verification
    completeQuestForUser: async (userId, questId) => {
      console.log('Mock: Completing quest for user:', userId, 'Quest:', questId);
      
      try {
        // Find the user
        const user = mockDB.users.find(u => u._id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        // Find the quest
        const quest = mockDB.quests.find(q => q._id === questId);
        if (!quest) {
          throw new Error('Quest not found');
        }
        
        // Check if quest is already completed
        if (user.completedQuests && user.completedQuests.includes(questId)) {
          console.log('Mock: Quest already completed');
          return {
            success: true,
            message: 'Quest already completed',
            alreadyCompleted: true
          };
        }
        
        // Add quest to completed quests
        if (!user.completedQuests) {
          user.completedQuests = [];
        }
        user.completedQuests.push(questId);
        
        // Remove from active quests if present
        if (user.activeQuests) {
          user.activeQuests = user.activeQuests.filter(q => q.quest !== questId);
        }
        
        // Add rewards
        const experienceGained = quest.rewards?.experience || 50;
        const currencyGained = quest.rewards?.currency || 10;
        const statPointsGained = quest.rewards?.statPoints || 1;
        
        user.currency = (user.currency || 0) + currencyGained;
        user.statPoints = (user.statPoints || 0) + statPointsGained;
        
        // Add experience and handle level ups
        const oldLevel = user.level || 1;
        const oldExperience = user.experience || 0;
        
        user.experience = oldExperience + experienceGained;
        
        // Calculate new level based on experience
        // Simple formula: level = 1 + floor(sqrt(experience / 100))
        const newLevel = 1 + Math.floor(Math.sqrt(user.experience / 100));
        const leveledUp = newLevel > oldLevel;
        
        if (leveledUp) {
          user.level = newLevel;
          
          // Add notification for level up
          if (!mockDB.notifications) {
            mockDB.notifications = [];
          }
          
          mockDB.notifications.push({
            _id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            user: userId,
            type: 'level_up',
            title: 'Level Up!',
            message: `You have reached level ${newLevel}! You gained ${statPointsGained} stat points.`,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
        
        // Add notification for quest completion
        if (!mockDB.notifications) {
          mockDB.notifications = [];
        }
        
        mockDB.notifications.push({
          _id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user: userId,
          type: 'quest_completion',
          title: 'Quest Completed',
          message: `You completed "${quest.title}" and gained ${experienceGained} XP, ${currencyGained} gold, and ${statPointsGained} stat points.`,
          createdAt: new Date().toISOString(),
          read: false
        });
        
        // Save updated user to localStorage
        try {
          const savedUsers = JSON.parse(localStorage.getItem('soloLevelingUsers') || '[]');
          const userIndex = savedUsers.findIndex(u => u._id === userId);
          
          if (userIndex !== -1) {
            // Update existing user
            savedUsers[userIndex] = { ...user };
          } else {
            // Add new user
            savedUsers.push(user);
          }
          
          localStorage.setItem('soloLevelingUsers', JSON.stringify(savedUsers));
          console.log('Mock: Updated user saved to localStorage after quest completion');
        } catch (storageError) {
          console.warn('Mock: Failed to save updated user to localStorage:', storageError);
        }
        
        console.log('Mock: Quest completed successfully for user:', userId, 'Quest:', questId);
        
        return {
          success: true,
          message: 'Quest completed successfully',
          rewards: {
            experience: experienceGained,
            currency: currencyGained,
            statPoints: statPointsGained
          },
          levelUp: leveledUp ? {
            oldLevel,
            newLevel
          } : null
        };
      } catch (error) {
        console.error('Mock Quest Completion Error:', error.message);
        throw new Error(error.message);
      }
    },
    
    // Get verification status
    getVerificationStatus: async (submissionId) => {
      await delay(300); // Simulate network delay
      
      console.log('Mock: Getting verification status for submission:', submissionId);
      
      try {
        if (!mockDB.verifications) {
          mockDB.verifications = [];
          throw new Error('Verification submission not found');
        }
        
        const submission = mockDB.verifications.find(v => v._id === submissionId);
        if (!submission) {
          throw new Error('Verification submission not found');
        }
        
        return {
          status: submission.verificationStatus,
          aiResult: submission.aiVerificationResult,
          submittedAt: submission.submittedAt
        };
      } catch (error) {
        console.error('Mock Get Verification Status Error:', error.message);
        throw new Error(error.message);
      }
    },
    
    // Get all verification submissions for a user
    getUserVerifications: async () => {
      await delay(500); // Simulate network delay
      
      try {
        // Get current user ID from token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User not authenticated');
        }
        const userId = token.split('-')[1];
        
        if (!mockDB.verifications) {
          mockDB.verifications = [];
        }
        
        // Get user's verifications
        const verifications = mockDB.verifications
          .filter(v => v.user === userId)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        return verifications;
      } catch (error) {
        console.error('Mock Get User Verifications Error:', error.message);
        throw new Error(error.message);
      }
    }
  }
};

export default mockAuthService;
