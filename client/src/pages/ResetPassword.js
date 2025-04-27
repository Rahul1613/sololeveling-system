import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, verifyOtp, resetPassword, reset } from '../redux/slices/authSlice';

const steps = ['Request Reset', 'Verify Code', 'Reset Password'];

const ResetPassword = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess, isError, message } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Clear any previous messages
    dispatch(reset());
    
    // If OTP verification is successful, move to reset password step
    if (isSuccess && activeStep === 1) {
      setActiveStep(2);
      dispatch(reset());
    }
    
    // If password reset is successful, redirect to login after a delay
    if (isSuccess && activeStep === 2) {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    // If there's an error, display it
    if (isError) {
      setError(message);
    }
  }, [isSuccess, isError, message, activeStep, dispatch, navigate]);
  
  const handleRequestReset = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    console.log('Requesting password reset for email:', email);
    dispatch(requestPasswordReset(email));
    
    // Move to next step automatically on success is handled by useEffect
  };
  
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Verification code is required');
      return;
    }
    
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      setError('Verification code must be 6 digits');
      return;
    }
    
    console.log('Verifying OTP:', otp, 'for email:', email);
    dispatch(verifyOtp({ email, otp }));
    
    // Move to next step automatically on success is handled by useEffect
  };
  
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    console.log('Resetting password for email:', email);
    dispatch(resetPassword({ email, otp, newPassword: password }));
    
    // Redirect to login on success is handled by useEffect
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestReset} sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter your email address to receive a one-time password (OTP).
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ py: 1.2, fontWeight: 'bold' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the 6-digit verification code sent to {email}.
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ py: 1.2, fontWeight: 'bold' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={() => {
                setActiveStep(0);
                dispatch(reset());
              }}
              sx={{ mt: 1 }}
            >
              Back to Email
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Create a new password for your account.
            </Typography>
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ py: 1.2, fontWeight: 'bold' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
            Reset Password
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || message}
            </Alert>
          )}
          
          {isSuccess && activeStep === 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Verification code sent! Check your email and enter the code below.
            </Alert>
          )}
          
          {isSuccess && activeStep === 2 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset successful! Redirecting to login...
            </Alert>
          )}
          
          {getStepContent(activeStep)}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
