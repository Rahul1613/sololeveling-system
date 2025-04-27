import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Divider,
  Tooltip,
  Badge,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import components
import TitleCard from '../components/titles/TitleCard';
import TitleDetails from '../components/titles/TitleDetails';

// Import Redux actions
import {
  fetchUserTitles,
  fetchAvailableTitles,
  equipTitle,
  unequipTitle,
  setSelectedTitle,
  clearSelectedTitle
} from '../redux/slices/titlesSlice';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'rgba(16, 20, 30, 0.7)',
  backgroundImage: 'linear-gradient(135deg, rgba(20, 30, 50, 0.7) 0%, rgba(5, 10, 20, 0.7) 100%)',
  border: '1px solid rgba(100, 120, 255, 0.2)',
  boxShadow: '0 0 20px rgba(80, 100, 255, 0.1)',
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #7B68EE, #3498db)',
    zIndex: 1
  }
}));

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

const RarityFilterButton = styled(Button)(({ theme, active, rarity }) => ({
  margin: theme.spacing(0, 0.5),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  color: active ? 
    (rarity === 'common' ? '#9E9E9E' : 
     rarity === 'uncommon' ? '#4CAF50' : 
     rarity === 'rare' ? '#2196F3' :
     rarity === 'epic' ? '#9C27B0' :
     rarity === 'legendary' ? '#FFC107' :
     theme.palette.primary.main) : 
    'text.secondary',
  border: `1px solid ${active ? 
    (rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
     rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
     rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
     rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
     rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
     'rgba(123, 104, 238, 0.5)') : 
    'rgba(255, 255, 255, 0.1)'}`,
  backgroundColor: active ? 
    (rarity === 'common' ? 'rgba(158, 158, 158, 0.1)' : 
     rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.1)' : 
     rarity === 'rare' ? 'rgba(33, 150, 243, 0.1)' :
     rarity === 'epic' ? 'rgba(156, 39, 176, 0.1)' :
     rarity === 'legendary' ? 'rgba(255, 193, 7, 0.1)' :
     'rgba(123, 104, 238, 0.1)') : 
    'transparent',
  '&:hover': {
    backgroundColor: active ? 
      (rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' : 
       rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' : 
       rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
       rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
       rarity === 'legendary' ? 'rgba(255, 193, 7, 0.2)' :
       'rgba(123, 104, 238, 0.2)') : 
      'rgba(255, 255, 255, 0.05)'
  }
}));

const TitlesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    userTitles = [], 
    availableTitles = [], 
    equippedTitle,
    loading, 
    error, 
    selectedTitle
  } = useSelector(state => state.titles);
  
  const { user } = useSelector(state => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rarityFilter, setRarityFilter] = useState('all');
  
  // Fetch titles on mount
  useEffect(() => {
    dispatch(fetchUserTitles());
    dispatch(fetchAvailableTitles());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle title selection
  const handleSelectTitle = (title) => {
    dispatch(setSelectedTitle(title));
    setDetailsOpen(true);
  };
  
  // Handle title details close
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => {
      dispatch(clearSelectedTitle());
    }, 300);
  };
  
  // Handle title equip/unequip
  const handleEquipTitle = (title) => {
    if (title.isEquipped) {
      dispatch(unequipTitle());
    } else {
      dispatch(equipTitle(title._id));
    }
  };
  
  // Filter titles by rarity
  const getFilteredTitles = (titles) => {
    if (rarityFilter === 'all') return titles;
    return titles.filter(title => title.rarity === rarityFilter);
  };
  
  // Refresh titles
  const handleRefresh = () => {
    dispatch(fetchUserTitles());
    dispatch(fetchAvailableTitles());
  };
  
  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFC107';
      default: return '#F44336';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Titles
          </Typography>
          {equippedTitle && (
            <Box sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              ml: 2,
              px: 2,
              py: 0.5,
              borderRadius: theme.shape.borderRadius * 3,
              background: `linear-gradient(90deg, ${getRarityColor(equippedTitle.rarity)}20 0%, rgba(20, 20, 30, 0.7) 100%)`,
              border: `1px solid ${getRarityColor(equippedTitle.rarity)}50`,
              boxShadow: `0 0 10px ${getRarityColor(equippedTitle.rarity)}20`,
            }}>
              <CheckCircleIcon sx={{ mr: 1, color: getRarityColor(equippedTitle.rarity) }} />
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold',
                color: getRarityColor(equippedTitle.rarity)
              }}>
                {equippedTitle.name}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box>
          <Tooltip title="Refresh Titles">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Titles Help">
            <IconButton>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Titles Tabs */}
        <Grid item xs={12}>
          <StyledPaper>
            <StyledTabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              centered={!isMobile}
            >
              <Tab label="My Titles" />
              <Tab 
                label={
                  <Badge 
                    color="primary" 
                    badgeContent={availableTitles.filter(title => title.allRequirementsMet).length}
                    max={99}
                  >
                    Available Titles
                  </Badge>
                } 
              />
            </StyledTabs>
            
            {/* Rarity Filter */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              mb: 3,
              justifyContent: 'center'
            }}>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'all'}
                onClick={() => setRarityFilter('all')}
              >
                All Rarities
              </RarityFilterButton>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'common'}
                rarity="common"
                onClick={() => setRarityFilter('common')}
              >
                Common
              </RarityFilterButton>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'uncommon'}
                rarity="uncommon"
                onClick={() => setRarityFilter('uncommon')}
              >
                Uncommon
              </RarityFilterButton>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'rare'}
                rarity="rare"
                onClick={() => setRarityFilter('rare')}
              >
                Rare
              </RarityFilterButton>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'epic'}
                rarity="epic"
                onClick={() => setRarityFilter('epic')}
              >
                Epic
              </RarityFilterButton>
              <RarityFilterButton
                variant="outlined"
                size="small"
                active={rarityFilter === 'legendary'}
                rarity="legendary"
                onClick={() => setRarityFilter('legendary')}
              >
                Legendary
              </RarityFilterButton>
            </Box>
            
            {/* My Titles Tab */}
            {tabValue === 0 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userTitles.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      You haven't unlocked any titles yet
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setTabValue(1)}
                    >
                      View Available Titles
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {getFilteredTitles(userTitles).map(title => (
                      <Grid item xs={12} sm={6} md={4} key={title._id}>
                        <TitleCard
                          title={title}
                          onSelect={handleSelectTitle}
                          onEquip={handleEquipTitle}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
                
                {userTitles.length > 0 && getFilteredTitles(userTitles).length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No titles match the selected rarity filter
                    </Typography>
                  </Box>
                )}
              </>
            )}
            
            {/* Available Titles Tab */}
            {tabValue === 1 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Titles Available to Unlock
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        These titles can be unlocked by meeting their requirements.
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {getFilteredTitles(availableTitles)
                        .filter(title => title.allRequirementsMet)
                        .map(title => (
                          <Grid item xs={12} sm={6} md={4} key={title._id}>
                            <TitleCard
                              title={title}
                              onSelect={handleSelectTitle}
                              onEquip={handleEquipTitle}
                            />
                          </Grid>
                        ))}
                    </Grid>
                    
                    {availableTitles.filter(title => title.allRequirementsMet).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          No titles are currently available to unlock
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 4, mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Locked Titles
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        These titles require you to meet certain requirements before unlocking.
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {getFilteredTitles(availableTitles)
                        .filter(title => !title.allRequirementsMet)
                        .map(title => (
                          <Grid item xs={12} sm={6} md={4} key={title._id}>
                            <TitleCard
                              title={title}
                              onSelect={handleSelectTitle}
                              onEquip={handleEquipTitle}
                              locked={true}
                            />
                          </Grid>
                        ))}
                    </Grid>
                    
                    {availableTitles.filter(title => !title.allRequirementsMet).length > 0 && 
                     getFilteredTitles(availableTitles).filter(title => !title.allRequirementsMet).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          No locked titles match the selected rarity filter
                        </Typography>
                      </Box>
                    )}
                    
                    {availableTitles.filter(title => !title.allRequirementsMet).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          No locked titles found
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
      
      {/* Title Details Dialog */}
      {selectedTitle && (
        <TitleDetails
          open={detailsOpen}
          onClose={handleCloseDetails}
          title={selectedTitle}
          onEquip={handleEquipTitle}
          userStats={user}
          locked={selectedTitle.allRequirementsMet === false}
        />
      )}
    </Container>
  );
};

export default TitlesPage;
