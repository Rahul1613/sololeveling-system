import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import userService from '../../api/userService';
import { useSelector } from 'react-redux';
import HolographicCard from '../HolographicUI/HolographicCard';

// Styled components
const RankCell = styled(TableCell)(({ theme, rank }) => {
  // Define colors for different ranks
  const rankColors = {
    'S': '#F44336', // Red
    'A': '#FF9800', // Orange
    'B': '#9C27B0', // Purple
    'C': '#2196F3', // Blue
    'D': '#4CAF50', // Green
    'E': '#9E9E9E', // Gray
    'F': '#795548', // Brown
  };

  return {
    color: rankColors[rank] || theme.palette.text.primary,
    fontWeight: 700,
    fontSize: '1.2rem',
    textShadow: `0 0 10px ${rankColors[rank] || theme.palette.primary.main}`,
  };
});

const StyledTableRow = styled(TableRow)(({ theme, iscurrentuser }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: iscurrentuser === 'true' 
      ? 'rgba(123, 104, 238, 0.15)' 
      : 'rgba(255, 255, 255, 0.05)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: iscurrentuser === 'true' 
      ? 'rgba(123, 104, 238, 0.15)' 
      : 'rgba(255, 255, 255, 0.02)',
  },
  '&:hover': {
    backgroundColor: 'rgba(123, 104, 238, 0.1)',
  },
  // highlight current user
  ...(iscurrentuser === 'true' && {
    border: '1px solid rgba(123, 104, 238, 0.5)',
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      backgroundColor: theme.palette.primary.main,
    },
  }),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  border: '2px solid rgba(123, 104, 238, 0.5)',
  boxShadow: '0 0 10px rgba(123, 104, 238, 0.3)',
}));

