import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import networkManager from '../../utils/networkManager';

/**
 * NetworkStatusIndicator component
 * Displays the current network status and server connection status
 * Shows alerts when the connection status changes
 */
const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(true); // Default to true
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  useEffect(() => {
    // Initialize server reachable state using the method
    try {
      setIsServerReachable(networkManager.isServerReachable());
    } catch (error) {
      console.error('Error checking server reachability:', error);
      // In development mode, always set to true
      if (isDevelopment) {
        setIsServerReachable(true);
      }
    }
    
    // Add network status listener
    const handleNetworkChange = (event) => {
      if (event.type === 'status') {
        setIsOnline(event.isOnline);
        
        // Only show alerts in production mode
        if (!isDevelopment) {
          // Show alert when network status changes
          if (event.isOnline) {
            setAlertMessage('You are back online. Reconnecting...');
            setAlertSeverity('success');
          } else {
            setAlertMessage('You are offline. Some features may be unavailable.');
            setAlertSeverity('warning');
          }
          setShowAlert(true);
        }
      } else if (event.type === 'server') {
        setIsServerReachable(event.isReachable);
        
        // Only show alerts in production mode
        if (!isDevelopment) {
          // Show alert when server status changes
          if (event.isReachable) {
            setAlertMessage('Connected to server.');
            setAlertSeverity('success');
          } else {
            setAlertMessage('Cannot connect to server. Trying alternative connections...');
            setAlertSeverity('error');
          }
          setShowAlert(true);
        }
      } else if (event.type === 'error' && !isDevelopment) {
        // Show alert for network errors (only in production)
        setAlertMessage(`Network error: ${event.error}`);
        setAlertSeverity('error');
        setShowAlert(true);
      }
    };
    
    // Add listener to network manager
    const removeListener = networkManager.addListener(handleNetworkChange);
    
    // Check connection status periodically (only in production)
    let checkInterval;
    if (!isDevelopment) {
      checkInterval = setInterval(() => {
        try {
          setIsServerReachable(networkManager.isServerReachable());
        } catch (error) {
          console.error('Error checking server reachability:', error);
        }
      }, 10000);
    }
    
    // Cleanup
    return () => {
      removeListener();
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isDevelopment]);
  
  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowAlert(false);
  };
  
  // In development mode, always show as online and connected
  if (isDevelopment) {
    return (
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(66, 135, 245, 0.5)',
          boxShadow: '0 0 5px rgba(66, 135, 245, 0.5)',
        }}
      >
        <WifiIcon sx={{ color: '#4287f5' }} />
        <Typography variant="caption" sx={{ color: '#ffffff' }}>
          Development Mode
        </Typography>
      </Box>
    );
  }
  
  return (
    <>
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: isOnline && isServerReachable 
            ? 'rgba(0, 0, 0, 0.5)' 
            : 'rgba(244, 67, 54, 0.1)',
          border: isOnline && isServerReachable 
            ? '1px solid rgba(66, 135, 245, 0.5)' 
            : '1px solid rgba(244, 67, 54, 0.5)',
          boxShadow: isOnline && isServerReachable 
            ? '0 0 5px rgba(66, 135, 245, 0.5)' 
            : '0 0 5px rgba(244, 67, 54, 0.5)',
        }}
      >
        {isOnline ? 
          <WifiIcon sx={{ color: isServerReachable ? '#4287f5' : '#f44336' }} /> : 
          <WifiOffIcon sx={{ color: '#f44336' }} />
        }
        <Typography variant="caption" sx={{ color: '#ffffff' }}>
          {isOnline && isServerReachable 
            ? 'Connected' 
            : isOnline 
              ? 'Server Unreachable' 
              : 'Offline'}
        </Typography>
      </Box>
      
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatusIndicator;
