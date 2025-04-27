import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../redux/slices/authSlice';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If we have a token but no user, try to get the current user
    if (isAuthenticated() && !user && !isLoading) {
      dispatch(getCurrentUser())
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [dispatch, user, isLoading]);

  // Show loading state while checking authentication
  if (isChecking || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated() && !user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
