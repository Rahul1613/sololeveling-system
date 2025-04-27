import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

// Styled components
const StyledCard = styled(Card)(({ theme, rarity, equipped, locked }) => ({
  position: 'relative',
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  background: locked ? 
    'linear-gradient(135deg, rgba(50, 50, 70, 0.3) 0%, rgba(20, 20, 30, 0.8) 100%)' :
    `linear-gradient(135deg, 
      ${rarity === 'common' ? 'rgba(158, 158, 158, 0.1)' : 
        rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.1)' : 
        rarity === 'rare' ? 'rgba(33, 150, 243, 0.1)' :
        rarity === 'epic' ? 'rgba(156, 39, 176, 0.1)' :
        rarity === 'legendary' ? 'rgba(255, 193, 7, 0.1)' :
        'rgba(244, 67, 54, 0.1)'} 0%, 
      rgba(20, 20, 30, 0.9) 100%)`,
  border: `1px solid ${locked ? 'rgba(100, 100, 100, 0.3)' : 
    (equipped ? 
      (rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
       rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
       rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
       rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
       rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
       'rgba(244, 67, 54, 0.5)') : 
    (rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' : 
     rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' : 
     rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
     rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
     rarity === 'legendary' ? 'rgba(255, 193, 7, 0.2)' :
     'rgba(244, 67, 54, 0.2)'))}`,
  boxShadow: equipped ? 
    `0 0 15px ${rarity === 'common' ? 'rgba(158, 158, 158, 0.3)' : 
               rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.3)' : 
               rarity === 'rare' ? 'rgba(33, 150, 243, 0.3)' :
               rarity === 'epic' ? 'rgba(156, 39, 176, 0.3)' :
               rarity === 'legendary' ? 'rgba(255, 193, 7, 0.3)' :
               'rgba(244, 67, 54, 0.3)'}` : 
    'none',
  opacity: locked ? 0.7 : 1,
  '&:hover': {
    transform: locked ? 'none' : 'translateY(-5px)',
    boxShadow: locked ? 'none' : 
      `0 5px 15px ${rarity === 'common' ? 'rgba(158, 158, 158, 0.3)' : 
                   rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.3)' : 
                   rarity === 'rare' ? 'rgba(33, 150, 243, 0.3)' :
                   rarity === 'epic' ? 'rgba(156, 39, 176, 0.3)' :
                   rarity === 'legendary' ? 'rgba(255, 193, 7, 0.3)' :
                   'rgba(244, 67, 54, 0.3)'}`
  }
}));

const TitleIconWrapper = styled(Box)(({ theme, rarity }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, 
    ${rarity === 'common' ? '#9E9E9E' : 
      rarity === 'uncommon' ? '#4CAF50' : 
      rarity === 'rare' ? '#2196F3' :
      rarity === 'epic' ? '#9C27B0' :
      rarity === 'legendary' ? '#FFC107' :
      '#F44336'} 0%, 
    #121212 100%)`,
  boxShadow: `0 0 10px ${rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
                        rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
                        rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
                        rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
                        rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
                        'rgba(244, 67, 54, 0.5)'}`,
  marginRight: theme.spacing(2)
}));

const RarityChip = styled(Chip)(({ theme, rarity }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  height: 24,
  backgroundColor: rarity === 'common' ? 'rgba(158, 158, 158, 0.2)' : 
                  rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.2)' : 
                  rarity === 'rare' ? 'rgba(33, 150, 243, 0.2)' :
                  rarity === 'epic' ? 'rgba(156, 39, 176, 0.2)' :
                  rarity === 'legendary' ? 'rgba(255, 193, 7, 0.2)' :
                  'rgba(244, 67, 54, 0.2)',
  color: rarity === 'common' ? '#9E9E9E' : 
         rarity === 'uncommon' ? '#4CAF50' : 
         rarity === 'rare' ? '#2196F3' :
         rarity === 'epic' ? '#9C27B0' :
         rarity === 'legendary' ? '#FFC107' :
         '#F44336',
  border: `1px solid ${rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
                      rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
                      rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
                      rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
                      rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
                      'rgba(244, 67, 54, 0.5)'}`
}));

const TitleCard = ({ title, onSelect, onEquip, locked = false }) => {
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
  
  // Get stars based on rarity
  const getRarityStars = (rarity) => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 2;
      case 'rare': return 3;
      case 'epic': return 4;
      case 'legendary': return 5;
      default: return 0;
    }
  };
  
  return (
    <StyledCard rarity={title.rarity} equipped={title.isEquipped} locked={locked}>
      <RarityChip 
        rarity={title.rarity}
        label={title.rarity.toUpperCase()}
        size="small"
      />
      
      {locked && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2,
          borderRadius: 'inherit'
        }}>
          <LockIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.7)' }} />
        </Box>
      )}
      
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <TitleIconWrapper rarity={title.rarity}>
            <Typography variant="h5" sx={{ color: 'white' }}>
              {title.name.charAt(0)}
            </Typography>
          </TitleIconWrapper>
          
          <Box sx={{ ml: 1, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 'bold',
              color: title.isEquipped ? getRarityColor(title.rarity) : 'inherit'
            }}>
              {title.name}
            </Typography>
            
            <Box sx={{ display: 'flex', mt: 0.5 }}>
              {Array.from({ length: getRarityStars(title.rarity) }).map((_, index) => (
                <StarIcon 
                  key={index} 
                  sx={{ 
                    fontSize: 16, 
                    color: getRarityColor(title.rarity),
                    mr: 0.5
                  }} 
                />
              ))}
            </Box>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ 
          color: 'text.secondary',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          mb: 1.5,
          height: 40
        }}>
          {title.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onSelect(title)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {!locked && (
            <Tooltip title={title.isEquipped ? 'Currently Equipped' : 'Equip Title'}>
              <IconButton 
                size="small" 
                color={title.isEquipped ? 'secondary' : 'default'}
                onClick={() => onEquip(title)}
              >
                {title.isEquipped ? 
                  <CheckCircleIcon fontSize="small" /> : 
                  <StarIcon fontSize="small" />
                }
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TitleCard;
