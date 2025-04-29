import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { getTitlesByPerformance, getTitlesByRarity } from '../../utils/marketplaceTitlesData';
import { equipTitle } from '../../redux/slices/titlesSlice';

// Styled components
const TitlesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(to right, transparent, rgba(95, 209, 249, 0.5), transparent)',
  },
}));

const TitlesTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
  display: 'flex',
  alignItems: 'center',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#eaf6ff',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  textShadow: '0 0 5px rgba(95, 209, 249, 0.3)',
  display: 'flex',
  alignItems: 'center',
}));

const TitleCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 10px rgba(95, 209, 249, 0.1)',
  transition: 'all 0.3s ease',
  height: '320px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  margin: theme.spacing(1, 0),
  width: '100%',
  maxWidth: '280px',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(95, 209, 249, 0.2)',
    border: '1px solid rgba(95, 209, 249, 0.5)',
  },
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30px',
    height: '30px',
    background: 'linear-gradient(135deg, transparent 50%, rgba(95, 209, 249, 0.3) 50%)',
    zIndex: 1,
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #00A0C2 90%)',
  },
  '&:disabled': {
    background: 'rgba(50, 50, 50, 0.7)',
    color: 'rgba(255, 255, 255, 0.3)',
  }
}));

const RarityChip = styled(Chip)(({ theme, rarity }) => ({
  backgroundColor: 
    rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' :
    rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' :
    rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
    rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
    'rgba(255, 193, 7, 0.2)', // legendary
  color: 
    rarity === 'common' ? '#9E9E9E' :
    rarity === 'uncommon' ? '#4CAF50' :
    rarity === 'rare' ? '#2196F3' :
    rarity === 'epic' ? '#9C27B0' :
    '#FFC107', // legendary
  border: `1px solid ${
    rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' :
    rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' :
    rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
    rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
    'rgba(255, 193, 7, 0.5)' // legendary
  }`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: '#5FD1F9',
    height: 3,
    borderRadius: 3
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    minWidth: 100,
    color: '#eaf6ff',
    '&.Mui-selected': {
      color: '#5FD1F9'
    }
  }
}));

