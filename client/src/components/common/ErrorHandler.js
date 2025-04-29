import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { clearErrors } from '../../redux/slices/errorSlice';
import errorHandler from '../../utils/errorHandler';

/**
 * Global Error Handler Component
 * Displays error messages from Redux store and handles error clearing
 */
const ErrorHandler = () => {
  const dispatch = useDispatch();
  const { 
    auth: { isError: authError, message: authMessage },
    user: { isError: userError, message: userMessage },
    quests: { isError: questError, message: questMessage },
    shadows: { isError: shadowError, message: shadowMessage },
    inventory: { isError: inventoryError, message: inventoryMessage },
    skills: { isError: skillError, message: skillMessage },
    titles: { isError: titleError, message: titleMessage }
  } = useSelector(state => state);

  // Determine if there's an error to show
  const hasError = authError || userError || questError || shadowError || 
                  inventoryError || skillError || titleError;
  
  // Get the first error message to display
  const getErrorMessage = () => {
    if (authError && authMessage) return errorHandler.formatErrorMessage(authMessage);
    if (userError && userMessage) return errorHandler.formatErrorMessage(userMessage);
    if (questError && questMessage) return errorHandler.formatErrorMessage(questMessage);
    if (shadowError && shadowMessage) return errorHandler.formatErrorMessage(shadowMessage);
    if (inventoryError && inventoryMessage) return errorHandler.formatErrorMessage(inventoryMessage);
    if (skillError && skillMessage) return errorHandler.formatErrorMessage(skillMessage);
    if (titleError && titleMessage) return errorHandler.formatErrorMessage(titleMessage);
    return 'An error occurred';
  };

  // Handle closing the error message
  const handleClose = () => {
    dispatch(clearErrors());
  };

  return (
    <Snackbar
      open={hasError}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity="error" 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {getErrorMessage()}
      </Alert>
    </Snackbar>
  );
};

export default ErrorHandler;
