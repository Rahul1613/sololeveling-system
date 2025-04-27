import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        background: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '5rem', md: '8rem' },
          fontWeight: 'bold',
          color: 'primary.main',
          textShadow: '0 0 10px rgba(123, 104, 238, 0.7)',
          mb: 2,
        }}
      >
        404
      </Typography>
      
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mb: 2,
          textShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
        }}
      >
        Quest Not Found
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          maxWidth: 500,
          mb: 4,
          color: 'text.secondary',
        }}
      >
        The dungeon you're looking for doesn't exist or has already been cleared.
        Return to the main gate to continue your journey.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: 2,
          fontWeight: 'bold',
        }}
      >
        Return to Gate
      </Button>
    </Box>
  );
};

export default NotFound;
