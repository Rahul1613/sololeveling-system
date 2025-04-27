import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(16, 20, 30, 0.95)',
    backgroundImage: 'linear-gradient(135deg, rgba(20, 30, 50, 0.95) 0%, rgba(5, 10, 20, 0.95) 100%)',
    border: '1px solid rgba(100, 120, 255, 0.2)',
    boxShadow: '0 0 20px rgba(80, 100, 255, 0.3)',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    maxWidth: 600,
    width: '100%'
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme, rarity }) => ({
  background: 'linear-gradient(90deg, rgba(30, 40, 70, 0.8) 0%, rgba(10, 15, 35, 0.8) 100%)',
  color: rarity === 'common' ? '#9E9E9E' : 
         rarity === 'uncommon' ? '#4CAF50' : 
         rarity === 'rare' ? '#2196F3' :
         rarity === 'epic' ? '#9C27B0' :
         rarity === 'legendary' ? '#FFC107' :
         theme.palette.primary.light,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: '1px solid rgba(100, 120, 255, 0.2)'
}));

const TitleIconLarge = styled(Box)(({ theme, rarity }) => ({
  width: 80,
  height: 80,
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
  boxShadow: `0 0 15px ${rarity === 'common' ? 'rgba(158, 158, 158, 0.5)' : 
                        rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.5)' : 
                        rarity === 'rare' ? 'rgba(33, 150, 243, 0.5)' :
                        rarity === 'epic' ? 'rgba(156, 39, 176, 0.5)' :
                        rarity === 'legendary' ? 'rgba(255, 193, 7, 0.5)' :
                        'rgba(244, 67, 54, 0.5)'}`,
  margin: theme.spacing(0, 2, 2, 0),
  fontSize: '2rem',
  color: 'white',
  border: `2px solid ${rarity === 'common' ? 'rgba(158, 158, 158, 0.7)' : 
                      rarity === 'uncommon' ? 'rgba(76, 175, 80, 0.7)' : 
                      rarity === 'rare' ? 'rgba(33, 150, 243, 0.7)' :
                      rarity === 'epic' ? 'rgba(156, 39, 176, 0.7)' :
                      rarity === 'legendary' ? 'rgba(255, 193, 7, 0.7)' :
                      'rgba(244, 67, 54, 0.7)'}`
}));

const StatBox = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 40, 70, 0.3)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  border: '1px solid rgba(100, 120, 255, 0.1)',
  height: '100%'
}));

const EffectChip = styled(Chip)(({ theme, effecttype }) => ({
  margin: theme.spacing(0.5),
  background: effecttype === 'buff' ? 'rgba(76, 175, 80, 0.2)' : 
              effecttype === 'debuff' ? 'rgba(244, 67, 54, 0.2)' : 
              'rgba(33, 150, 243, 0.2)',
  color: effecttype === 'buff' ? '#4CAF50' : 
         effecttype === 'debuff' ? '#F44336' : 
         '#2196F3',
  border: `1px solid ${effecttype === 'buff' ? 'rgba(76, 175, 80, 0.5)' : 
                      effecttype === 'debuff' ? 'rgba(244, 67, 54, 0.5)' : 
                      'rgba(33, 150, 243, 0.5)'}`,
  '& .MuiChip-label': {
    padding: theme.spacing(0, 1)
  }
}));

const RequirementChip = styled(Chip)(({ theme, met }) => ({
  margin: theme.spacing(0.5),
  background: met ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
  color: met ? '#4CAF50' : '#F44336',
  border: `1px solid ${met ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`,
  '& .MuiChip-label': {
    padding: theme.spacing(0, 1)
  }
}));

