import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { connect } from 'react-redux';

// Styled components
const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  background: 'rgba(10, 25, 41, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 99, 71, 0.5)',
  boxShadow: '0 0 15px rgba(255, 99, 71, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, rgba(255,99,71,0.8) 0%, rgba(255,99,71,0.2) 100%)',
  }
}));

const ErrorTitle = styled(Typography)(({ theme }) => ({
  color: '#FF6347',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  textShadow: '0 0 10px rgba(255, 99, 71, 0.3)',
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: '#eaf6ff',
  marginBottom: theme.spacing(3),
}));

const RetryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 99, 71, 0.2)',
  border: '1px solid rgba(255, 99, 71, 0.5)',
  color: '#FF6347',
  '&:hover': {
    background: 'rgba(255, 99, 71, 0.3)',
  }
}));

/**
 * ErrorBoundary component for handling errors in the application
 * This includes server connection issues and data loading errors
 */
class ErrorBoundary extends Component {
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
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  // Check if the error is related to network connectivity
  isNetworkError() {
    const { error } = this.state;
    return (
      error && (
        error.message?.includes('network') ||
        error.message?.includes('fetch') ||
        error.message?.includes('connection') ||
        error.message?.includes('unreachable') ||
        error.message?.includes('timeout')
      )
    );
  }

  // Check if the error is related to data loading
  isDataError() {
    const { error } = this.state;
    return (
      error && (
        error.message?.includes('data') ||
        error.message?.includes('loading') ||
        error.message?.includes('inventory') ||
        error.message?.includes('items')
      )
    );
  }

  // Get appropriate error message based on error type
  getErrorMessage() {
    if (this.isNetworkError()) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    } else if (this.isDataError()) {
      return "There was a problem loading your data. This might be due to server maintenance or connectivity issues.";
    } else {
      return "Something went wrong. We're working on fixing the issue.";
    }
  }

  // Get appropriate error title based on error type
  getErrorTitle() {
    if (this.isNetworkError()) {
      return "Server Unreachable";
    } else if (this.isDataError()) {
      return "Error Loading Data";
    } else {
      return "Unexpected Error";
    }
  }

  // Handle retry button click
  handleRetry = () => {
    // Reset error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Reload the page to retry
    window.location.reload();
  }

  render() {
    // Check if we have a custom error from props (for non-crash errors)
    const { customError } = this.props;
    const hasCustomError = !!customError;
    
    // If there's no error, render children normally
    if (!this.state.hasError && !hasCustomError) {
      return this.props.children;
    }

    // Get error details (either from state or props)
    const errorTitle = hasCustomError ? customError.title : this.getErrorTitle();
    const errorMessage = hasCustomError ? customError.message : this.getErrorMessage();

    // Render fallback UI
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <ErrorContainer>
          <ErrorTitle variant="h4">
            {errorTitle}
          </ErrorTitle>
          <ErrorMessage variant="body1">
            {errorMessage}
          </ErrorMessage>
          <RetryButton 
            variant="outlined" 
            onClick={this.handleRetry}
          >
            Retry
          </RetryButton>
        </ErrorContainer>
      </Box>
    );
  }
}

// Connect to Redux to access network status
const mapStateToProps = (state) => ({
  isOnline: state.network ? state.network.isOnline : true,
});

export default connect(mapStateToProps)(ErrorBoundary);