const GlobalRanking = () => {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user from Redux store
  const { user } = useSelector(state => state.auth);
  const currentUserId = user?._id;

  // Fetch rankings data
  const fetchRankings = async () => {
    try {
      setLoading(true);
      const data = await userService.getRankings();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Rankings data is not an array:', data);
        setRankings([]);
        setError('Invalid rankings data received. Please try again later.');
        return;
      }
      
      setRankings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setRankings([]);
      setError('Failed to load rankings. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRankings();
    
    // Poll for updates every 5 minutes
    const interval = setInterval(fetchRankings, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  // Filter rankings based on selected tab
  const getFilteredRankings = () => {
    if (!rankings || !Array.isArray(rankings)) {
      return [];
    }
    
    try {
      // Filter out any users without a username (ensures only real users are shown)
      const validRankings = rankings.filter(user => user.username && user.username.trim() !== '');
      
      switch (tabValue) {
        case 0: // All
          return validRankings;
        case 1: // S Rank
          return validRankings.filter(user => user.rank === 'S');
        case 2: // A Rank
          return validRankings.filter(user => user.rank === 'A');
        case 3: // B Rank
          return validRankings.filter(user => user.rank === 'B');
        case 4: // C Rank
          return validRankings.filter(user => user.rank === 'C');
        case 5: // D Rank
          return validRankings.filter(user => user.rank === 'D');
        case 6: // E Rank
          return validRankings.filter(user => user.rank === 'E');
        case 7: // F Rank
          return validRankings.filter(user => user.rank === 'F');
        default:
          return validRankings;
      }
    } catch (error) {
      console.error('Error filtering rankings:', error);
      return [];
    }
  };

  // Get user's rank in the leaderboard
  const getCurrentUserRank = () => {
    if (!rankings || !Array.isArray(rankings) || !currentUserId) {
      return 'N/A';
    }
    
    try {
      const userIndex = rankings.findIndex(u => u._id === currentUserId);
      return userIndex !== -1 ? userIndex + 1 : 'N/A';
    } catch (error) {
      console.error('Error getting current user rank:', error);
      return 'N/A';
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank) => {
    try {
      switch (rank) {
        case 'S':
          return { bg: 'rgba(244, 67, 54, 0.2)', color: '#F44336' };
        case 'A':
          return { bg: 'rgba(255, 152, 0, 0.2)', color: '#FF9800' };
        case 'B':
          return { bg: 'rgba(156, 39, 176, 0.2)', color: '#9C27B0' };
        case 'C':
          return { bg: 'rgba(33, 150, 243, 0.2)', color: '#2196F3' };
        case 'D':
          return { bg: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50' };
        case 'E':
          return { bg: 'rgba(158, 158, 158, 0.2)', color: '#9E9E9E' };
        case 'F':
          return { bg: 'rgba(121, 85, 72, 0.2)', color: '#795548' };
        default:
          return { bg: 'rgba(158, 158, 158, 0.2)', color: '#9E9E9E' };
      }
    } catch (error) {
      console.error('Error getting rank badge color:', error);
      return { bg: 'rgba(158, 158, 158, 0.2)', color: '#9E9E9E' };
    }
  };

  // Render component with error handling
  try {
    return (
      <HolographicCard title="Global Rankings" height="auto">
        {loading && !refreshing ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Button 
              variant="contained" 
              onClick={handleRefresh} 
              startIcon={<RefreshIcon />}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  <Tab label="All" />
                  <Tab label="S Rank" />
                  <Tab label="A Rank" />
                  <Tab label="B Rank" />
                  <Tab label="C Rank" />
                  <Tab label="D Rank" />
                  <Tab label="E Rank" />
                </Tabs>
                
                <Tooltip title="Refresh Rankings">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    sx={{ mr: 1 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* User's current rank */}
            {currentUserId && (
              <Box 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(123, 104, 238, 0.3)',
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(45deg, rgba(123, 104, 238, 0.05) 25%, transparent 25%, transparent 50%, rgba(123, 104, 238, 0.05) 50%, rgba(123, 104, 238, 0.05) 75%, transparent 75%, transparent)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3
                  }} 
                />
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Your current rank:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      #{getCurrentUserRank()} Worldwide
                    </Typography>
                  </Box>
                  
                  {user && (
                    <Chip 
                      label={`Rank ${user.rank || 'E'}`} 
                      sx={{ 
                        bgcolor: getRankBadgeColor(user.rank || 'E').bg,
                        color: getRankBadgeColor(user.rank || 'E').color,
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 2,
                        px: 1
                      }} 
                    />
                  )}
                </Box>
              </Box>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%">#</TableCell>
                    <TableCell width="40%">Hunter</TableCell>
                    <TableCell width="15%" align="center">Rank</TableCell>
                    <TableCell width="15%" align="center">Level</TableCell>
                    <TableCell width="20%" align="right">Experience</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredRankings().map((user, index) => (
                    <StyledTableRow 
                      key={user._id || `user-${index}`} 
                      iscurrentuser={(user._id === currentUserId).toString()}
                    >
                      <StyledTableCell>{user.position || index + 1}</StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <StyledAvatar src={user.profilePicture} alt={user.username || 'Hunter'}>
                            {(user.username || 'H').charAt(0).toUpperCase()}
                          </StyledAvatar>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {user.username || 'Unknown Hunter'}
                            {user._id === currentUserId && (
                              <Typography component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'primary.main' }}>
                                (You)
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <RankCell align="center" rank={user.rank || 'E'}>
                        {user.rank || 'E'}
                      </RankCell>
                      <StyledTableCell align="center">
                        <Chip 
                          label={`Lv. ${user.level || 1}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(123, 104, 238, 0.2)',
                            color: 'primary.main',
                            fontWeight: 600
                          }} 
                        />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {(user.experience || 0).toLocaleString()}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  
                  {getFilteredRankings().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          {error || 'No hunters found with this rank.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </HolographicCard>
    );
  } catch (err) {
    console.error('Error rendering GlobalRanking component:', err);
    
    // If we encounter a render error, show a simplified error UI
    return (
      <HolographicCard title="Global Rankings" height="auto">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="error" gutterBottom>
            Error displaying rankings. Please try again later.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      </HolographicCard>
    );
  }
};

export default GlobalRanking;
