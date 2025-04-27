import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  CircularProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SkillCard from './SkillCard';
import SkillSlot from './SkillSlot';
import { HolographicCard } from '../HolographicUI';

// Styled components
const SkillsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const SkillsPanel = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
  // Mock data for development - remove when API is connected
  const mockSkills = [
    {
      id: '1',
      name: 'Shadow Strike',
      description: 'Strike your enemy with the power of shadows, dealing damage and reducing their defense.',
      type: 'active',
      level: 3,
      maxLevel: 10,
      experience: 75,
      experienceToNextLevel: 150,
      icon: 'shadow-strike.png',
      cooldown: 30,
      mpCost: 25,
      effects: [
        { stat: 'damage', value: 50, isPercentage: false },
        { stat: 'defense', value: -10, isPercentage: true }
      ],
      isEquipped: true,
      equipSlot: 'slot1',
      cooldownEnds: null
    },
    {
      id: '2',
      name: 'Arise',
      description: 'Resurrect a fallen enemy as your shadow soldier.',
      type: 'active',
      level: 1,
      maxLevel: 5,
      experience: 10,
      experienceToNextLevel: 100,
      icon: 'arise.png',
      cooldown: 300,
      mpCost: 100,
      effects: [],
      isEquipped: true,
      equipSlot: 'slot2',
      cooldownEnds: new Date(Date.now() + 120000) // 2 minutes from now
    },
    {
      id: '3',
      name: 'Shadow Monarch\'s Domain',
      description: 'Establish your domain, increasing all your stats and your shadows\' stats.',
      type: 'ultimate',
      level: 1,
      maxLevel: 3,
      experience: 0,
      experienceToNextLevel: 500,
      icon: 'domain.png',
      cooldown: 1800,
      mpCost: 200,
      effects: [
        { stat: 'strength', value: 20, isPercentage: true },
        { stat: 'agility', value: 20, isPercentage: true },
        { stat: 'intelligence', value: 20, isPercentage: true },
        { stat: 'vitality', value: 20, isPercentage: true },
        { stat: 'endurance', value: 20, isPercentage: true }
      ],
      isEquipped: true,
      equipSlot: 'ultimate',
      cooldownEnds: null
    },
    {
      id: '4',
      name: 'Shadow Resistance',
      description: 'Passive resistance to dark magic and shadow damage.',
      type: 'passive',
      level: 2,
      maxLevel: 5,
      experience: 50,
      experienceToNextLevel: 120,
      icon: 'resistance.png',
      cooldown: 0,
      mpCost: 0,
      effects: [
        { stat: 'shadow resistance', value: 30, isPercentage: true }
      ],
      isEquipped: true,
      equipSlot: 'passive1',
      cooldownEnds: null
    },
    {
      id: '5',
      name: 'Shadow Step',
      description: 'Teleport a short distance through the shadows.',
      type: 'active',
      level: 2,
      maxLevel: 5,
      experience: 80,
      experienceToNextLevel: 150,
      icon: 'shadow-step.png',
      cooldown: 60,
      mpCost: 30,
      effects: [
        { stat: 'speed', value: 50, isPercentage: true, duration: 5 }
      ],
      isEquipped: false,
      equipSlot: null,
      cooldownEnds: null
    }
  ];
  
  // Handle skill selection
  function handleSelectSkill(skill) {
    setSelectedSkill(skill);
    setDetailsOpen(true);
  };
  
  // Handle skill equip
  function handleEquipSkill(skill, slot) {
    // Implementation will be added when connected to real state
    console.log('Equipping skill', skill.name, 'to slot', slot);
  };
  
  // Handle skill use
  function handleUseSkill(skill) {
    // Implementation will be added when connected to real state
    console.log('Using skill', skill.name);
  };
  
  // Format time remaining for cooldown
  function formatTimeRemaining(date) {
    if (!date) return '0:00';
    
    const now = new Date();
    const diff = date - now;
    
    if (diff <= 0) return '0:00';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate cooldown percentage
  function calculateCooldownPercentage(skill) {
    if (!skill.cooldownEnds) return 0;
    
    const now = new Date();
    const end = new Date(skill.cooldownEnds);
    const diff = end - now;
    
    if (diff <= 0) return 0;
    
    return (diff / (skill.cooldown * 1000)) * 100;
  };
  
  // Filter skills by type
  function getFilteredSkills() {
    return mockSkills.filter(skill => activeTab === 'all' || skill.type === activeTab);
  };
  
  // Get equipped skills
  function getEquippedSkills() {
    const equipped = {
      slot1: mockSkills.find(s => s.isEquipped && s.equipSlot === 'slot1'),
      slot2: mockSkills.find(s => s.isEquipped && s.equipSlot === 'slot2'),
      slot3: mockSkills.find(s => s.isEquipped && s.equipSlot === 'slot3'),
      slot4: mockSkills.find(s => s.isEquipped && s.equipSlot === 'slot4'),
      ultimate: mockSkills.find(s => s.isEquipped && s.equipSlot === 'ultimate'),
      passive1: mockSkills.find(s => s.isEquipped && s.equipSlot === 'passive1'),
      passive2: mockSkills.find(s => s.isEquipped && s.equipSlot === 'passive2')
    };
    
    return equipped;
  };
  
  const equippedSkills = getEquippedSkills();
  
  return (
    <SkillsContainer>
      <HolographicCard title="Skills" height="auto">
        {/* Skills Loadout */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Equipped Skills</Typography>
          <Grid container spacing={2}>
            {/* Active Skills */}
            <Grid item xs={12} md={8}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 2,
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.2)'
              }}>
                <SkillSlot 
                  skill={equippedSkills.slot1} 
                  slotName="1" 
                  onUse={handleUseSkill}
                  onSelect={handleSelectSkill}
                />
                <SkillSlot 
                  skill={equippedSkills.slot2} 
                  slotName="2" 
                  onUse={handleUseSkill}
                  onSelect={handleSelectSkill}
                />
                <SkillSlot 
                  skill={equippedSkills.slot3} 
                  slotName="3" 
                  onUse={handleUseSkill}
                  onSelect={handleSelectSkill}
                />
                <SkillSlot 
                  skill={equippedSkills.slot4} 
                  slotName="4" 
                  onUse={handleUseSkill}
                  onSelect={handleSelectSkill}
                />
              </Box>
            </Grid>
            
            {/* Passive Skills and Ultimate */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.2)'
              }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Passive Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <SkillSlot 
                    skill={equippedSkills.passive1} 
                    slotName="P1" 
                    isPassive
                    onSelect={handleSelectSkill}
                  />
                  <SkillSlot 
                    skill={equippedSkills.passive2} 
                    slotName="P2" 
                    isPassive
                    onSelect={handleSelectSkill}
                  />
                </Box>
                
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Ultimate Skill
                </Typography>
                <SkillSlot 
                  skill={equippedSkills.ultimate} 
                  slotName="ULT" 
                  isUltimate
                  onUse={handleUseSkill}
                  onSelect={handleSelectSkill}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Skills Library */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6">Skills Library</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant={activeTab === 'all' ? 'contained' : 'outlined'} 
                size="small"
                onClick={() => setActiveTab('all')}
              >
                All
              </Button>
              <Button 
                variant={activeTab === 'active' ? 'contained' : 'outlined'} 
                size="small"
                onClick={() => setActiveTab('active')}
              >
                Active
              </Button>
              <Button 
                variant={activeTab === 'passive' ? 'contained' : 'outlined'} 
                size="small"
                onClick={() => setActiveTab('passive')}
              >
                Passive
              </Button>
              <Button 
                variant={activeTab === 'ultimate' ? 'contained' : 'outlined'} 
                size="small"
                onClick={() => setActiveTab('ultimate')}
              >
                Ultimate
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            {getFilteredSkills().map(skill => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={skill.id}>
                <SkillCard 
                  skill={skill} 
                  onSelect={handleSelectSkill}
                  onEquip={handleEquipSkill}
                  onUse={handleUseSkill}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </HolographicCard>
      
      {/* Skill Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'linear-gradient(rgba(25, 25, 35, 0.8), rgba(10, 10, 20, 0.9))',
            border: '1px solid rgba(100, 100, 255, 0.2)',
            boxShadow: '0 0 20px rgba(80, 80, 255, 0.3)'
          }
        }}
      >
        {selectedSkill && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h5">
                {selectedSkill.name}
              </Typography>
              <Chip 
                label={selectedSkill.type.charAt(0).toUpperCase() + selectedSkill.type.slice(1)} 
                color={
                  selectedSkill.type === 'active' ? 'primary' :
                  selectedSkill.type === 'passive' ? 'secondary' : 'error'
                }
                size="small"
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%',
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.2)'
                  }}>
                    <Box sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%',
                      bgcolor: 'primary.dark',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 0 20px rgba(80, 80, 255, 0.5)',
                      position: 'relative'
                    }}>
                      <Typography variant="h4" sx={{ color: 'white' }}>
                        {selectedSkill.name.charAt(0)}
                      </Typography>
                      {selectedSkill.cooldownEnds && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          overflow: 'hidden'
                        }}>
                          <CircularProgress
                            variant="determinate"
                            value={calculateCooldownPercentage(selectedSkill)}
                            size={120}
                            thickness={4}
                            sx={{
                              color: 'rgba(255, 0, 0, 0.5)',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          <Box sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {formatTimeRemaining(selectedSkill.cooldownEnds)}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedSkill.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Level</Typography>
                      <Typography variant="body1">
                        {selectedSkill.level} / {selectedSkill.maxLevel}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>MP Cost</Typography>
                      <Typography variant="body1" sx={{ color: '#2196F3' }}>
                        {selectedSkill.mpCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Cooldown</Typography>
                      <Typography variant="body1">
                        {selectedSkill.cooldown} seconds
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Status</Typography>
                      <Typography variant="body1" sx={{ 
                        color: selectedSkill.cooldownEnds ? 'error.main' : 'success.main' 
                      }}>
                        {selectedSkill.cooldownEnds ? 'On Cooldown' : 'Ready'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {/* Experience Bar */}
                  {selectedSkill.level < selectedSkill.maxLevel && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Experience
                        </Typography>
                        <Typography variant="body2">
                          {selectedSkill.experience} / {selectedSkill.experienceToNextLevel}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(selectedSkill.experience / selectedSkill.experienceToNextLevel) * 100}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #7B68EE 0%, #4CAF50 100%)'
                          }
                        }}
                      />
                    </Box>
                  )}
                  
                  {/* Effects */}
                  {selectedSkill.effects.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Effects
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedSkill.effects.map((effect, index) => (
                          <Grid item xs={6} key={index}>
                            <Chip 
                              label={`${effect.stat}: ${effect.value > 0 ? '+' : ''}${effect.value}${effect.isPercentage ? '%' : ''}`} 
                              size="small"
                              sx={{ 
                                bgcolor: effect.value > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                color: effect.value > 0 ? '#4CAF50' : '#F44336',
                                border: `1px solid ${effect.value > 0 ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`
                              }}
                            />
                            {effect.duration && (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                                Duration: {effect.duration} seconds
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
              {!selectedSkill.isEquipped ? (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    // Logic to equip skill
                    setDetailsOpen(false);
                  }}
                  disabled={selectedSkill.level === 0}
                >
                  Equip Skill
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => {
                    // Logic to unequip skill
                    setDetailsOpen(false);
                  }}
                >
                  Unequip Skill
                </Button>
              )}
              {selectedSkill.type !== 'passive' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    handleUseSkill(selectedSkill);
                    setDetailsOpen(false);
                  }}
                  disabled={selectedSkill.cooldownEnds !== null || selectedSkill.level === 0 || !selectedSkill.isEquipped}
                >
                  Use Skill
                </Button>
              )}
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SkillsContainer>
  );
};

export default SkillsPanel;
