import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress, 
  IconButton,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SettingsIcon from '@mui/icons-material/Settings';

// Styled components
const StyledCard = styled(Card)(({ theme, type, equipped }) => ({
  position: 'relative',
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  background: `linear-gradient(135deg, 
    ${type === 'active' ? 'rgba(33, 150, 243, 0.1)' : 
      type === 'passive' ? 'rgba(76, 175, 80, 0.1)' : 
      'rgba(244, 67, 54, 0.1)'} 0%, 
    rgba(20, 20, 30, 0.9) 100%)`,
  border: `1px solid ${equipped ? 
    (type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
     type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
     'rgba(244, 67, 54, 0.5)') : 
    'rgba(255, 255, 255, 0.1)'}`,
  boxShadow: equipped ? 
    `0 0 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.3)' : 
               type === 'passive' ? 'rgba(76, 175, 80, 0.3)' : 
               'rgba(244, 67, 54, 0.3)'}` : 
    'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 5px 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.3)' : 
                           type === 'passive' ? 'rgba(76, 175, 80, 0.3)' : 
                           'rgba(244, 67, 54, 0.3)'}`
  }
}));

const SkillIconWrapper = styled(Box)(({ theme, type }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, 
    ${type === 'active' ? '#2196F3' : 
      type === 'passive' ? '#4CAF50' : 
      '#F44336'} 0%, 
    #121212 100%)`,
  boxShadow: `0 0 10px ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
                        type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
                        'rgba(244, 67, 54, 0.5)'}`,
  marginRight: theme.spacing(2)
}));

const SkillTypeChip = styled(Box)(({ theme, type }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: '2px 8px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  backgroundColor: type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
                  type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
                  'rgba(244, 67, 54, 0.2)',
  color: type === 'active' ? '#2196F3' : 
         type === 'passive' ? '#4CAF50' : 
         '#F44336',
  border: `1px solid ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
                      type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
                      'rgba(244, 67, 54, 0.5)'}`
}));

const SkillCard = ({ skill, onSelect, onEquip, onUse }) => {
  // Calculate cooldown percentage
  const calculateCooldownPercentage = () => {
    if (!skill.cooldownEnds) return 0;
    
    const now = new Date();
    const end = new Date(skill.cooldownEnds);
    const total = skill.cooldown * 1000; // Convert to ms
    const elapsed = now - (end - total);
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };
  
  // Format time remaining for cooldown
  const formatTimeRemaining = () => {
    if (!skill.cooldownEnds) return null;
    
    const now = new Date();
    const diff = new Date(skill.cooldownEnds) - now;
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const cooldownTime = formatTimeRemaining();
  const cooldownPercentage = calculateCooldownPercentage();
  
  return (
    <StyledCard type={skill.type} equipped={skill.isEquipped}>
      <SkillTypeChip type={skill.type}>
        {skill.type}
      </SkillTypeChip>
      
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'background.paper', 
                  color: 'primary.main',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'primary.main'
                }}
              >
                {skill.level}
              </Typography>
            }
          >
            <SkillIconWrapper type={skill.type}>
              {cooldownTime ? (
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={cooldownPercentage}
                    size={60}
                    thickness={4}
                    sx={{
                      color: 'rgba(255, 0, 0, 0.5)',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'white', zIndex: 1 }}>
                    {cooldownTime}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h5" sx={{ color: 'white' }}>
                  {skill.name.charAt(0)}
                </Typography>
              )}
            </SkillIconWrapper>
          </Badge>
          
          <Box sx={{ ml: 1, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {skill.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              MP Cost: <span style={{ color: '#2196F3' }}>{skill.mpCost}</span>
            </Typography>
            
            {skill.level < skill.maxLevel && (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    LVL {skill.level}/{skill.maxLevel}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {skill.experience}/{skill.experienceToNextLevel}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(skill.experience / skill.experienceToNextLevel) * 100}
                  sx={{ 
                    height: 4, 
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)'
                    }
                  }}
                />
              </Box>
            )}
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
          {skill.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onSelect(skill)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {skill.type !== 'passive' && (
            <Tooltip title={cooldownTime ? 'On Cooldown' : 'Use Skill'}>
              <span>
                <IconButton 
                  size="small" 
                  color="primary"
                  disabled={!!cooldownTime || !skill.isEquipped}
                  onClick={() => onUse(skill)}
                >
                  <FlashOnIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          
          <Tooltip title={skill.isEquipped ? 'Unequip' : 'Equip'}>
            <IconButton 
              size="small" 
              color={skill.isEquipped ? 'secondary' : 'default'}
              onClick={() => onEquip(skill)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default SkillCard;
