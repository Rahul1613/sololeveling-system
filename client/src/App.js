import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Snackbar, Alert, CircularProgress, Button } from '@mui/material';
import { getCurrentUser } from './redux/slices/authSlice';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import QuestBoard from './pages/QuestBoard';
import CustomQuests from './pages/CustomQuests';
import ActiveQuests from './pages/ActiveQuests';
import Inventory from './pages/Inventory';
import ShadowArmy from './pages/ShadowArmy';
import Marketplace from './pages/Marketplace';
import MarketplaceTest from './pages/MarketplaceTest';
import MarketplaceImageTest from './pages/MarketplaceImageTest';
import MarketplaceSimple from './pages/MarketplaceSimple';
import Skills from './pages/Skills';
import Titles from './pages/Titles';
import Profile from './pages/Profile';
import VerificationPage from './pages/VerificationPage';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import NotificationSystem from './components/NotificationSystem';
import NetworkStatusIndicator from './components/common/NetworkStatusIndicator';
import NetworkErrorBoundary from './components/common/NetworkErrorBoundary';
import ErrorHandler from './components/common/ErrorHandler';
import IntroAnimation from './components/IntroAnimation';

// Utils
import socketService from './utils/socketService';
import networkManager from './utils/networkManager';
import { initErrorFixes } from './utils/errorFixer';
import { applyAxiosMergePatch } from './utils/axiosMergePatch';
import { fixAxiosSliceError } from './utils/axiosSliceFix';
import databaseService from './api/databaseService';