const MarketplaceTitles = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { userTitles, equippedTitle } = useSelector(state => state.titles);
  
  const [titles, setTitles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(true);

  // Mock user performance data (in a real app, this would come from the user's stats)
  const userPerformance = {
    hunts: 30,
    kills: 120,
    dungeons: 8,
    rank: user?.rank || 'E',
    bossKills: 3,
    soloHunts: 25
  };

  useEffect(() => {
    // Load titles based on user performance
    const availableTitles = getTitlesByPerformance(userPerformance);
    setTitles(availableTitles);
    setLoading(false);
  }, [userPerformance]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Filter titles based on tab
    if (newValue === 0) {
      // All titles
      setTitles(getTitlesByPerformance(userPerformance));
    } else if (newValue === 1) {
      // Common titles
      setTitles(getTitlesByRarity('common').filter(title => {
        // Check if the title meets the user's performance requirements
        let meetsRequirements = true;
        title.requirements.forEach(req => {
          switch(req.type) {
            case 'hunts':
              if (userPerformance.hunts < req.value) meetsRequirements = false;
              break;
            case 'kills':
              if (userPerformance.kills < req.value) meetsRequirements = false;
              break;
            case 'dungeons':
              if (userPerformance.dungeons < req.value) meetsRequirements = false;
              break;
            case 'rank':
              const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
              const userRankIndex = rankOrder.indexOf(userPerformance.rank);
              const requiredRankIndex = rankOrder.indexOf(req.value);
              if (userRankIndex < requiredRankIndex) meetsRequirements = false;
              break;
            case 'boss_kills':
              if (userPerformance.bossKills < req.value) meetsRequirements = false;
              break;
            case 'solo_hunts':
              if (userPerformance.soloHunts < req.value) meetsRequirements = false;
              break;
            default:
              break;
          }
        });
        return meetsRequirements;
      }));
    } else if (newValue === 2) {
      // Uncommon titles
      setTitles(getTitlesByRarity('uncommon').filter(title => {
        // Check if the title meets the user's performance requirements
        let meetsRequirements = true;
        title.requirements.forEach(req => {
          switch(req.type) {
            case 'hunts':
              if (userPerformance.hunts < req.value) meetsRequirements = false;
              break;
            case 'kills':
              if (userPerformance.kills < req.value) meetsRequirements = false;
              break;
            case 'dungeons':
              if (userPerformance.dungeons < req.value) meetsRequirements = false;
              break;
            case 'rank':
              const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
              const userRankIndex = rankOrder.indexOf(userPerformance.rank);
              const requiredRankIndex = rankOrder.indexOf(req.value);
              if (userRankIndex < requiredRankIndex) meetsRequirements = false;
              break;
            case 'boss_kills':
              if (userPerformance.bossKills < req.value) meetsRequirements = false;
              break;
            case 'solo_hunts':
              if (userPerformance.soloHunts < req.value) meetsRequirements = false;
              break;
            default:
              break;
          }
        });
        return meetsRequirements;
      }));
    } else if (newValue === 3) {
      // Rare and above titles
      setTitles(getTitlesByPerformance(userPerformance).filter(title => 
        ['rare', 'epic', 'legendary'].includes(title.rarity)
      ));
    }
  };

  const handleBuyTitle = (title) => {
    // Check if user has enough gold
    if (user?.gold < title.price) {
      setSnackbar({
        open: true,
        message: 'Not enough gold to purchase this title',
        severity: 'error'
      });
      return;
    }

    // Check if title is already owned
    const isOwned = userTitles?.some(userTitle => userTitle._id === title._id);
    if (isOwned) {
      setSnackbar({
        open: true,
        message: 'You already own this title',
        severity: 'info'
      });
      return;
    }

    // In a real app, we would call the API to buy the title
    // For now, we'll just show a success message
    setSnackbar({
      open: true,
      message: `Successfully purchased the title "${title.name}"!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleEquipTitle = (title) => {
    // Check if title is already equipped
    const isEquipped = equippedTitle?._id === title._id;
    if (isEquipped) {
      setSnackbar({
        open: true,
        message: 'This title is already equipped',
        severity: 'info'
      });
      return;
    }

    // In a real app, we would dispatch the equipTitle action
    // dispatch(equipTitle(title._id));
    
    // For now, just show a success message
    setSnackbar({
      open: true,
      message: `Equipped title "${title.name}"`,
      severity: 'success'
    });
  };

  // Check if a title meets all requirements
  const titleMeetsRequirements = (title) => {
    let meetsRequirements = true;
    
    title.requirements.forEach(req => {
      switch(req.type) {
        case 'hunts':
          if (userPerformance.hunts < req.value) meetsRequirements = false;
          break;
        case 'kills':
          if (userPerformance.kills < req.value) meetsRequirements = false;
          break;
        case 'dungeons':
          if (userPerformance.dungeons < req.value) meetsRequirements = false;
          break;
        case 'rank':
          const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
          const userRankIndex = rankOrder.indexOf(userPerformance.rank);
          const requiredRankIndex = rankOrder.indexOf(req.value);
          if (userRankIndex < requiredRankIndex) meetsRequirements = false;
          break;
        case 'boss_kills':
          if (userPerformance.bossKills < req.value) meetsRequirements = false;
          break;
        case 'solo_hunts':
          if (userPerformance.soloHunts < req.value) meetsRequirements = false;
          break;
        default:
          break;
      }
    });
    
    return meetsRequirements;
  };

  if (loading) {
    return (
      <TitlesContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#5FD1F9', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
            Loading titles data...
          </Typography>
        </Box>
      </TitlesContainer>
    );
  }

  return (
    <TitlesContainer>
      <TitlesTitle variant="h4">
        Titles Marketplace
      </TitlesTitle>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: '#eaf6ff', mb: 2 }}>
          Earn prestigious titles based on your achievements and performance. Titles provide unique bonuses and show off your accomplishments.
        </Typography>
        
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Titles" />
          <Tab label="Common" />
          <Tab label="Uncommon" />
          <Tab label="Rare+" />
        </StyledTabs>
      </Box>
      
      <Grid container spacing={4} sx={{ mb: 2 }}>
        {titles.map((title, index) => (
          <Grid item xs={12} sm={6} key={title._id || index} sx={{ display: 'flex', justifyContent: 'center' }}>
            <TitleCard>
              <Box sx={{ 
                height: 140, 
                position: 'relative',
                background: `linear-gradient(to bottom, 
                  ${title.rarity === 'common' ? 'rgba(158, 158, 158, 0.3)' :
                    title.rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.3)' :
                    title.rarity === 'rare' ? 'rgba(33, 150, 243, 0.3)' :
                    title.rarity === 'epic' ? 'rgba(156, 39, 176, 0.3)' :
                    'rgba(255, 193, 7, 0.3)'} 0%, 
                  rgba(0, 0, 0, 0.7) 100%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  textAlign: 'center',
                  px: 2
                }}>
                  {title.name}
                </Typography>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  zIndex: 2
                }}>
                  <RarityChip 
                    label={title.rarity} 
                    rarity={title.rarity} 
                    size="small" 
                  />
                </Box>
                {titleMeetsRequirements(title) ? (
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    zIndex: 2
                  }}>
                    <Chip 
                      label="Requirements Met" 
                      size="small"
                      icon={<CheckCircleIcon />}
                      sx={{
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        border: '1px solid rgba(76, 175, 80, 0.5)'
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    zIndex: 2
                  }}>
                    <Chip 
                      label="Requirements Not Met" 
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        color: '#F44336',
                        border: '1px solid rgba(244, 67, 54, 0.5)'
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 2, pb: 0 }}>
                <Typography variant="body2" sx={{ 
                  color: '#eaf6ff', 
                  mb: 1, 
                  height: '2.4em', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical' 
                }}>
                  {title.description}
                </Typography>
                
                <Typography variant="caption" sx={{ color: '#5FD1F9', display: 'block', mb: 0.5 }}>
                  Bonuses:
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  {title.bonuses.map((bonus, idx) => (
                    <Typography key={idx} variant="caption" sx={{ 
                      display: 'block',
                      color: '#eaf6ff',
                      opacity: 0.8
                    }}>
                      • {bonus.description}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                  {title.price} G
                </Typography>
                <Box>
                  <StyledButton 
                    size="small" 
                    onClick={() => handleBuyTitle(title)}
                    disabled={userTitles?.some(userTitle => userTitle._id === title._id) || !titleMeetsRequirements(title)}
                  >
                    {userTitles?.some(userTitle => userTitle._id === title._id) ? 'Owned' : 'Buy'}
                  </StyledButton>
                  {userTitles?.some(userTitle => userTitle._id === title._id) && (
                    <StyledButton 
                      size="small" 
                      onClick={() => handleEquipTitle(title)}
                      disabled={equippedTitle?._id === title._id}
                      sx={{ ml: 1 }}
                    >
                      {equippedTitle?._id === title._id ? 'Equipped' : 'Equip'}
                    </StyledButton>
                  )}
                </Box>
              </CardActions>
            </TitleCard>
          </Grid>
        ))}
      </Grid>
      
      {titles.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
            No titles available in this category. Complete more achievements to unlock titles.
          </Typography>
        </Box>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </TitlesContainer>
  );
};

export default MarketplaceTitles;