const TitleDetails = ({ 
  open, 
  onClose, 
  title, 
  onEquip,
  userStats,
  locked = false
}) => {
  if (!title) return null;
  
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
  
  // Check if all requirements are met
  const checkRequirements = () => {
    if (!title.requirements || !userStats || locked) return false;
    
    for (const req of title.requirements) {
      if (!req.met) return false;
    }
    
    return true;
  };
  
  const allRequirementsMet = checkRequirements();
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <StyledDialogTitle rarity={title.rarity}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            {title.name}
          </Typography>
          <Chip 
            label={title.rarity.toUpperCase()}
            size="small"
            sx={{ 
              ml: 1, 
              bgcolor: `${getRarityColor(title.rarity)}20`,
              color: getRarityColor(title.rarity),
              border: `1px solid ${getRarityColor(title.rarity)}50`
            }}
          />
          {title.isEquipped && (
            <Chip 
              label="EQUIPPED"
              size="small"
              icon={<CheckCircleIcon fontSize="small" />}
              sx={{ 
                ml: 1, 
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: '#4CAF50',
                border: '1px solid rgba(76, 175, 80, 0.5)'
              }}
            />
          )}
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TitleIconLarge rarity={title.rarity}>
            {title.name.charAt(0)}
          </TitleIconLarge>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
              {Array.from({ length: getRarityStars(title.rarity) }).map((_, index) => (
                <StarIcon 
                  key={index} 
                  sx={{ 
                    fontSize: 20, 
                    color: getRarityColor(title.rarity),
                    mr: 0.5
                  }} 
                />
              ))}
            </Box>
            
            <Typography variant="body1" sx={{ mb: 1 }}>
              {title.description}
            </Typography>
            
            {locked && (
              <Typography variant="body2" sx={{ 
                color: 'error.light',
                fontWeight: 'bold',
                mt: 1
              }}>
                This title is locked. Complete the requirements to unlock it.
              </Typography>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <StatBox>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
                Title Effects
              </Typography>
              <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
              
              {title.effects && title.effects.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {title.effects.map((effect, index) => (
                    <EffectChip
                      key={index}
                      label={`${effect.stat} ${effect.value > 0 ? '+' : ''}${effect.value}${effect.isPercentage ? '%' : ''}`}
                      effecttype={effect.value > 0 ? 'buff' : 'debuff'}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  This title has no stat effects.
                </Typography>
              )}
            </StatBox>
          </Grid>
        </Grid>
        
        {title.requirements && title.requirements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Requirements
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {title.requirements.map((req, index) => {
                let label = '';
                if (req.type === 'level') label = `Level ${req.value}+`;
                else if (req.type === 'stat') label = `${req.stat.charAt(0).toUpperCase() + req.stat.slice(1)} ${req.value}+`;
                else if (req.type === 'quest') label = `Complete Quest: ${req.questName}`;
                else if (req.type === 'achievement') label = `Achievement: ${req.achievementName}`;
                else if (req.type === 'item') label = `Obtain Item: ${req.itemName}`;
                else if (req.type === 'skill') label = `${req.skillName} Lv.${req.level}+`;
                else if (req.type === 'shadow') label = `Extract Shadow: ${req.shadowName}`;
                else if (req.type === 'guild') label = `Guild Rank: ${req.guildRank}+`;
                
                return (
                  <RequirementChip
                    key={index}
                    label={label}
                    met={req.met}
                    icon={req.met ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                  />
                );
              })}
            </Box>
          </Box>
        )}
        
        {title.specialEffect && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Special Effect
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {title.specialEffect}
            </Typography>
          </Box>
        )}
        
        {title.lore && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Lore
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              {title.lore}
            </Typography>
          </Box>
        )}
        
        {title.obtainedDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Obtained
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {new Date(title.obtainedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        bgcolor: 'rgba(20, 30, 50, 0.5)', 
        borderTop: '1px solid rgba(100, 120, 255, 0.2)',
        justifyContent: 'flex-end'
      }}>
        {!locked && (
          <Button
            variant="contained"
            color={title.isEquipped ? 'secondary' : 'primary'}
            startIcon={title.isEquipped ? <CheckCircleIcon /> : <StarIcon />}
            onClick={() => onEquip(title)}
            disabled={!allRequirementsMet && !title.isEquipped}
          >
            {title.isEquipped ? 'Unequip' : 'Equip Title'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default TitleDetails;
