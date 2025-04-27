import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Tooltip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import RefreshIcon from '@mui/icons-material/Refresh';
import networkManager from '../../utils/networkManager';

/**
 * ConnectionStatus component
 * Shows the current connection status in a Solo Leveling themed UI
 */
const ConnectionStatus = ({ variant = 'chip', showDetails = false }) => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isServerReachable: networkManager.isServerReachable(),
    serverUrl: networkManager.getApiUrl(),
    lastChecked: Date.now(),
    checking: false
  });

  useEffect(() => {
    const handleNetworkEvent = (event) => {
      if (event.type === 'status') {
        setStatus(prev => ({
          ...prev,
          isOnline: event.isOnline,
          lastChecked: Date.now()
        }));
      } else if (event.type === 'server') {
        setStatus(prev => ({
          ...prev,
          isServerReachable: event.isReachable,
          serverUrl: networkManager.getApiUrl(),
          lastChecked: Date.now(),
          checking: false
        }));
      }
    };

    // Add listener to network manager
    const removeListener = networkManager.addListener(handleNetworkEvent);
    
    // Check connection status periodically
    const checkInterval = setInterval(() => {
      setStatus(prev => ({ ...prev, checking: true }));
      networkManager.checkServerConnection().then(() => {
        setStatus(prev => ({ 
          ...prev, 
          isServerReachable: networkManager.isServerReachable(),
          serverUrl: networkManager.getApiUrl(),
          lastChecked: Date.now(),
          checking: false
        }));
      });
    }, 30000); // Check every 30 seconds
    
    // Initial check
    setStatus(prev => ({ ...prev, checking: true }));
    networkManager.checkServerConnection().then(() => {
      setStatus(prev => ({ 
        ...prev, 
        isServerReachable: networkManager.isServerReachable(),
        serverUrl: networkManager.getApiUrl(),
        lastChecked: Date.now(),
        checking: false
      }));
    });
    
    // Cleanup
    return () => {
      removeListener();
      clearInterval(checkInterval);
    };
  }, []);
  
  const handleRefresh = () => {
    setStatus(prev => ({ ...prev, checking: true }));
    networkManager.checkServerConnection().then(() => {
      setStatus(prev => ({ 
        ...prev, 
        isServerReachable: networkManager.isServerReachable(),
        serverUrl: networkManager.getApiUrl(),
        lastChecked: Date.now(),
        checking: false
      }));
    });
  };
  
  // Get status text and color
  const getStatusInfo = () => {
    if (!status.isOnline) {
      return {
        text: 'Offline',
        color: 'error',
        icon: <WifiOffIcon fontSize="small" />,
        tooltip: 'Your device is offline. Please check your internet connection.'
      };
    } else if (!status.isServerReachable) {
      return {
        text: 'Server Unreachable',
        color: 'warning',
        icon: <SignalWifiStatusbarConnectedNoInternet4Icon fontSize="small" />,
        tooltip: 'Cannot connect to the server. The server may be down or your connection may be limited.'
      };
    } else {
      return {
        text: 'Connected',
        color: 'success',
        icon: <WifiIcon fontSize="small" />,
        tooltip: 'Connected to the server.'
      };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Render as chip (minimal)
  if (variant === 'chip') {
    return (
      <Tooltip title={statusInfo.tooltip}>
        <Chip
          icon={status.checking ? <CircularProgress size={16} color="inherit" /> : statusInfo.icon}
          label={statusInfo.text}
          color={statusInfo.color}
          size="small"
          onClick={handleRefresh}
          sx={{ 
            fontWeight: 'medium',
            borderWidth: 2,
            '&:hover': {
              opacity: 0.8
            }
          }}
        />
      </Tooltip>
    );
  }
  
  // Render as box (detailed)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        borderRadius: 1,
        bgcolor: `${statusInfo.color}.dark`,
        color: 'white',
        boxShadow: 2,
        minWidth: showDetails ? 200 : 'auto'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {status.checking ? (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          ) : (
            statusInfo.icon
          )}
          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
            {statusInfo.text}
          </Typography>
        </Box>
        <Tooltip title="Refresh connection status">
          <RefreshIcon 
            fontSize="small" 
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            onClick={handleRefresh}
          />
        </Tooltip>
      </Box>
      
      {showDetails && (
        <Box sx={{ mt: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption" component="div">
            Server: {new URL(status.serverUrl).hostname}
          </Typography>
          <Typography variant="caption" component="div">
            Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConnectionStatus;
