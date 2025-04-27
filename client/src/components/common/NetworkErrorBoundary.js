import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import networkManager from '../../utils/networkManager';

/**
 * NetworkErrorBoundary component
 * Catches network errors in child components and displays a user-friendly error message
 * Provides retry functionality and fallback UI
 */
class NetworkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
      isOffline: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // In mock environment, don't show network errors
    if (window.USING_MOCK_API || 
        process.env.NODE_ENV === 'development' || 
        process.env.REACT_APP_USE_MOCK_API === 'true' || 
        window.location.hostname === 'localhost') {
      console.log('Mock environment: Bypassing network error boundary', error);
      // Return null to prevent the error boundary from catching the error
      return null;
    }
    
    // Check if this is a network error
    const isNetworkError = !error.response || 
      error.code === 'ECONNABORTED' || 
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch');
    
    // Check if we're offline
    const isOffline = !navigator.onLine;
    
    return { 
      hasError: true, 
      error, 
      isNetworkError,
      isOffline
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('NetworkErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Force a check of the server connection
    networkManager.checkServerConnection();
    
    // Call the onRetry prop if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, isNetworkError, isOffline } = this.state;

    // If there's no error, render children normally
    if (!hasError) {
      return children;
    }

    // If a custom fallback is provided, use it
    if (fallback) {
      return fallback(error, this.handleRetry);
    }

    // Default error UI based on error type
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          m: 2,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: isOffline ? '#FFF8E1' : '#FFF3F3',
          border: isOffline ? '1px solid #FFB74D' : '1px solid #EF9A9A'
        }}
      >
        <Box sx={{ mb: 2 }}>
          {isOffline ? (
            <WifiOffIcon sx={{ fontSize: 60, color: '#F57C00' }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 60, color: '#D32F2F' }} />
          )}
        </Box>
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isOffline 
            ? 'You are offline' 
            : (isNetworkError 
                ? 'Network Connection Error' 
                : 'Something went wrong')}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {isOffline 
            ? 'Please check your internet connection and try again.' 
            : (isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection or try again later.' 
                : error?.userMessage || 'An unexpected error occurred. Please try again.')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color={isOffline ? 'warning' : 'primary'} 
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
          >
            Try Again
          </Button>
          
          <Button 
            variant="outlined" 
            color={isOffline ? 'warning' : 'primary'} 
            onClick={this.handleReload}
          >
            Reload Page
          </Button>
        </Box>
        
        {this.props.debug && process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4, textAlign: 'left', fontSize: '12px', color: 'text.secondary' }}>
            <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>
              Debug Information:
            </Typography>
            <pre>
              {error?.stack || JSON.stringify(error, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    );
  }
}

export default NetworkErrorBoundary;
