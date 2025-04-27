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
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import EquipIcon from '@mui/icons-material/SettingsApplications';
import UnequipIcon from '@mui/icons-material/SettingsBackupRestore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(30, 40, 70, 0.8) 0%, rgba(10, 15, 35, 0.8) 100%)',
  color: theme.palette.primary.light,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: '1px solid rgba(100, 120, 255, 0.2)'
}));

const SkillIconLarge = styled(Box)(({ theme, type }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, 
    ${type === 'active' ? '#2196F3' : 
      type === 'passive' ? '#4CAF50' : 
      '#F44336'} 0%, 
    #121212 100%)`,
  boxShadow: `0 0 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
                        type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
                        'rgba(244, 67, 54, 0.5)'}`,
  margin: theme.spacing(0, 2, 2, 0),
  fontSize: '2rem',
  color: 'white',
  border: `2px solid ${type === 'active' ? 'rgba(33, 150, 243, 0.7)' : 
                      type === 'passive' ? 'rgba(76, 175, 80, 0.7)' : 
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

const LevelUpButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(90deg, #9370DB 0%, #3CB371 100%)',
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)'
  }
}));

const SkillDetails = ({ 
  open, 
  onClose, 
  skill, 
  onEquip, 
  onUse, 
  onLevelUp,
  canLevelUp,
  userStats 
}) => {
  if (!skill) return null;
  
  // Check if all requirements are met
  const checkRequirements = () => {
    if (!skill.requirements || !userStats) return true;
    
    for (const req of skill.requirements) {
      if (req.type === 'level' && userStats.level < req.value) return false;
      if (req.type === 'stat' && userStats[req.stat] < req.value) return false;
      if (req.type === 'skill' && !req.met) return false;
    }
    
    return true;
  };
  
  const allRequirementsMet = checkRequirements();
  
  // Format cooldown display
  const formatCooldown = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Calculate stats for next level
  const calculateNextLevelStats = (current, growth) => {
    return Math.round(current * (1 + growth));
  };
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            {skill.name}
          </Typography>
          <Chip 
            label={`Lv. ${skill.level}`}
            size="small"
            sx={{ ml: 1, bgcolor: 'rgba(100, 120, 255, 0.2)', color: 'primary.light' }}
          />
          <Chip 
            label={skill.type.toUpperCase()}
            size="small"
            sx={{ 
              ml: 1, 
              bgcolor: skill.type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
                      skill.type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
                      'rgba(244, 67, 54, 0.2)',
              color: skill.type === 'active' ? '#2196F3' : 
                     skill.type === 'passive' ? '#4CAF50' : 
                     '#F44336',
              border: `1px solid ${skill.type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
                                  skill.type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
                                  'rgba(244, 67, 54, 0.5)'}`
            }}
          />
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <SkillIconLarge type={skill.type}>
            {skill.name.charAt(0)}
          </SkillIconLarge>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {skill.description}
            </Typography>
            
            {skill.level < skill.maxLevel && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Level Progress
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {skill.experience}/{skill.experienceToNextLevel} XP
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(skill.experience / skill.experienceToNextLevel) * 100}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <StatBox>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
                Current Stats
              </Typography>
              <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
              
              <Grid container spacing={1}>
                {skill.type !== 'passive' && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      MP Cost:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {skill.mpCost}
                    </Typography>
                  </Grid>
                )}
                
                {skill.type !== 'passive' && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Cooldown:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                      {formatCooldown(skill.cooldown)}
                    </Typography>
                  </Grid>
                )}
                
                {skill.damage > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Damage:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                      {skill.damage}
                    </Typography>
                  </Grid>
                )}
                
                {skill.healing > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Healing:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {skill.healing}
                    </Typography>
                  </Grid>
                )}
                
                {skill.duration > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Duration:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
                      {formatCooldown(skill.duration)}
                    </Typography>
                  </Grid>
                )}
                
                {skill.range > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Range:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {skill.range}m
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </StatBox>
          </Grid>
          
          {skill.level < skill.maxLevel && (
            <Grid item xs={12} sm={6}>
              <StatBox>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
                  Next Level Stats
                </Typography>
                <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
                
                <Grid container spacing={1}>
                  {skill.type !== 'passive' && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        MP Cost:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                        {calculateNextLevelStats(skill.mpCost, skill.mpCostGrowth)}
                        <Typography component="span" variant="caption" sx={{ color: '#2196F3', ml: 0.5 }}>
                          (+{Math.round(skill.mpCostGrowth * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                  
                  {skill.type !== 'passive' && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Cooldown:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                        {formatCooldown(Math.max(1, Math.round(skill.cooldown * (1 - skill.cooldownReduction))))}
                        <Typography component="span" variant="caption" sx={{ color: '#4CAF50', ml: 0.5 }}>
                          (-{Math.round(skill.cooldownReduction * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                  
                  {skill.damage > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Damage:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                        {calculateNextLevelStats(skill.damage, skill.damageGrowth)}
                        <Typography component="span" variant="caption" sx={{ color: '#4CAF50', ml: 0.5 }}>
                          (+{Math.round(skill.damageGrowth * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                  
                  {skill.healing > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Healing:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {calculateNextLevelStats(skill.healing, skill.healingGrowth)}
                        <Typography component="span" variant="caption" sx={{ color: '#4CAF50', ml: 0.5 }}>
                          (+{Math.round(skill.healingGrowth * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                  
                  {skill.duration > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Duration:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
                        {formatCooldown(calculateNextLevelStats(skill.duration, skill.durationGrowth))}
                        <Typography component="span" variant="caption" sx={{ color: '#4CAF50', ml: 0.5 }}>
                          (+{Math.round(skill.durationGrowth * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                  
                  {skill.range > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Range:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {calculateNextLevelStats(skill.range, skill.rangeGrowth)}m
                        <Typography component="span" variant="caption" sx={{ color: '#4CAF50', ml: 0.5 }}>
                          (+{Math.round(skill.rangeGrowth * 100)}%)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </StatBox>
            </Grid>
          )}
        </Grid>
        
        {skill.effects && skill.effects.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Effects
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {skill.effects.map((effect, index) => (
                <EffectChip
                  key={index}
                  label={`${effect.stat} ${effect.value > 0 ? '+' : ''}${effect.value}${effect.isPercentage ? '%' : ''}`}
                  effecttype={effect.value > 0 ? 'buff' : 'debuff'}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {skill.requirements && skill.requirements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Requirements
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {skill.requirements.map((req, index) => {
                let label = '';
                if (req.type === 'level') label = `Level ${req.value}+`;
                else if (req.type === 'stat') label = `${req.stat.charAt(0).toUpperCase() + req.stat.slice(1)} ${req.value}+`;
                else if (req.type === 'skill') label = `${req.skillName} Lv.${req.level}+`;
                
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
        
        {skill.lore && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.light' }}>
              Lore
            </Typography>
            <Divider sx={{ mb: 1.5, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              {skill.lore}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        bgcolor: 'rgba(20, 30, 50, 0.5)', 
        borderTop: '1px solid rgba(100, 120, 255, 0.2)',
        justifyContent: 'space-between'
      }}>
        <Box>
          {skill.level < skill.maxLevel && (
            <LevelUpButton
              variant="contained"
              startIcon={<ArrowUpwardIcon />}
              onClick={() => onLevelUp(skill)}
              disabled={!canLevelUp}
            >
              Level Up
            </LevelUpButton>
          )}
        </Box>
        
        <Box>
          {skill.type !== 'passive' && (
            <Tooltip title={!allRequirementsMet ? 'Requirements not met' : 'Use Skill'}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FlashOnIcon />}
                  onClick={() => onUse(skill)}
                  disabled={!allRequirementsMet || !skill.isEquipped}
                  sx={{ mr: 1 }}
                >
                  Use
                </Button>
              </span>
            </Tooltip>
          )}
          
          <Tooltip title={!allRequirementsMet ? 'Requirements not met' : (skill.isEquipped ? 'Unequip' : 'Equip')}>
            <span>
              <Button
                variant="contained"
                color={skill.isEquipped ? 'secondary' : 'primary'}
                startIcon={skill.isEquipped ? <UnequipIcon /> : <EquipIcon />}
                onClick={() => onEquip(skill)}
                disabled={!allRequirementsMet}
              >
                {skill.isEquipped ? 'Unequip' : 'Equip'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default SkillDetails;
