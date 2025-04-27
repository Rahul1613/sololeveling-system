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
  const [isServerReachable, setIsServerReachable] = useState(networkManager.isServerReachable());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  useEffect(() => {
    // Add network status listener
    const handleNetworkChange = (event) => {
      if (event.type === 'status') {
        setIsOnline(event.isOnline);
        
        // Show alert when network status changes
        if (event.isOnline) {
          setAlertMessage('You are back online. Reconnecting...');
          setAlertSeverity('success');
        } else {
          setAlertMessage('You are offline. Some features may be unavailable.');
          setAlertSeverity('warning');
        }
        setShowAlert(true);
      } else if (event.type === 'server') {
        setIsServerReachable(event.isReachable);
        
        // Show alert when server status changes
        if (event.isReachable) {
          setAlertMessage('Connected to server.');
          setAlertSeverity('success');
        } else {
          setAlertMessage('Cannot connect to server. Trying alternative connections...');
          setAlertSeverity('error');
        }
        setShowAlert(true);
      } else if (event.type === 'error') {
        // Show alert for network errors
        setAlertMessage(`Network error: ${event.error}`);
        setAlertSeverity('error');
        setShowAlert(true);
      }
    };
    
    // Add listener to network manager
    const removeListener = networkManager.addListener(handleNetworkChange);
    
    // Check connection status periodically
    const checkInterval = setInterval(() => {
      setIsServerReachable(networkManager.isServerReachable());
    }, 10000);
    
    // Initial connection check
    networkManager.checkServerConnection();
    
    // Cleanup
    return () => {
      removeListener();
      clearInterval(checkInterval);
    };
  }, []);
  
  // Handle alert close
  const handleAlertClose = () => {
    setShowAlert(false);
  };
  
  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: isOnline && isServerReachable 
            ? 'rgba(46, 125, 50, 0.1)' 
            : 'rgba(211, 47, 47, 0.1)',
          color: isOnline && isServerReachable ? 'success.main' : 'error.main',
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        {isOnline ? (
          isServerReachable ? (
            <WifiIcon fontSize="small" color="success" />
          ) : (
            <WifiIcon fontSize="small" color="warning" />
          )
        ) : (
          <WifiOffIcon fontSize="small" color="error" />
        )}
        <Typography 
          variant="caption" 
          sx={{ ml: 1, fontWeight: 'medium' }}
        >
          {isOnline 
            ? (isServerReachable ? 'Connected' : 'Server Unreachable') 
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
