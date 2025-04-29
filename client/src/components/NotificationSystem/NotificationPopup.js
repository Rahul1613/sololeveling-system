import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../redux/slices/notificationSlice';

// Material-UI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';

// Animation keyframes
// These animations were previously used with StyledAlert but now we're using HolographicCard
// Removed to fix unused variable warnings

// Styled components are defined here but we're using HolographicCard instead
// for consistency with the Solo Leveling theme

const NotificationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  marginBottom: '4px'
}));

const NotificationPopup = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications);
  const [currentNotification, setCurrentNotification] = useState(null);
  // The open state is not being used in the rendering, removing to fix warning

  useEffect(() => {
    // Process notifications queue
    if (notifications.length > 0 && !currentNotification) {
      const notification = notifications[0];
      setCurrentNotification(notification);
    }
  }, [notifications, currentNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    // Remove notification after animation completes
    setTimeout(() => {
      dispatch(removeNotification(currentNotification.id));
      setCurrentNotification(null);
    }, 300);
  };

  // Map notification types to Material-UI severity
  const getSeverity = (type) => {
    const severityMap = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
      levelup: 'levelup',
      quest: 'quest',
      achievement: 'success',
      rank: 'levelup'
    };
    
    return severityMap[type] || 'info';
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'achievement':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      case 'levelup':
      case 'rank':
        return <TrendingUpIcon />;
      case 'quest':
        return <DescriptionIcon />;
      default:
        return <InfoIcon />;
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Alert 
      onClose={handleClose} 
      severity={getSeverity(currentNotification.type)}
      icon={getIcon(currentNotification.type)}
    >
      <Box>
        {currentNotification.title && (
          <NotificationTitle>{currentNotification.title}</NotificationTitle>
        )}
        <Typography variant="body2">{currentNotification.message}</Typography>
      </Box>
    </Alert>
  );
};

export default NotificationPopup;