// Styles
import './App.css';
import './styles/GlobalTheme.css'; // Import the global theme override

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.user);
  const [networkError, setNetworkError] = useState(null);
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // Initialize database service and check for authentication on app load
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('App: Initializing database service...');
        // Initialize database service
        databaseService.init();
        
        // Check if user is authenticated
        if (databaseService.isAuthenticated()) {
          console.log('App: User is authenticated, restoring session...');
          await dispatch(getCurrentUser()).unwrap();
        }
        
        // Apply error fixes
        initErrorFixes();
        applyAxiosMergePatch();
        fixAxiosSliceError();
        
        // Initialize network manager
        networkManager.init({
          onNetworkError: (event) => {
            // If there's a critical network error, show it at the app level
            if (event && event.type === 'error' && event.critical) {
              setNetworkError({
                message: event.error,
                userMessage: 'Network connection lost. Attempting to reconnect...'
              });
              setShowNetworkAlert(true);
            }
          },
          onNetworkRestore: (event) => {
            // If network is restored, hide the alert
            if (event && event.type === 'restore') {
              setShowNetworkAlert(false);
            }
          }
        });
        
        // Initialize socket service if user is logged in
        if (user) {
          socketService.init(user._id);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setNetworkError({
          message: error?.message || 'Initialization failed',
          userMessage: 'Failed to initialize app. Please check your server connection and try again.'
        });
        setShowNetworkAlert(true);
      }
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show intro animation only after login, not on every refresh
  useEffect(() => {
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (justLoggedIn === 'true' && user) {
      setShowIntro(true);
      // Clear the flag so it only shows once after login
      sessionStorage.removeItem('justLoggedIn');
    }
  }, [user]);

  const handleIntroFinish = () => {
    setShowIntro(false);
  };

  // Initialize audio context for sound effects and animations
  useEffect(() => {
    const initAudioContext = () => {
      try {
        if (!window.audioContext) {
          window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          setAudioContextInitialized(true);
          console.log('Audio context initialized');
        }
      } catch (error) {
        console.log('Audio context initialization skipped in this browser');
        // Don't show error, just silently fail
      }
    };

    // Try to initialize immediately
    initAudioContext();

    // Also initialize on first user interaction
    const handleUserInteraction = () => {
      initAudioContext();
      // Remove event listeners after initialization
      if (audioContextInitialized) {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      // Clean up event listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audioContextInitialized]);

  // Force mock mode for development environment to prevent network errors
  useEffect(() => {
    // Check if we're in development or using mock API
    const isMockEnvironment = process.env.NODE_ENV === 'development' || 
                             process.env.REACT_APP_USE_MOCK_API === 'true' ||
                             window.location.hostname === 'localhost';
    
    if (isMockEnvironment) {
      console.log('Mock environment detected: Disabling real network connections');
      
      // Set a global flag to indicate we're in mock mode
      window.USING_MOCK_API = true;
      
      // Force the network manager to consider us online
      if (networkManager) {
        networkManager.lastSuccessfulConnection = Date.now();
        networkManager._handleOnlineStatus(true);
      }
      
      // Set initialized to true immediately in mock mode
      setTimeout(() => {
        setIsInitialized(true);
      }, 1000);
    }
  }, []);

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4287f5',
      },
      secondary: {
        main: '#ffffff',
      },
      background: {
        default: '#000000',
        paper: '#000000',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e0e0e0',
      }
    },
    typography: {
      fontFamily: 'Rajdhani, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: #000000;
            color: #ffffff;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }
          ::-webkit-scrollbar {
            width: 8px;
            background-color: #1a1a1a;
          }
          ::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background-color: #4287f5;
            min-height: 24px;
            box-shadow: 0 0 6px #4287f5;
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(66, 135, 245, 0.5)',
            boxShadow: '0 0 10px rgba(66, 135, 245, 0.5)',
            color: '#ffffff',
            '&:hover': {
              background: 'rgba(20, 20, 20, 0.9)',
              boxShadow: '0 0 15px rgba(66, 135, 245, 0.8)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backgroundImage: 'none',
            border: '1px solid rgba(66, 135, 245, 0.5)',
            boxShadow: '0 0 15px rgba(66, 135, 245, 0.5)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(66, 135, 245, 0.5)',
            boxShadow: '0 0 15px rgba(66, 135, 245, 0.5)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
          },
          h1: {
            textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
          },
          h2: {
            textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
          },
          h3: {
            textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
          },
        },
      },
    },
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Handle network alert close - used in the Alert component
  const handleNetworkAlertClose = () => {
    setShowNetworkAlert(false);
  };
  
  // Handle retry after network error
  const handleNetworkRetry = () => {
    setShowNetworkAlert(false);
    networkManager.checkServerConnection();
    
    // If user is logged in, retry getting user data
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  };
  
  // Show loading state while initializing or show error if initialization failed
  if (!isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          background: theme.palette.background.default
        }}>
          <img 
            src="/logo.png" 
            alt="Solo Leveling" 
            style={{ width: '150px', marginBottom: '20px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div style={{ color: theme.palette.text.primary, fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            SOLO LEVELING
          </div>
          <div style={{ color: theme.palette.text.secondary, fontSize: '16px' }}>
            Loading...
          </div>
          {networkError && (
            <div style={{ color: 'red', marginTop: 20, textAlign: 'center' }}>
              {networkError.userMessage || 'An error occurred.'}
              <br />
              <button onClick={() => window.location.reload()} style={{ marginTop: 10 }}>
                Retry
              </button>
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Show intro animation only after login */}
      {showIntro && <IntroAnimation onFinish={handleIntroFinish} />}
      
      {/* Only render the main content when intro is not showing */}
      <div style={{ visibility: showIntro ? 'hidden' : 'visible', height: '100%' }}>
        <NetworkErrorBoundary>
          <Router>
            <NotificationSystem />
            <NetworkStatusIndicator />
            <ErrorHandler />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={
              <Layout 
                darkMode={darkMode} 
                toggleDarkMode={toggleDarkMode}
              >
                <Outlet />
              </Layout>
            }>
              <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="quests" element={<PrivateRoute><QuestBoard /></PrivateRoute>} />
              <Route path="custom-quests" element={<PrivateRoute><CustomQuests /></PrivateRoute>} />
              <Route path="active-quests" element={<PrivateRoute><ActiveQuests /></PrivateRoute>} />
              <Route path="inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
              <Route path="shadows" element={<PrivateRoute><ShadowArmy /></PrivateRoute>} />
              <Route path="marketplace" element={<PrivateRoute><MarketplaceSimple /></PrivateRoute>} />
              <Route path="marketplace-test" element={<PrivateRoute><MarketplaceTest /></PrivateRoute>} />
              <Route path="marketplace-image-test" element={<PrivateRoute><MarketplaceImageTest /></PrivateRoute>} />
              <Route path="marketplace-original" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
              <Route path="skills" element={<PrivateRoute><Skills /></PrivateRoute>} />
              <Route path="titles" element={<PrivateRoute><Titles /></PrivateRoute>} />
              <Route path="verification" element={<VerificationPage />} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global network error alert */}
            <Alert 
              severity="error" 
              variant="filled"
              onClose={handleNetworkAlertClose}
              sx={{ 
                position: 'fixed', 
                top: '10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 1000, 
                display: showNetworkAlert ? 'block' : 'none' 
              }}
            >
              {networkError?.userMessage || 'Network connection error. Please check your internet connection.'}
              <Button color="inherit" size="small" onClick={handleNetworkRetry}>
                Retry
              </Button>
            </Alert>
          </Router>
        </NetworkErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
