import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(123, 104, 238, 0.5); }
  50% { box-shadow: 0 0 20px rgba(123, 104, 238, 0.8); }
  100% { box-shadow: 0 0 5px rgba(123, 104, 238, 0.5); }
`;

const slideInAnimation = keyframes`
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

// Styled components
const StyledAlert = styled(Alert)(({ theme, severity }) => {
  // Define colors for different notification types
  const colors = {
    success: {
      background: 'rgba(76, 175, 80, 0.2)',
      border: '1px solid rgba(76, 175, 80, 0.5)',
      color: '#4CAF50'
    },
    error: {
      background: 'rgba(244, 67, 54, 0.2)',
      border: '1px solid rgba(244, 67, 54, 0.5)',
      color: '#F44336'
    },
    warning: {
      background: 'rgba(255, 152, 0, 0.2)',
      border: '1px solid rgba(255, 152, 0, 0.5)',
      color: '#FF9800'
    },
    info: {
      background: 'rgba(33, 150, 243, 0.2)',
      border: '1px solid rgba(33, 150, 243, 0.5)',
      color: '#2196F3'
    },
    levelup: {
      background: 'rgba(123, 104, 238, 0.2)',
      border: '1px solid rgba(123, 104, 238, 0.5)',
      color: '#7B68EE'
    },
    quest: {
      background: 'rgba(156, 39, 176, 0.2)',
      border: '1px solid rgba(156, 39, 176, 0.5)',
      color: '#9C27B0'
    }
  };

  const color = colors[severity] || colors.info;

  return {
    backdropFilter: 'blur(10px)',
    backgroundColor: color.background,
    border: color.border,
    color: color.color,
    borderRadius: '12px',
    padding: '16px 24px',
    animation: `${glowAnimation} 2s infinite ease-in-out, ${slideInAnimation} 0.3s ease-out`,
    '& .MuiAlert-icon': {
      color: color.color
    },
    '& .MuiAlert-message': {
      padding: '8px 0'
    }
  };
});

const NotificationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  marginBottom: '4px'
}));

const NotificationPopup = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Process notifications queue
    if (notifications.length > 0 && !currentNotification) {
      const notification = notifications[0];
      setCurrentNotification(notification);
      setOpen(true);
    }
  }, [notifications, currentNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setOpen(false);
    
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
