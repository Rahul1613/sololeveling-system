import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LockOpen as UnlockIcon,
  Lock as LockIcon,
  Stars as SkillPointIcon
} from '@mui/icons-material';
import { fetchSkillTree, unlockSkill, setSelectedSkill } from '../../redux/slices/skillsSlice';
import { HolographicCard } from '../HolographicUI';
import voiceService from '../../utils/voiceService';

// Styled components
const SkillTreeContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  overflowX: 'auto'
}));

const SkillNode = styled(Paper)(({ theme, type, unlocked, unlockable }) => ({
  padding: theme.spacing(2),
  width: 180,
  height: 160,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: unlockable ? 'pointer' : 'default',
  transition: 'all 0.3s ease',
  background: `linear-gradient(135deg, 
    ${unlocked ? 
      (type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
       type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
       'rgba(244, 67, 54, 0.2)') : 
      'rgba(50, 50, 50, 0.2)'} 0%, 
    rgba(20, 20, 30, 0.9) 100%)`,
  border: `1px solid ${unlocked ? 
    (type === 'active' ? 'rgba(33, 150, 243, 0.7)' : 
     type === 'passive' ? 'rgba(76, 175, 80, 0.7)' : 
     'rgba(244, 67, 54, 0.7)') : 
    unlockable ? 'rgba(255, 215, 0, 0.5)' : 'rgba(100, 100, 100, 0.3)'}`,
  boxShadow: unlocked ? 
    `0 0 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
               type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
               'rgba(244, 67, 54, 0.5)'}` : 
    unlockable ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none',
  '&:hover': {
    transform: unlockable ? 'translateY(-5px)' : 'none',
    boxShadow: unlockable ? 
      '0 5px 15px rgba(255, 215, 0, 0.5)' : 
      unlocked ? 
        `0 0 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
                   type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
                   'rgba(244, 67, 54, 0.5)'}` : 
        'none'
  }
}));

const SkillIcon = styled(Box)(({ theme, type, unlocked }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, 
    ${unlocked ? 
      (type === 'active' ? '#2196F3' : 
       type === 'passive' ? '#4CAF50' : 
       '#F44336') : 
      '#757575'} 0%, 
    #121212 100%)`,
  boxShadow: unlocked ? 
    `0 0 10px ${type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
               type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
               'rgba(244, 67, 54, 0.5)'}` : 
    'none',
  marginBottom: theme.spacing(1)
}));

const SkillTypeChip = styled(Chip)(({ theme, type, unlocked }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  height: 20,
  fontSize: '0.6rem',
  backgroundColor: unlocked ? 
    (type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
     type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
     'rgba(244, 67, 54, 0.2)') : 
    'rgba(100, 100, 100, 0.2)',
  color: unlocked ? 
    (type === 'active' ? '#2196F3' : 
     type === 'passive' ? '#4CAF50' : 
     '#F44336') : 
    '#aaaaaa',
  border: `1px solid ${unlocked ? 
    (type === 'active' ? 'rgba(33, 150, 243, 0.5)' : 
     type === 'passive' ? 'rgba(76, 175, 80, 0.5)' : 
     'rgba(244, 67, 54, 0.5)') : 
    'rgba(100, 100, 100, 0.5)'}`
}));

const RequirementItem = styled(Box)(({ theme, met }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
  color: met ? '#4CAF50' : '#F44336'
}));

