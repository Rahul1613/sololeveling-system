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
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ShieldIcon from '@mui/icons-material/Shield';
import ItemImage from '../marketplace/ItemImage';
import { getSkillsByRank, getSkillsByType } from '../../utils/marketplaceSkillsData';
import { equipSkill } from '../../redux/slices/skillsSlice';

// Styled components
const SkillsContainer = styled(Box)(({ theme }) => ({
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

const SkillsTitle = styled(Typography)(({ theme }) => ({
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

const SkillCard = styled(Card)(({ theme }) => ({
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

const TypeChip = styled(Chip)(({ theme, skilltype }) => ({
  backgroundColor: skilltype === 'active' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(76, 175, 80, 0.2)',
  color: skilltype === 'active' ? '#2196F3' : '#4CAF50',
  border: `1px solid ${skilltype === 'active' ? 'rgba(33, 150, 243, 0.5)' : 'rgba(76, 175, 80, 0.5)'}`,
  marginRight: theme.spacing(1),
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

const MarketplaceSkills = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { userSkills, equippedSkills } = useSelector(state => state.skills);
  
  const [skills, setSkills] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(true);

  // Get user rank
  const userRank = user?.rank || 'E';

  useEffect(() => {
    // Load skills based on user rank
    const availableSkills = getSkillsByRank(userRank);
    setSkills(availableSkills);
    setLoading(false);
  }, [userRank]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Filter skills based on tab
    if (newValue === 0) {
      // All skills
      setSkills(getSkillsByRank(userRank));
    } else if (newValue === 1) {
      // Active skills
      setSkills(getSkillsByType('active').filter(skill => {
        const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
        const userRankIndex = rankOrder.indexOf(userRank);
        const skillRankIndex = rankOrder.indexOf(skill.rankRequired);
        return skillRankIndex <= userRankIndex;
      }));
    } else if (newValue === 2) {
      // Passive skills
      setSkills(getSkillsByType('passive').filter(skill => {
        const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
        const userRankIndex = rankOrder.indexOf(userRank);
        const skillRankIndex = rankOrder.indexOf(skill.rankRequired);
        return skillRankIndex <= userRankIndex;
      }));
    }
  };

  const handleBuySkill = (skill) => {
    // Check if user has enough gold
    if (user?.gold < skill.price) {
      setSnackbar({
        open: true,
        message: 'Not enough gold to purchase this skill',
        severity: 'error'
      });
      return;
    }

    // Check if skill is already owned
    const isOwned = userSkills?.some(userSkill => userSkill._id === skill._id);
    if (isOwned) {
      setSnackbar({
        open: true,
        message: 'You already own this skill',
        severity: 'info'
      });
      return;
    }

    // In a real app, we would call the API to buy the skill
    // For now, we'll just show a success message
    setSnackbar({
      open: true,
      message: `Successfully purchased ${skill.name}!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const isSkillEquippable = (skill) => {
    // Check if the skill is already owned
    const isOwned = userSkills?.some(userSkill => userSkill._id === skill._id);
    
    // Check if user has reached the maximum number of equipped skills
    const maxSkills = 5; // Assuming a maximum of 5 skills can be equipped
    const equippedCount = equippedSkills?.length || 0;
    
    return isOwned && equippedCount < maxSkills;
  };

  const handleEquipSkill = (skill) => {
    // Check if skill is already equipped
    const isEquipped = equippedSkills?.some(equippedSkill => equippedSkill._id === skill._id);
    if (isEquipped) {
      setSnackbar({
        open: true,
        message: 'This skill is already equipped',
        severity: 'info'
      });
      return;
    }

    // Find the next available slot
    const maxSlots = 5;
    const usedSlots = equippedSkills?.map(skill => skill.slotIndex) || [];
    let nextSlot = -1;
    
    for (let i = 0; i < maxSlots; i++) {
      if (!usedSlots.includes(i)) {
        nextSlot = i;
        break;
      }
    }

    if (nextSlot === -1) {
      setSnackbar({
        open: true,
        message: 'All skill slots are full',
        severity: 'error'
      });
      return;
    }

    // In a real app, we would dispatch the equipSkill action
    // dispatch(equipSkill({ skillId: skill._id, slotIndex: nextSlot }));
    
    // For now, just show a success message
    setSnackbar({
      open: true,
      message: `Equipped ${skill.name} in slot ${nextSlot + 1}`,
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <SkillsContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#5FD1F9', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
            Loading skills data...
          </Typography>
        </Box>
      </SkillsContainer>
    );
  }

  return (
    <SkillsContainer>
      <SkillsTitle variant="h4">
        Skills Marketplace
      </SkillsTitle>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: '#eaf6ff', mb: 2 }}>
          Enhance your abilities with powerful skills. Your current rank ({userRank}) determines which skills you can purchase.
        </Typography>
        
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Skills" />
          <Tab label="Active Skills" />
          <Tab label="Passive Skills" />
        </StyledTabs>
      </Box>
      
      <Grid container spacing={4} sx={{ mb: 2 }}>
        {skills.map((skill, index) => (
          <Grid item xs={12} sm={6} key={skill._id || index} sx={{ display: 'flex', justifyContent: 'center' }}>
            <SkillCard>
              <Box sx={{ 
                height: 140, 
                position: 'relative',
                background: `linear-gradient(to bottom, 
                  ${skill.type === 'active' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(76, 175, 80, 0.3)'} 0%, 
                  rgba(0, 0, 0, 0.7) 100%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
                  fontWeight: 'bold',
                  zIndex: 2
                }}>
                  {skill.name}
                </Typography>
                <Box sx={{ 
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 2
                }}>
                  <TypeChip 
                    label={skill.type} 
                    skilltype={skill.type} 
                    size="small" 
                    icon={skill.type === 'active' ? <FlashOnIcon /> : <ShieldIcon />}
                  />
                </Box>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  zIndex: 2
                }}>
                  <RarityChip 
                    label={skill.rarity} 
                    rarity={skill.rarity} 
                    size="small" 
                  />
                </Box>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  zIndex: 2
                }}>
                  <Chip 
                    label={`Rank ${skill.rankRequired}`} 
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: '#eaf6ff',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 2, pb: 0 }}>
                <Typography variant="body2" sx={{ 
                  color: '#eaf6ff', 
                  mb: 2, 
                  height: '2.4em', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical' 
                }}>
                  {skill.description}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  {skill.effects.slice(0, 2).map((effect, idx) => (
                    <Typography key={idx} variant="caption" sx={{ 
                      display: 'block',
                      color: '#eaf6ff',
                      opacity: 0.8
                    }}>
                      • {effect.description}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                  {skill.price} G
                </Typography>
                <Box>
                  <StyledButton 
                    size="small" 
                    onClick={() => handleBuySkill(skill)}
                    disabled={userSkills?.some(userSkill => userSkill._id === skill._id)}
                  >
                    {userSkills?.some(userSkill => userSkill._id === skill._id) ? 'Owned' : 'Buy'}
                  </StyledButton>
                  {userSkills?.some(userSkill => userSkill._id === skill._id) && (
                    <StyledButton 
                      size="small" 
                      onClick={() => handleEquipSkill(skill)}
                      disabled={!isSkillEquippable(skill)}
                      sx={{ ml: 1 }}
                    >
                      Equip
                    </StyledButton>
                  )}
                </Box>
              </CardActions>
            </SkillCard>
          </Grid>
        ))}
      </Grid>
      
      {skills.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
            No skills available for your current rank. Increase your rank to unlock more skills.
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
    </SkillsContainer>
  );
};

export default MarketplaceSkills;
