import React, { useState } from 'react';
import { Container, Box, Typography, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import VerificationDashboard from '../components/verification/VerificationDashboard';
import VerificationReviewPanel from '../components/admin/VerificationReviewPanel';
import { useSelector } from 'react-redux';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: 3
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    minWidth: 100,
    transition: 'all 0.3s ease',
    '&.Mui-selected': {
      color: theme.palette.primary.main
    }
  }
}));

const VerificationPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useSelector(state => state.auth);
  const isAdmin = user && user.role === 'admin';

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Verification Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          View your verification submissions and their status
        </Typography>
      </Box>

      <StyledTabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="My Verifications" />
        {isAdmin && <Tab label="Admin Review Panel" />}
      </StyledTabs>

      {tabValue === 0 && (
        <VerificationDashboard />
      )}

      {tabValue === 1 && isAdmin && (
        <VerificationReviewPanel />
      )}
    </Container>
  );
};

export default VerificationPage;
