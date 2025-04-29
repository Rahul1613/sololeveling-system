const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'developer'],
    default: 'moderator'
  },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageQuests: { type: Boolean, default: false },
    manageItems: { type: Boolean, default: false },
    manageGuilds: { type: Boolean, default: false },
    manageEvents: { type: Boolean, default: false },
    manageSystem: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
    moderateContent: { type: Boolean, default: false },
    developMode: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to log admin activity
adminSchema.methods.logActivity = async function(action, details = '', ipAddress = '') {
  this.activityLog.push({
    action,
    details,
    timestamp: new Date(),
    ipAddress
  });
  
  return this.save();
};

// Method to check if admin has permission
adminSchema.methods.hasPermission = function(permission) {
  // Super admin has all permissions
  if (this.role === 'admin') return true;
  
  // Developer has all development permissions
  if (this.role === 'developer' && permission === 'developMode') return true;
  
  // Check specific permission
  return this.permissions[permission] === true;
};

// Set default permissions based on role
adminSchema.methods.setDefaultPermissions = function() {
  switch (this.role) {
    case 'admin':
      Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = true;
      });
      break;
    case 'moderator':
      this.permissions.manageUsers = true;
      this.permissions.moderateContent = true;
      this.permissions.viewAnalytics = true;
      break;
    case 'developer':
      this.permissions.developMode = true;
      this.permissions.viewAnalytics = true;
      break;
  }
  
  return this;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
