import React from 'react';
import { Box, Grid, Typography, LinearProgress, Divider, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import HolographicCard from './HolographicCard';

// Styled components
const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  fontWeight: 600,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.1rem',
  fontWeight: 700,
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme, color }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: color ? color : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}));

const RankBadge = styled(Box)(({ theme, rank, isMobile }) => {
  // Define colors for different ranks
  const rankColors = {
    'E': '#9E9E9E', // Gray
    'D': '#4CAF50', // Green
    'C': '#2196F3', // Blue
    'B': '#9C27B0', // Purple
    'A': '#FF9800', // Orange
    'S': '#F44336', // Red
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '30px' : '36px',
    height: isMobile ? '30px' : '36px',
    borderRadius: '50%',
    backgroundColor: rankColors[rank] || theme.palette.primary.main,
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: isMobile ? '1rem' : '1.2rem',
    boxShadow: `0 0 10px ${rankColors[rank] || theme.palette.primary.main}`,
  };
});

// Status Window Component
const StatusWindow = ({ user, expPercentage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!user) return null;

  // Ensure we have valid stats with fallbacks
  const stats = user.stats || {
    strength: 10,
    agility: 10,
    intelligence: 10,
    endurance: 10,
    luck: 10
  };

  // Calculate health and mana percentages
  const calculateHealthPercentage = () => {
    try {
      if (!user || !user.hp) return 0;
      return user.hp.current / Math.max(user.hp.max, 1) * 100;
    } catch (error) {
      console.error('Error calculating health percentage:', error);
      return 0;
    }
  };

  const calculateManaPercentage = () => {
    try {
      if (!user || !user.mp) return 0;
      return user.mp.current / Math.max(user.mp.max, 1) * 100;
    } catch (error) {
      console.error('Error calculating mana percentage:', error);
      return 0;
    }
  };

  return (
    <HolographicCard title="Status Window" height="auto">
      <Box sx={{ p: isMobile ? 0.5 : 1 }}>
        {/* Header with name, level and rank */}
        <Grid container alignItems="center" spacing={isMobile ? 1 : 2} sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Grid item>
            <RankBadge rank={user.rank || 'E'} isMobile={isMobile}>{user.rank || 'E'}</RankBadge>
          </Grid>
          <Grid item xs>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              {user.username || 'Hunter'}
            </Typography>
            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ color: 'text.secondary' }}>
              Level {user.level || 1}
            </Typography>
          </Grid>
        </Grid>

        {/* Experience bar */}
        <Box sx={{ mb: 3 }}>
          <Grid container justifyContent="space-between" sx={{ mb: 0.5 }}>
            <StatLabel>Experience</StatLabel>
            <StatValue>{user.experience || 0} / {user.experienceToNextLevel || 100}</StatValue>
          </Grid>
          <StyledLinearProgress 
            variant="determinate" 
            value={expPercentage || 0} 
            color="linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)"
          />
        </Box>

        {/* HP and MP bars */}
        <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
              HP: {user && user.hp ? `${user.hp.current}/${user.hp.max}` : '0/0'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={calculateHealthPercentage()}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#ff0000',
                },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
              MP: {user && user.mp ? `${user.mp.current}/${user.mp.max}` : '0/0'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={calculateManaPercentage()}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#0000ff',
                },
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: isMobile ? 1.5 : 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Stats */}
        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: isMobile ? 1.5 : 2, fontWeight: 600 }}>Stats</Typography>
        <Grid container spacing={isMobile ? 1 : 2}>
          {Object.entries(stats).map(([stat, value]) => (
            <Grid item xs={6} key={stat}>
              <Grid container justifyContent="space-between">
                <StatLabel sx={{ textTransform: 'capitalize' }}>{stat}</StatLabel>
                <StatValue>{value}</StatValue>
              </Grid>
              <StyledLinearProgress 
                variant="determinate" 
                value={Math.min((value / 100) * 100, 100)} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Available stat points */}
        {(user.statPoints > 0) && (
          <Box sx={{ 
            mt: 2, 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.5)'
          }}>
            <Typography sx={{ color: '#4CAF50', fontWeight: 600 }}>
              {user.statPoints} stat points available to allocate
            </Typography>
          </Box>
        )}

        {/* Currency */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography sx={{ 
            color: '#FFD700', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <span style={{ fontSize: '1.5rem' }}>⦿</span> {user.currency || 0}
          </Typography>
        </Box>
      </Box>
    </HolographicCard>
  );
};

export default StatusWindow;
