import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, verifyOtp, resetPassword } from '../redux/slices/authSlice';

const PasswordReset = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isError, isSuccess, message: reduxMessage } = useSelector(
    (state) => state.auth
  );
  
  const steps = ['Enter Email', 'Verify OTP', 'Set New Password'];
  
  // Effect to handle state changes based on Redux state
  useEffect(() => {
    if (isError) {
      setMessage('');
    }
    
    if (isSuccess && activeStep === 0) {
      setMessage('OTP sent to your email. Please check your inbox.');
      setActiveStep(1);
    }
    
    if (isSuccess && activeStep === 1) {
      setMessage('OTP verified successfully. Set your new password.');
      setActiveStep(2);
    }
    
    if (isSuccess && activeStep === 2) {
      setSuccess(true);
      setMessage('Password reset successfully. You can now login with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [isError, isSuccess, activeStep, navigate, reduxMessage]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    // Dispatch request password reset action
    dispatch(requestPasswordReset(email));
  };
  
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Dispatch verify OTP action
    dispatch(verifyOtp({ email, otp }));
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    // Dispatch reset password action
    dispatch(resetPassword({ email, otp, newPassword }));
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.2,
                fontWeight: 'bold',
                position: 'relative',
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Request OTP'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleOtpSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter 6-digit OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.2,
                fontWeight: 'bold',
                position: 'relative',
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              sx={{ mt: 1 }}
            >
              Back to Email
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.2,
                fontWeight: 'bold',
                position: 'relative',
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(1)}
              sx={{ mt: 1 }}
            >
              Back to OTP Verification
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            background: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              SOLO LEVELING
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Reset Password
            </Typography>
          </Box>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reduxMessage}
            </Alert>
          )}
          
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset successfully! Redirecting to login page...
            </Alert>
          ) : (
            renderStepContent()
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#7B68EE', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordReset;
