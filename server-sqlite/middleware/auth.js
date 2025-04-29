const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'solo-leveling-secret-key';

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by id
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Attach user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      rank: user.rank,
      level: user.level
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Generate token for user
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      email: user.email
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
