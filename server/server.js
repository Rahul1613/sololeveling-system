const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const fs = require('fs');

// Import all models to ensure they're registered before use
require('./models/index');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const questRoutes = require('./routes/quest');
const inventoryRoutes = require('./routes/inventory');
const shadowRoutes = require('./routes/shadow');
const marketplaceRoutes = require('./routes/marketplace');
const skillsRoutes = require('./routes/skills');
const titlesRoutes = require('./routes/titles');
const dungeonKeysRoutes = require('./routes/dungeonKeys');
const classesRoutes = require('./routes/classes');
const customQuestRoutes = require('./routes/customQuestRoutes');
const { initializeWebSocketServer } = require('./websocket');
const { updateClientConfig } = require('./utils/portConfig');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Simplified CORS configuration for better stability
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // List of allowed origins in production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5002',
      'http://localhost:5003',
      'http://localhost:5004',
      'http://localhost:5005',
      'http://localhost:5006',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:8080',
      'https://solo-leveling-app.netlify.app',
      'https://solo-leveling-app.vercel.app',
      'https://sololeveling-system.onrender.com'
    ];
    
    // Simple origin check
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Request-ID', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'X-API-Key'
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range', 
    'X-Total-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with error handling
app.use((req, res, next) => {
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('CORS Error:', err.message);
      return res.status(403).json({
        success: false,
        message: 'CORS Error: Origin not allowed',
        error: err.message
      });
    }
    next();
  });
});

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));

// Serve React frontend static files
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));

// Serve React app for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Add health check endpoint for network connectivity testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running and healthy'
  });
});

// Add request ID middleware for better request tracking
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || 
                    Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static item images from the React public directory
const clientItemsPath = path.join(__dirname, '..', 'client', 'public', 'images', 'items');
app.use('/images/items', express.static(clientItemsPath));

// Initialize WebSocket server
let wss = null;
try {
  // Create a dummy WebSocket server if real one fails
  const dummyWss = {
    on: () => {},
    clients: new Set(),
    close: () => {},
    broadcast: () => {}
  };
  
  try {
    wss = initializeWebSocketServer(server);
    console.log('WebSocket server initialized successfully');
  } catch (wsError) {
    console.error('Error initializing WebSocket server:', wsError);
    console.log('Using dummy WebSocket server as fallback');
    wss = dummyWss;
  }
} catch (error) {
  console.error('Critical error in WebSocket initialization:', error);
}

// Make WebSocket server accessible to routes
app.set('wss', wss);

// Initialize Socket.io for backward compatibility
let io;
try {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Make Socket.io accessible to routes
  app.set('io', io);
  
  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Socket.io client connected');
    
    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected');
    });
  });
  
  console.log('Socket.io initialized successfully');
} catch (error) {
  console.error('Error initializing Socket.io:', error);
  
  // Create a dummy Socket.io server as fallback
  const dummyIo = {
    to: () => ({ emit: () => {} }),
    emit: () => {},
    on: () => {}
  };
  
  app.set('io', dummyIo);
  console.log('Using dummy Socket.io server as fallback');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/custom-quests', customQuestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shadows', shadowRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/titles', titlesRoutes);
app.use('/api/dungeonkeys', dungeonKeysRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/verification', require('./routes/verification'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/oauth', require('./routes/oauth'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Import error handler utilities
const { AppError, formatError } = require('./utils/errorHandler');

// Not Found middleware - for routes that don't exist
app.use((req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404, 'not_found');
  next(error);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log the error for server-side debugging
  console.error('ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
  
  // Format the error response using our utility
  const errorResponse = formatError(err, req);
  
  // Send the response
  res.status(err.statusCode || 500).json(errorResponse);
});

// Start server with port fallback mechanism
const tryPort = (port) => {
  return new Promise((resolve, reject) => {
    const testServer = http.createServer();
    
    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying next port`);
        testServer.close();
        resolve(false);
      } else {
        reject(err);
      }
    });
    
    testServer.once('listening', () => {
      testServer.close();
      resolve(true);
    });
    
    testServer.listen(port);
  });
};

const startServer = async () => {
  // On Render or production, always use process.env.PORT
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    const PORT = process.env.PORT;
    if (!PORT) {
      console.error('PORT environment variable is required on Render/production!');
      process.exit(1);
    }
    server.listen(PORT, () => {
      console.log(`[RENDER/PROD] Server running on port ${PORT}`);
      // No need to write port.json or update client config in production
    });
    return;
  }

  // Local development: try preferred and fallback ports
  const preferredPort = process.env.PORT || 5002;
  const fallbackPorts = [5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010];
  let PORT = preferredPort;

  try {
    // Check if preferred port is available
    const isPreferredAvailable = await tryPort(preferredPort);
    if (!isPreferredAvailable) {
      // Try fallback ports
      for (const port of fallbackPorts) {
        const isAvailable = await tryPort(port);
        if (isAvailable) {
          PORT = port;
          break;
        }
      }
    }

    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use despite our checks.`);
      }
    });

    server.listen(PORT, () => {
      console.log(`[LOCAL DEV] Server running on port ${PORT}`);
      // Save the port to a file for the client to read
      const portInfoPath = path.join(__dirname, 'port.json');
      fs.writeFileSync(portInfoPath, JSON.stringify({ port: PORT }));
      console.log(`Port information saved to ${portInfoPath}`);
      // Update client config with the new port
      updateClientConfig(PORT);
      console.log('Client configuration updated with the new port');
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

// Start the server
startServer();

module.exports = { app, wss };
