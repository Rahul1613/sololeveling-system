import React from 'react';
import { IconComponent } from '../../utils/iconMapper';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import NotificationsIcon from '@mui/icons-material/Notifications';

/**
 * NotificationToast component
 * Displays a toast notification with an icon, title, and message
 */
const NotificationToast = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  autoHideDuration = 6000,
  open = true
}) => {
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  // Get the appropriate color based on notification type
  const getColor = () => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'info':
      default:
        return 'info.main';
    }
  };

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          p: 2,
          mb: 2,
          borderLeft: 4,
          borderColor: getColor(),
          backgroundColor: 'background.paper',
          maxWidth: 400,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px',
            opacity: 0.1,
            zIndex: 0
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            color: getColor()
          }}
        >
          {getIcon()}
        </Box>
        <Box sx={{ flexGrow: 1, zIndex: 1 }}>
          {title && (
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom={!!message}>
              {title}
            </Typography>
          )}
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          aria-label="close"
          onClick={onClose}
          sx={{ ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Slide>
  );
};

export default NotificationToast;
