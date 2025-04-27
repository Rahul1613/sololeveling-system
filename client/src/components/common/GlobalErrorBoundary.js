import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service here
  }

  handleReload = () => {
    // Clear local storage if it might be causing issues
    // localStorage.clear();
    
    // Reload the page
    window.location.reload();
  }

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: '#121212',
            color: 'white',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              bgcolor: 'rgba(30, 30, 30, 0.9)',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: '#F44336', mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              The application encountered an unexpected error. This could be due to a temporary issue.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </Box>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ textAlign: 'left', mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(0, 0, 0, 0.5)', 
                    overflowX: 'auto',
                    color: '#F44336'
                  }}
                >
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
