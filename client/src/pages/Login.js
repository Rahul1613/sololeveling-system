import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, IconButton, InputAdornment, CircularProgress, Alert, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, demoLogin, reset } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    // Redirect if logged in
    if (isSuccess && user) {
      // Set flag for intro animation
      sessionStorage.setItem('justLoggedIn', 'true');
      navigate('/');
    } else if (user) {
      // User was already logged in (from localStorage), just redirect
      navigate('/');
    }
    
    // Reset auth state on component unmount
    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);
  
  // Clear error messages when user types
  useEffect(() => {
    if (isError) {
      dispatch(reset());
    }
  }, [formData, dispatch, isError]);
  
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      dispatch(login(userData));
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // Demo account login for easy testing
  const handleDemoLogin = () => {
    try {
      dispatch(demoLogin());
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
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
              Sign in to your account
            </Typography>
          </Box>
          
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleDemoLogin}
              disabled={isLoading}
              sx={{ mb: 2, py: 1.2, fontWeight: 'bold' }}
            >
              Try Demo Account
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#7B68EE', textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Forgot password?{' '}
                <Link to="/reset-password" style={{ color: '#7B68EE', textDecoration: 'none' }}>
                  Reset Password
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
