import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { GoogleIcon, FacebookFIcon } from '../icons';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import axios from 'axios';
import { login } from '../../redux/slices/authSlice';
import { setUser } from '../../redux/slices/userSlice';
import './SocialLogin.css';

const SocialLogin = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    google: false,
    facebook: false
  });
  
  // Google login success handler
  const handleGoogleSuccess = async (response) => {
    try {
      setLoading({ ...loading, google: true });
      setError(null);
      
      const { tokenId } = response;
      
      // Send token to backend for verification
      const result = await axios.post('/api/oauth/google', { tokenId });
      
      // Store token and user data
      dispatch(login(result.data.token));
      dispatch(setUser(result.data.user));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.response?.data?.message || 'Failed to login with Google');
    } finally {
      setLoading({ ...loading, google: false });
    }
  };
  
  // Google login failure handler
  const handleGoogleFailure = (error) => {
    console.error('Google login failure:', error);
    if (error.error !== 'popup_closed_by_user') {
      setError('Failed to login with Google. Please try again.');
    }
  };
  
  // Facebook login handler
  const handleFacebookLogin = async (response) => {
    try {
      // Check if user closed the popup without authenticating
      if (!response.accessToken) return;
      
      setLoading({ ...loading, facebook: true });
      setError(null);
      
      const { accessToken, userID } = response;
      
      // Send token to backend for verification
      const result = await axios.post('/api/oauth/facebook', { accessToken, userID });
      
      // Store token and user data
      dispatch(login(result.data.token));
      dispatch(setUser(result.data.user));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      setError(error.response?.data?.message || 'Failed to login with Facebook');
    } finally {
      setLoading({ ...loading, facebook: false });
    }
  };
  
  return (
    <div className="social-login-container">
      <div className="social-login-divider">
        <span>OR</span>
      </div>
      
      <div className="social-buttons">
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          render={renderProps => (
            <Button 
              variant="outline-light" 
              className="google-btn social-btn"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled || loading.google}
            >
              <GoogleIcon className="me-2" />
              {loading.google ? 'Connecting...' : 'Continue with Google'}
            </Button>
          )}
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
          cookiePolicy={'single_host_origin'}
        />
        
        <FacebookLogin
          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
          callback={handleFacebookLogin}
          fields="name,email,picture"
          render={renderProps => (
            <Button 
              variant="outline-light" 
              className="facebook-btn social-btn"
              onClick={renderProps.onClick}
              disabled={loading.facebook}
            >
              <FacebookFIcon className="me-2" />
              {loading.facebook ? 'Connecting...' : 'Continue with Facebook'}
            </Button>
          )}
        />
      </div>
      
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      
      <div className="social-login-note">
        <small>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </small>
      </div>
    </div>
  );
};

export default SocialLogin;
