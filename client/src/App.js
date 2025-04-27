import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Alert, Button } from '@mui/material';

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

// Redux
import { getCurrentUser } from './redux/slices/authSlice';

// Utils
import socketService from './utils/socketService';
import networkManager from './utils/networkManager';
import { initErrorFixes } from './utils/errorFixer';
import { applyAxiosMergePatch } from './utils/axiosMergePatch';
import { fixAxiosSliceError } from './utils/axiosSliceFix';

// Styles
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [networkError, setNetworkError] = useState(null);
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

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
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContextInitialized(true);
        console.log('Audio context initialized');
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
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Rajdhani, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: darkMode ? "#6b6b6b #2b2b2b" : "#959595 #f5f5f5",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: darkMode ? "#2b2b2b" : "#f5f5f5",
              width: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: darkMode ? "#6b6b6b" : "#959595",
              minHeight: 24,
            },
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

  // Initialize error fixer patch
  useEffect(() => {
    console.log('Initializing error fixer patch...');
    try {
      // Apply the general error fixes
      initErrorFixes();
      console.log('Error fixer patch initialized successfully');
      
      // Apply the specific Axios merge patch
      const axiosPatchResult = applyAxiosMergePatch();
      console.log('Axios merge patch applied:', axiosPatchResult ? 'Successfully' : 'Failed');
      
      // Apply direct fix for Axios slice error
      const sliceFixResult = fixAxiosSliceError();
      console.log('Direct Axios slice fix applied:', sliceFixResult ? 'Successfully' : 'Failed');
    } catch (err) {
      console.error('Failed to initialize error fixer patch:', err);
    }
  }, []);

  // Initialize network manager
  useEffect(() => {
    console.log('Initializing network manager...');
    try {
      networkManager.init();
      networkManager.checkServerConnection();
      console.log('Network manager initialized successfully');
    } catch (err) {
      console.error('Failed to initialize network manager:', err);
    }
  }, []);

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      if (localStorage.getItem('token')) {
        await dispatch(getCurrentUser()).unwrap();
      }
    } catch (error) {
      // Only show network errors at the app level
      if (!error.response || error.code === 'ECONNABORTED') {
        setNetworkError(error);
        setShowNetworkAlert(true);
      }
      
      // Clear invalid tokens
      if (error.message === 'No user logged in' || error.message === 'Invalid token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);

  // Setup network status listener
  useEffect(() => {
    const handleNetworkEvent = (event) => {
      // If there's a critical network error, show it at the app level
      if (event.type === 'error' && event.critical) {
        setNetworkError({
          message: event.error,
          userMessage: 'Network connection lost. Attempting to reconnect...'
        });
        setShowNetworkAlert(true);
      }
    };
    
    // Add listener to network manager
    const removeListener = networkManager.addListener(handleNetworkEvent);
    
    // Initial connection check
    networkManager.checkServerConnection();
    
    return () => removeListener();
  }, []);

  // Initialize socket connection if user is logged in
  useEffect(() => {
    if (user && user._id) {
      try {
        socketService.init(user._id);
        
        return () => {
          socketService.disconnect();
        };
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    }
  }, [user]);

  // Handle network alert close
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
  
  // Show loading state while initializing
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
              <Route path="marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
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