const SkillTree = () => {
  const dispatch = useDispatch();
  const { skillTree, loading, error, skillPoints } = useSelector((state) => state.skills);
  const [selectedSkill, setSelectedSkillLocal] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [unlockingSkill, setUnlockingSkill] = useState(false);
  
  useEffect(() => {
    dispatch(fetchSkillTree());
  }, [dispatch]);
  
  // Handle skill selection
  const handleSelectSkill = (skill) => {
    setSelectedSkillLocal(skill);
    setDetailsOpen(true);
    dispatch(setSelectedSkill(skill));
  };
  
  // Handle skill unlock
  const handleUnlockSkill = async () => {
    if (!selectedSkill || !selectedSkill.isUnlockable || selectedSkill.isUnlocked) return;
    
    setUnlockingSkill(true);
    try {
      await dispatch(unlockSkill(selectedSkill._id)).unwrap();
      voiceService.announce(`Skill ${selectedSkill.name} unlocked!`, 1);
      setDetailsOpen(false);
    } catch (error) {
      console.error('Failed to unlock skill:', error);
    } finally {
      setUnlockingSkill(false);
    }
  };
  
  // Render skill requirements
  const renderRequirements = (skill) => {
    if (!skill.requirementDetails || skill.requirementDetails.length === 0) {
      return <Typography variant="body2">No special requirements</Typography>;
    }
    
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Requirements:</Typography>
        {skill.requirementDetails.map((req, index) => (
          <RequirementItem key={index} met={req.met}>
            {req.type === 'level' && (
              <>
                <Typography variant="body2">
                  Level: {req.current}/{req.required}
                </Typography>
              </>
            )}
            {req.type === 'stat' && (
              <>
                <Typography variant="body2">
                  {req.stat.charAt(0).toUpperCase() + req.stat.slice(1)}: {req.current}/{req.required}
                </Typography>
              </>
            )}
            {req.type === 'quest' && (
              <>
                <Typography variant="body2">
                  Quest: {req.questName || 'Unknown Quest'} {req.met ? '(Completed)' : '(Incomplete)'}
                </Typography>
              </>
            )}
            {req.type === 'achievement' && (
              <>
                <Typography variant="body2">
                  Achievement: {req.achievementName || 'Unknown Achievement'} {req.met ? '(Unlocked)' : '(Locked)'}
                </Typography>
              </>
            )}
          </RequirementItem>
        ))}
      </Box>
    );
  };
  
  // Render the skill tree
  const renderSkillTree = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Error loading skill tree: {error}
        </Alert>
      );
    }
    
    if (!skillTree || Object.keys(skillTree).length === 0) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No skills available. Complete quests and level up to unlock skills.
        </Alert>
      );
    }
    
    // Render skill categories
    return (
      <Box>
        {/* Active Skills */}
        <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
          Active Skills
        </Typography>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {skillTree.active && skillTree.active.map((skill) => (
            <Grid item key={skill._id}>
              <SkillNode 
                type="active" 
                unlocked={skill.isUnlocked} 
                unlockable={skill.isUnlockable && !skill.isUnlocked}
                onClick={() => handleSelectSkill(skill)}
              >
                <SkillTypeChip 
                  label={skill.type.toUpperCase()} 
                  type="active" 
                  unlocked={skill.isUnlocked} 
                  size="small"
                />
                <SkillIcon type="active" unlocked={skill.isUnlocked}>
                  {skill.isUnlocked ? (
                    <Typography variant="h5" sx={{ color: 'white' }}>
                      {skill.name.charAt(0)}
                    </Typography>
                  ) : (
                    <LockIcon color="action" />
                  )}
                </SkillIcon>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: skill.isUnlocked ? 'white' : 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  {skill.name}
                </Typography>
                {skill.isUnlocked && (
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    Level {skill.level}/{skill.maxLevel}
                  </Typography>
                )}
                {!skill.isUnlocked && skill.isUnlockable && (
                  <Chip 
                    icon={<UnlockIcon />} 
                    label={`${skill.skillPointCost} SP`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </SkillNode>
            </Grid>
          ))}
        </Grid>
        
        {/* Passive Skills */}
        <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
          Passive Skills
        </Typography>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {skillTree.passive && skillTree.passive.map((skill) => (
            <Grid item key={skill._id}>
              <SkillNode 
                type="passive" 
                unlocked={skill.isUnlocked} 
                unlockable={skill.isUnlockable && !skill.isUnlocked}
                onClick={() => handleSelectSkill(skill)}
              >
                <SkillTypeChip 
                  label={skill.type.toUpperCase()} 
                  type="passive" 
                  unlocked={skill.isUnlocked} 
                  size="small"
                />
                <SkillIcon type="passive" unlocked={skill.isUnlocked}>
                  {skill.isUnlocked ? (
                    <Typography variant="h5" sx={{ color: 'white' }}>
                      {skill.name.charAt(0)}
                    </Typography>
                  ) : (
                    <LockIcon color="action" />
                  )}
                </SkillIcon>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: skill.isUnlocked ? 'white' : 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  {skill.name}
                </Typography>
                {skill.isUnlocked && (
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    Level {skill.level}/{skill.maxLevel}
                  </Typography>
                )}
                {!skill.isUnlocked && skill.isUnlockable && (
                  <Chip 
                    icon={<UnlockIcon />} 
                    label={`${skill.skillPointCost} SP`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </SkillNode>
            </Grid>
          ))}
        </Grid>
        
        {/* Ultimate Skills */}
        <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
          Ultimate Skills
        </Typography>
        <Grid container spacing={4}>
          {skillTree.ultimate && skillTree.ultimate.map((skill) => (
            <Grid item key={skill._id}>
              <SkillNode 
                type="ultimate" 
                unlocked={skill.isUnlocked} 
                unlockable={skill.isUnlockable && !skill.isUnlocked}
                onClick={() => handleSelectSkill(skill)}
              >
                <SkillTypeChip 
                  label={skill.type.toUpperCase()} 
                  type="ultimate" 
                  unlocked={skill.isUnlocked} 
                  size="small"
                />
                <SkillIcon type="ultimate" unlocked={skill.isUnlocked}>
                  {skill.isUnlocked ? (
                    <Typography variant="h5" sx={{ color: 'white' }}>
                      {skill.name.charAt(0)}
                    </Typography>
                  ) : (
                    <LockIcon color="action" />
                  )}
                </SkillIcon>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: skill.isUnlocked ? 'white' : 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  {skill.name}
                </Typography>
                {skill.isUnlocked && (
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    Level {skill.level}/{skill.maxLevel}
                  </Typography>
                )}
                {!skill.isUnlocked && skill.isUnlockable && (
                  <Chip 
                    icon={<UnlockIcon />} 
                    label={`${skill.skillPointCost} SP`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </SkillNode>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  return (
    <HolographicCard title="Skill Tree" height="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Available Skill Points: <span style={{ color: '#FFD700' }}>{skillPoints || 0}</span>
        </Typography>
        <Chip 
          icon={<SkillPointIcon />} 
          label={`${skillPoints || 0} SP`} 
          color="primary" 
          sx={{ 
            background: 'linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)',
            '& .MuiChip-label': { fontWeight: 'bold' }
          }}
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <SkillTreeContainer>
        {renderSkillTree()}
      </SkillTreeContainer>
      
      {/* Skill Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(10, 10, 15, 0.95) 100%)',
            border: '1px solid rgba(100, 100, 255, 0.2)',
            boxShadow: '0 0 20px rgba(80, 80, 255, 0.3)',
            minWidth: 400
          }
        }}
      >
        {selectedSkill && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(100, 100, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SkillIcon 
                  type={selectedSkill.type} 
                  unlocked={selectedSkill.isUnlocked}
                  sx={{ width: 40, height: 40, mr: 1 }}
                >
                  {selectedSkill.isUnlocked ? (
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {selectedSkill.name.charAt(0)}
                    </Typography>
                  ) : (
                    <LockIcon color="action" />
                  )}
                </SkillIcon>
                <Typography variant="h6">{selectedSkill.name}</Typography>
              </Box>
              <SkillTypeChip 
                label={selectedSkill.type.toUpperCase()} 
                type={selectedSkill.type} 
                unlocked={selectedSkill.isUnlocked} 
                size="small"
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedSkill.description || 'No description available.'}
                </Typography>
                
                {selectedSkill.isUnlocked ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Level: {selectedSkill.level}/{selectedSkill.maxLevel}
                    </Typography>
                    
                    {selectedSkill.effects && selectedSkill.effects.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Effects:</Typography>
                        {selectedSkill.effects.map((effect, index) => (
                          <Typography key={index} variant="body2">
                            {effect.stat}: {effect.value}{effect.isPercentage ? '%' : ''}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    
                    {selectedSkill.type !== 'passive' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          MP Cost: <span style={{ color: '#2196F3' }}>{selectedSkill.mpCost || 0}</span>
                        </Typography>
                        <Typography variant="body2">
                          Cooldown: <span style={{ color: '#F44336' }}>{selectedSkill.cooldown || 0}s</span>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box>
                    {renderRequirements(selectedSkill)}
                    
                    {selectedSkill.skillPointCost > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                          Cost to Unlock:
                        </Typography>
                        <Chip 
                          icon={<SkillPointIcon />} 
                          label={`${selectedSkill.skillPointCost} SP`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)} color="primary">
                Close
              </Button>
              {!selectedSkill.isUnlocked && selectedSkill.isUnlockable && (
                <Button 
                  onClick={handleUnlockSkill} 
                  color="primary" 
                  variant="contained"
                  disabled={unlockingSkill || skillPoints < selectedSkill.skillPointCost}
                  startIcon={unlockingSkill ? <CircularProgress size={20} /> : <UnlockIcon />}
                >
                  {unlockingSkill ? 'Unlocking...' : 'Unlock Skill'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </HolographicCard>
  );
};

export default SkillTree;
