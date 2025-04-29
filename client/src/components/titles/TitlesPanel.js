import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

// Import Redux actions
import {
  fetchUserTitles,
  equipTitle,
  unequipTitle
} from '../../redux/slices/titlesSlice';

// Styled components
const StyledPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(16, 20, 30, 0.7)',
  backgroundImage: 'linear-gradient(135deg, rgba(20, 30, 50, 0.7) 0%, rgba(5, 10, 20, 0.7) 100%)',
  border: '1px solid rgba(100, 120, 255, 0.2)',
  boxShadow: '0 0 20px rgba(80, 100, 255, 0.1)',
  height: '100%',
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

const TitleBadge = styled(Box)(({ theme, rarity }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 3,
  background: `linear-gradient(90deg, ${
    rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' : 
    rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' : 
    rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
    rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
    rarity === 'legendary' ? 'rgba(255, 193, 7, 0.2)' :
    'rgba(244, 67, 54, 0.2)'
  } 0%, rgba(20, 20, 30, 0.7) 100%)`,
  border: `1px solid ${
    rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
    rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
    rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
    rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
    rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
    'rgba(244, 67, 54, 0.5)'
  }`,
  boxShadow: `0 0 10px ${
    rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' : 
    rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' : 
    rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
    rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
    rarity === 'legendary' ? 'rgba(255, 193, 7, 0.2)' :
    'rgba(244, 67, 54, 0.2)'
  }`,
  marginRight: theme.spacing(1)
}));

const TitlesPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    userTitles, 
    equippedTitle,
    loading
  } = useSelector(state => state.titles);
  
  // Fetch titles on mount
  useEffect(() => {
    dispatch(fetchUserTitles());
  }, [dispatch]);
  
  // Handle title equip/unequip
  const handleEquipTitle = (title) => {
    if (title.isEquipped) {
      dispatch(unequipTitle());
    } else {
      dispatch(equipTitle(title._id));
    }
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
    <StyledPanel>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Titles
        </Typography>
        
        <Tooltip title="View All Titles">
          <IconButton size="small" onClick={() => navigate('/titles')}>
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Equipped Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Currently Equipped
            </Typography>
            
            {equippedTitle ? (
              <Box sx={{ 
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${getRarityColor(equippedTitle.rarity)}20 0%, rgba(20, 20, 30, 0.7) 100%)`,
                border: `1px solid ${getRarityColor(equippedTitle.rarity)}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getRarityColor(equippedTitle.rarity)} 0%, #121212 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5
                  }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {equippedTitle.name.charAt(0)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      color: getRarityColor(equippedTitle.rarity)
                    }}>
                      {equippedTitle.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mt: 0.5 }}>
                      {Array.from({ length: 
                        equippedTitle.rarity === 'common' ? 1 : 
                        equippedTitle.rarity === 'uncommon' ? 2 : 
                        equippedTitle.rarity === 'rare' ? 3 :
                        equippedTitle.rarity === 'epic' ? 4 :
                        equippedTitle.rarity === 'legendary' ? 5 : 0
                      }).map((_, index) => (
                        <StarIcon 
                          key={index} 
                          sx={{ 
                            fontSize: 14, 
                            color: getRarityColor(equippedTitle.rarity),
                            mr: 0.3
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => dispatch(unequipTitle())}
                  sx={{ 
                    borderColor: `${getRarityColor(equippedTitle.rarity)}50`,
                    color: getRarityColor(equippedTitle.rarity),
                    '&:hover': {
                      borderColor: getRarityColor(equippedTitle.rarity),
                      background: `${getRarityColor(equippedTitle.rarity)}20`
                    }
                  }}
                >
                  Unequip
                </Button>
              </Box>
            ) : (
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                background: 'rgba(30, 40, 60, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  No title equipped
                </Typography>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/titles')}
                >
                  Equip a Title
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Recent Titles */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Recently Unlocked
          </Typography>
          
          {userTitles.length > 0 ? (
            <Grid container spacing={1}>
              {userTitles
                .sort((a, b) => new Date(b.obtainedDate) - new Date(a.obtainedDate))
                .slice(0, 3)
                .map(title => (
                  <Grid item xs={12} key={title._id}>
                    <Box sx={{ 
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(30, 40, 60, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TitleBadge rarity={title.rarity}>
                          <Typography variant="caption" sx={{ 
                            color: getRarityColor(title.rarity),
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '0.6rem'
                          }}>
                            {title.rarity}
                          </Typography>
                        </TitleBadge>
                        
                        <Typography variant="body2">
                          {title.name}
                        </Typography>
                      </Box>
                      
                      {!title.isEquipped && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleEquipTitle(title)}
                          sx={{ minWidth: 'auto' }}
                        >
                          Equip
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Box sx={{ 
              p: 2,
              borderRadius: 2,
              background: 'rgba(30, 40, 60, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                You haven't unlocked any titles yet
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/titles')}
              >
                View Available Titles
              </Button>
            </Box>
          )}
          
          {userTitles.length > 3 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/titles')}
              >
                View All ({userTitles.length})
              </Button>
            </Box>
          )}
        </>
      )}
    </StyledPanel>
  );
};

export default TitlesPanel;
