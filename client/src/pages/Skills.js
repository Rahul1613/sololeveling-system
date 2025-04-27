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
import SkillsIcon from '@mui/icons-material/AutoFixHigh';
import HelpIcon from '@mui/icons-material/Help';

// Import components
import SkillCard from '../components/skills/SkillCard';
import SkillDetails from '../components/skills/SkillDetails';

// Import Redux actions
import {
  fetchUserSkills,
  fetchAvailableSkills,
  unlockSkill,
  equipSkill,
  unequipSkill,
  useSkill as activateSkill,
  levelUpSkill,
  setSelectedSkill,
  clearSelectedSkill
} from '../redux/slices/skillsSlice';

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

const SkillPointsBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 3,
  background: 'linear-gradient(90deg, rgba(123, 104, 238, 0.2) 0%, rgba(52, 152, 219, 0.2) 100%)',
  border: '1px solid rgba(123, 104, 238, 0.5)',
  boxShadow: '0 0 10px rgba(123, 104, 238, 0.2)',
  marginLeft: theme.spacing(2)
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

const SkillSlot = styled(Box)(({ theme, active, type }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: active ? 
    `linear-gradient(135deg, 
      ${type === 'active' ? 'rgba(33, 150, 243, 0.3)' : 
        type === 'passive' ? 'rgba(76, 175, 80, 0.3)' : 
        'rgba(244, 67, 54, 0.3)'} 0%, 
      rgba(20, 20, 30, 0.8) 100%)` : 
    'rgba(30, 40, 60, 0.3)',
  border: `2px solid ${active ? 
    (type === 'active' ? 'rgba(33, 150, 243, 0.7)' : 
     type === 'passive' ? 'rgba(76, 175, 80, 0.7)' : 
     'rgba(244, 67, 54, 0.7)') : 
    'rgba(255, 255, 255, 0.1)'}`,
  boxShadow: active ? 
    `0 0 10px ${type === 'active' ? 'rgba(33, 150, 243, 0.3)' : 
               type === 'passive' ? 'rgba(76, 175, 80, 0.3)' : 
               'rgba(244, 67, 54, 0.3)'}` : 
    'none',
  margin: theme.spacing(0, 1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: active ? 
      `0 3px 15px ${type === 'active' ? 'rgba(33, 150, 243, 0.4)' : 
                   type === 'passive' ? 'rgba(76, 175, 80, 0.4)' : 
                   'rgba(244, 67, 54, 0.4)'}` : 
      '0 3px 10px rgba(255, 255, 255, 0.1)'
  }
}));

const SkillsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    userSkills, 
    availableSkills, 
    equippedSkills,
    loading, 
    error, 
    skillPoints,
    maxEquippedSkills,
    selectedSkill
  } = useSelector(state => state.skills);
  
  const { user } = useSelector(state => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Fetch skills on mount
  useEffect(() => {
    dispatch(fetchUserSkills());
    dispatch(fetchAvailableSkills());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle skill selection
  const handleSelectSkill = (skill) => {
    dispatch(setSelectedSkill(skill));
    setDetailsOpen(true);
  };
  
  // Handle skill details close
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => {
      dispatch(clearSelectedSkill());
    }, 300);
  };
  
  // Handle skill unlock
  const handleUnlockSkill = (skillId) => {
    dispatch(unlockSkill(skillId));
  };
  
  // Handle skill equip/unequip
  const handleEquipSkill = (skill) => {
    if (skill.isEquipped) {
      dispatch(unequipSkill(skill._id));
    } else {
      // Find the first available slot
      let slotIndex = 0;
      while (
        slotIndex < maxEquippedSkills && 
        equippedSkills.some(s => s.slotIndex === slotIndex)
      ) {
        slotIndex++;
      }
      
      // If no slots available, use slot 0
      if (slotIndex >= maxEquippedSkills) {
        slotIndex = 0;
      }
      
      dispatch(equipSkill({ skillId: skill._id, slotIndex }));
    }
  };
  
  // Handle skill use
  const handleUseSkill = (skill) => {
    dispatch(activateSkill({ skillId: skill._id }));
  };
  
  // Handle skill level up
  const handleLevelUpSkill = (skill) => {
    dispatch(levelUpSkill(skill._id));
  };
  
  // Check if user can level up a skill
  const canLevelUpSkill = (skill) => {
    if (skill.level >= skill.maxLevel) return false;
    
    const skillPointCost = Math.ceil(skill.skillPointCost * 0.5 * skill.level) || 1;
    return skillPoints >= skillPointCost;
  };
  
  // Refresh skills
  const handleRefresh = () => {
    dispatch(fetchUserSkills());
    dispatch(fetchAvailableSkills());
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Skills
          </Typography>
          <SkillPointsBadge>
            <SkillsIcon sx={{ mr: 1, color: '#7B68EE' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Skill Points: <span style={{ color: '#7B68EE' }}>{skillPoints}</span>
            </Typography>
          </SkillPointsBadge>
        </Box>
        
        <Box>
          <Tooltip title="Refresh Skills">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Skills Help">
            <IconButton>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Equipped Skills */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Equipped Skills ({equippedSkills.length}/{maxEquippedSkills})
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2
            }}>
              {Array.from({ length: maxEquippedSkills }).map((_, index) => {
                const skill = equippedSkills.find(s => s.slotIndex === index);
                
                return (
                  <Tooltip 
                    key={index}
                    title={skill ? `${skill.name} (Level ${skill.level})` : 'Empty Slot'}
                  >
                    <SkillSlot 
                      active={!!skill} 
                      type={skill?.type}
                      onClick={() => skill && handleSelectSkill(skill)}
                    >
                      {skill ? (
                        <Typography variant="h5" sx={{ color: 'white' }}>
                          {skill.name.charAt(0)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {index + 1}
                        </Typography>
                      )}
                    </SkillSlot>
                  </Tooltip>
                );
              })}
            </Box>
            
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Click on a skill to view details or manage it
            </Typography>
          </StyledPaper>
        </Grid>
        
        {/* Skills Tabs */}
        <Grid item xs={12}>
          <StyledPaper>
            <StyledTabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              centered={!isMobile}
            >
              <Tab label="My Skills" />
              <Tab label="Available Skills" />
              <Tab 
                label={
                  <Badge 
                    color="primary" 
                    badgeContent={availableSkills.filter(skill => {
                      return skill.requirements.every(req => req.met);
                    }).length}
                    max={99}
                  >
                    Unlock New
                  </Badge>
                } 
              />
            </StyledTabs>
            
            {/* My Skills Tab */}
            {tabValue === 0 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userSkills.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      You haven't unlocked any skills yet
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setTabValue(2)}
                    >
                      Unlock Your First Skill
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {userSkills.map(skill => (
                      <Grid item xs={12} sm={6} md={4} key={skill._id}>
                        <SkillCard
                          skill={skill}
                          onSelect={handleSelectSkill}
                          onEquip={handleEquipSkill}
                          onUse={handleUseSkill}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
            
            {/* Available Skills Tab */}
            {tabValue === 1 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : availableSkills.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      No more skills available to unlock
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      You've discovered all available skills!
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {availableSkills.map(skill => (
                      <Grid item xs={12} sm={6} md={4} key={skill._id}>
                        <StyledPaper sx={{ 
                          p: 2, 
                          position: 'relative',
                          opacity: skill.requirements.every(req => req.met) ? 1 : 0.7,
                          transition: 'all 0.3s ease'
                        }}>
                          {!skill.requirements.every(req => req.met) && (
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
                          
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <Box sx={{ 
                              width: 50, 
                              height: 50, 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `linear-gradient(135deg, 
                                ${skill.type === 'active' ? '#2196F3' : 
                                  skill.type === 'passive' ? '#4CAF50' : 
                                  '#F44336'} 0%, 
                                #121212 100%)`,
                              mr: 2
                            }}>
                              <Typography variant="h5" sx={{ color: 'white' }}>
                                {skill.name.charAt(0)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {skill.name}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {skill.description}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'primary.light' }}>
                              Cost: <span style={{ fontWeight: 'bold' }}>{skill.skillPointCost} SP</span>
                            </Typography>
                            
                            <Box>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleSelectSkill(skill)}
                                  sx={{ mr: 1 }}
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={
                                  !skill.requirements.every(req => req.met) || 
                                  skillPoints < skill.skillPointCost
                                }
                                onClick={() => handleUnlockSkill(skill._id)}
                              >
                                Unlock
                              </Button>
                            </Box>
                          </Box>
                        </StyledPaper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
            
            {/* Unlock New Tab */}
            {tabValue === 2 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Skills Available to Unlock
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        These skills meet all requirements and can be unlocked with your skill points.
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {availableSkills
                        .filter(skill => skill.requirements.every(req => req.met))
                        .map(skill => (
                          <Grid item xs={12} sm={6} md={4} key={skill._id}>
                            <StyledPaper sx={{ 
                              p: 2, 
                              background: 'linear-gradient(135deg, rgba(30, 40, 70, 0.7) 0%, rgba(10, 20, 40, 0.7) 100%)',
                              border: skillPoints >= skill.skillPointCost ? 
                                '1px solid rgba(123, 104, 238, 0.5)' : 
                                '1px solid rgba(255, 0, 0, 0.3)',
                              boxShadow: skillPoints >= skill.skillPointCost ?
                                '0 0 15px rgba(123, 104, 238, 0.2)' :
                                'none'
                            }}>
                              <Box sx={{ display: 'flex', mb: 2 }}>
                                <Box sx={{ 
                                  width: 50, 
                                  height: 50, 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: `linear-gradient(135deg, 
                                    ${skill.type === 'active' ? '#2196F3' : 
                                      skill.type === 'passive' ? '#4CAF50' : 
                                      '#F44336'} 0%, 
                                    #121212 100%)`,
                                  mr: 2
                                }}>
                                  <Typography variant="h5" sx={{ color: 'white' }}>
                                    {skill.name.charAt(0)}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {skill.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: skill.type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
                                            skill.type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
                                            'rgba(244, 67, 54, 0.2)',
                                    color: skill.type === 'active' ? '#2196F3' : 
                                           skill.type === 'passive' ? '#4CAF50' : 
                                           '#F44336',
                                    mb: 0.5
                                  }}>
                                    {skill.type.toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {skill.description}
                              </Typography>
                              
                              <Divider sx={{ mb: 2, bgcolor: 'rgba(100, 120, 255, 0.2)' }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ 
                                  color: skillPoints >= skill.skillPointCost ? 'primary.light' : 'error.light'
                                }}>
                                  Cost: <span style={{ fontWeight: 'bold' }}>{skill.skillPointCost} SP</span>
                                </Typography>
                                
                                <Box>
                                  <Tooltip title="View Details">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleSelectSkill(skill)}
                                      sx={{ mr: 1 }}
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={skillPoints < skill.skillPointCost}
                                    onClick={() => handleUnlockSkill(skill._id)}
                                  >
                                    Unlock
                                  </Button>
                                </Box>
                              </Box>
                            </StyledPaper>
                          </Grid>
                        ))}
                    </Grid>
                    
                    {availableSkills.filter(skill => skill.requirements.every(req => req.met)).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                          No skills available to unlock
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          You need to meet the requirements for other skills first.
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 4, mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Locked Skills
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        These skills require you to meet certain requirements before unlocking.
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {availableSkills
                        .filter(skill => !skill.requirements.every(req => req.met))
                        .map(skill => (
                          <Grid item xs={12} sm={6} md={4} key={skill._id}>
                            <StyledPaper sx={{ 
                              p: 2, 
                              opacity: 0.7,
                              position: 'relative'
                            }}>
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
                              
                              <Box sx={{ display: 'flex', mb: 2 }}>
                                <Box sx={{ 
                                  width: 50, 
                                  height: 50, 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: `linear-gradient(135deg, 
                                    ${skill.type === 'active' ? '#2196F3' : 
                                      skill.type === 'passive' ? '#4CAF50' : 
                                      '#F44336'} 0%, 
                                    #121212 100%)`,
                                  mr: 2
                                }}>
                                  <Typography variant="h5" sx={{ color: 'white' }}>
                                    {skill.name.charAt(0)}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {skill.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: skill.type === 'active' ? 'rgba(33, 150, 243, 0.2)' : 
                                            skill.type === 'passive' ? 'rgba(76, 175, 80, 0.2)' : 
                                            'rgba(244, 67, 54, 0.2)',
                                    color: skill.type === 'active' ? '#2196F3' : 
                                           skill.type === 'passive' ? '#4CAF50' : 
                                           '#F44336',
                                    mb: 0.5
                                  }}>
                                    {skill.type.toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                mb: 2
                              }}>
                                Requirements not met
                              </Typography>
                              
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                fullWidth
                                onClick={() => handleSelectSkill(skill)}
                              >
                                View Requirements
                              </Button>
                            </StyledPaper>
                          </Grid>
                        ))}
                    </Grid>
                  </>
                )}
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
      
      {/* Skill Details Dialog */}
      {selectedSkill && (
        <SkillDetails
          open={detailsOpen}
          onClose={handleCloseDetails}
          skill={selectedSkill}
          onEquip={handleEquipSkill}
          onUse={handleUseSkill}
          onLevelUp={handleLevelUpSkill}
          canLevelUp={canLevelUpSkill(selectedSkill)}
          userStats={user}
        />
      )}
    </Container>
  );
};

export default SkillsPage;
