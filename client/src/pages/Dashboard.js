import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tab,
  Tabs,
  Chip,
  Divider,
  Badge,
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Assignment as QuestIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  People as ShadowIcon,
  ArrowForward as ArrowIcon,
  Leaderboard as LeaderboardIcon,
  Notifications as NotificationIcon,
  VolumeUp as VolumeIcon,
  AutoFixHigh as SkillsIcon,
  EmojiEvents as TitlesIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as AccessTimeIcon,
  Whatshot as StreakIcon
} from '@mui/icons-material';

// Import holographic UI components
import { HolographicCard, StatusWindow } from '../components/HolographicUI';
import GlobalRanking from '../components/Leaderboard/GlobalRanking';
import SkillsPanel from '../components/skills/SkillsPanel';
import SkillTree from '../components/skills/SkillTree';
import TitlesPanel from '../components/titles/TitlesPanel';
import HabitTracker from '../components/habits/HabitTracker';
import voiceService from '../utils/voiceService';
import userService from '../api/userService';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import ShadowExtraction from '../components/shadows/ShadowExtraction';

// Mock data for features that haven't been fully implemented yet
const mockSkills = [
  { id: 'skill-1', name: 'Basic Strength', level: 3, maxLevel: 5, description: 'Increases strength stat by 10% per level', icon: '💪', unlocked: true },
  { id: 'skill-2', name: 'Enhanced Agility', level: 2, maxLevel: 5, description: 'Increases agility stat by 10% per level', icon: '🏃', unlocked: true },
  { id: 'skill-3', name: 'Mental Focus', level: 0, maxLevel: 5, description: 'Increases intelligence stat by 10% per level', icon: '🧠', unlocked: false, requiredLevel: 15 },
  { id: 'skill-4', name: 'Iron Body', level: 0, maxLevel: 5, description: 'Increases endurance stat by 10% per level', icon: '🛡️', unlocked: false, requiredLevel: 20 },
  { id: 'skill-5', name: 'Fortune Finder', level: 0, maxLevel: 5, description: 'Increases luck stat by 10% per level', icon: '🍀', unlocked: false, requiredLevel: 25 }
];

const mockTitles = [
  { id: 'title-1', name: 'Novice Hunter', description: 'Completed 10 quests', acquired: true, bonus: '+5% XP from quests' },
  { id: 'title-2', name: 'Shadow Master', description: 'Extracted 5 shadows', acquired: true, bonus: '+10% shadow strength' },
  { id: 'title-3', name: 'Dungeon Conqueror', description: 'Completed 5 dungeons', acquired: false, bonus: '+15% dungeon rewards' },
  { id: 'title-4', name: 'Stat Optimizer', description: 'Reach 50 in any stat', acquired: false, bonus: '+5% to all stats' },
  { id: 'title-5', name: 'Solo Leveler', description: 'Reach level 50', acquired: false, bonus: 'Unlock special skill tree' }
];

const mockDungeonKeys = [
  { id: 'key-1', name: 'E-Rank Dungeon Key', rank: 'E', count: 3, cooldown: 0, description: 'Allows entry to E-Rank dungeons' },
  { id: 'key-2', name: 'D-Rank Dungeon Key', rank: 'D', count: 1, cooldown: 0, description: 'Allows entry to D-Rank dungeons' },
  { id: 'key-3', name: 'C-Rank Dungeon Key', rank: 'C', count: 0, cooldown: 12, description: 'Allows entry to C-Rank dungeons' },
  { id: 'key-4', name: 'B-Rank Dungeon Key', rank: 'B', count: 0, cooldown: 24, description: 'Allows entry to B-Rank dungeons' },
  { id: 'key-5', name: 'A-Rank Dungeon Key', rank: 'A', count: 0, cooldown: 48, description: 'Allows entry to A-Rank dungeons' },
  { id: 'key-6', name: 'S-Rank Dungeon Key', rank: 'S', count: 0, cooldown: 72, description: 'Allows entry to S-Rank dungeons' }
];

const StatBar = ({ label, value, max, color }) => (
  <Box sx={{ mb: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
      <Typography sx={{ fontSize: 13, color: color || '#4eafe9', fontWeight: 700, letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#e0e0e0', fontWeight: 500 }}>
        {value}/{max}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={(value / max) * 100}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: color || '#4eafe9',
          boxShadow: `0 0 10px ${color || '#4eafe9'}`
        }
      }}
    />
  </Box>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [skills, setSkills] = useState([]);
  const [titles, setTitles] = useState([]);
  const [dungeonKeys, setDungeonKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize voice service
  useEffect(() => {
    try {
      voiceService.init();
    } catch (error) {
      console.error('Error initializing voice service:', error);
    }
  }, []);
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchUserData();
    }
  }, [user, navigate]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user._id) {
        throw new Error('User not found');
      }
      
      // Fetch skills, titles, and dungeon keys from user service
      const [skillsData, titlesData, dungeonKeysData] = await Promise.all([
        userService.getUserSkills(user._id),
        userService.getUserTitles(user._id),
        userService.getUserDungeonKeys(user._id)
      ]);
      
      setSkills(skillsData || mockSkills);
      setTitles(titlesData || mockTitles);
      setDungeonKeys(dungeonKeysData || mockDungeonKeys);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
      
      // Fall back to mock data if API calls fail
      setSkills(mockSkills);
      setTitles(mockTitles);
      setDungeonKeys(mockDungeonKeys);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate experience percentage
  const calculateExpPercentage = () => {
    if (!user) return 0;
    
    try {
      const totalExpForLevel = (user.experience || 0) + (user.experienceToNextLevel || 100);
      return Math.min((user.experience || 0) / Math.max(totalExpForLevel, 1) * 100, 100);
    } catch (error) {
      console.error('Error calculating experience percentage:', error);
      return 0;
    }
  };
  
  // Handle skill unlock
  const handleSkillUnlock = (skillId) => {
    try {
      const updatedSkills = skills.map(skill => {
        if (skill.id === skillId && !skill.unlocked && user && user.level >= skill.requiredLevel) {
          voiceService.announce(`Skill ${skill.name} unlocked!`, 2);
          return { ...skill, unlocked: true };
        }
        return skill;
      });
      
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Error unlocking skill:', error);
    }
  };
  
  // Handle skill level up
  const handleSkillLevelUp = (skillId) => {
    try {
      const updatedSkills = skills.map(skill => {
        if (skill.id === skillId && skill.unlocked && skill.level < skill.maxLevel) {
          voiceService.announce(`Skill ${skill.name} leveled up to level ${skill.level + 1}!`, 2);
          return { ...skill, level: skill.level + 1 };
        }
        return skill;
      });
      
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Error leveling up skill:', error);
    }
  };
  
  // Get rank color
  const getRankColor = (rank) => {
    try {
      switch (rank) {
        case 'S': return '#F44336'; // Red
        case 'A': return '#FF9800'; // Orange
        case 'B': return '#9C27B0'; // Purple
        case 'C': return '#2196F3'; // Blue
        case 'D': return '#4CAF50'; // Green
        case 'E': return '#9E9E9E'; // Gray
        case 'F': return '#795548'; // Brown
        default: return '#9E9E9E';
      }
    } catch (error) {
      console.error('Error getting rank color:', error);
      return '#9E9E9E';
    }
  };
  
  // Handle dungeon key use
  const handleUseKey = (keyId) => {
    try {
      const updatedKeys = dungeonKeys.map(key => {
        if (key.id === keyId && key.count > 0) {
          voiceService.announce(`Using ${key.name} to enter dungeon.`, 2);
          return { ...key, count: key.count - 1 };
        }
        return key;
      });
      
      setDungeonKeys(updatedKeys);
    } catch (error) {
      console.error('Error using dungeon key:', error);
    }
  };
  
  // Add audio ref for background music
  const bgAudioRef = useRef(null);
  const [arisePlayed, setArisePlayed] = useState(false);

  // Play bg music after arise animation (simulate arise animation completion)
  useEffect(() => {
    // If arise animation is handled elsewhere, replace this logic with actual arise animation completion event
    if (arisePlayed && bgAudioRef.current) {
      bgAudioRef.current.volume = 0.15;
      bgAudioRef.current.play();
    }
  }, [arisePlayed]);

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Please log in to view your dashboard</Typography>
      </Box>
    );
  }
  
  // Ensure user has all required properties
  const safeUser = {
    _id: user._id || 'unknown',
    username: user.username || 'Hunter',
    level: user.level || 1,
    rank: user.rank || 'E',
    experience: user.experience || 0,
    experienceToNextLevel: user.experienceToNextLevel || 1000,
    hp: user.hp || { current: 100, max: 100 },
    mp: user.mp || { current: 50, max: 50 },
    stats: user.stats || {
      strength: 10,
      agility: 10,
      intelligence: 10,
      endurance: 10,
      luck: 10
    },
    statPoints: user.statPoints || 0,
    currency: user.currency || 0
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column - Status Window */}
        <Grid item xs={12} md={4} lg={3}>
          <Box className="container-section" sx={{ height: '100%' }}>
            {user ? (
              <StatusWindow 
                user={user} 
                calculateExpPercentage={calculateExpPercentage}
                getRankColor={getRankColor}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Grid>
        
        {/* Middle Column - Tabs and Content */}
        <Grid item xs={12} md={8} lg={9}>
          <Box className="container-section">
            {/* Tabs */}
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  color: '#e0e0e0',
                  '&.Mui-selected': {
                    color: '#4287f5',
                    textShadow: '0 0 10px rgba(66, 135, 245, 0.7)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4287f5',
                  boxShadow: '0 0 10px rgba(66, 135, 245, 0.7)'
                }
              }}
            >
              <Tab icon={<LeaderboardIcon />} label="RANKINGS" />
              <Tab icon={<ShadowIcon />} label="SHADOWS" />
              <Tab icon={<SkillsIcon />} label="SKILLS" />
              <Tab icon={<TitlesIcon />} label="TITLES" />
              <Tab icon={<KeyIcon />} label="DUNGEON KEYS" />
              <Tab icon={<StreakIcon />} label="HABITS" />
            </Tabs>
            
            <Divider sx={{ mb: 3, backgroundColor: 'rgba(66, 135, 245, 0.3)', boxShadow: '0 0 5px rgba(66, 135, 245, 0.2)' }} />
            
            {/* Global Rankings Tab */}
            {tabValue === 0 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Global Rankings
                </Typography>
                <GlobalRanking />
              </Box>
            )}
            
            {/* Shadows Tab */}
            {tabValue === 1 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Shadow Army
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Shadow Extraction
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Extract shadows from targets using your camera. Higher level hunters can extract more powerful shadows.
                  </Typography>
                  <ShadowExtraction />
                </Box>
                
                <Divider sx={{ my: 4, backgroundColor: 'rgba(66, 135, 245, 0.3)', boxShadow: '0 0 5px rgba(66, 135, 245, 0.2)' }} />
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Shadow Summoning
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Summon shadows using currency. Different summoning methods yield different quality shadows.
                  </Typography>
                  {/* Shadow summoning component would go here */}
                </Box>
                
                <Divider sx={{ my: 4, backgroundColor: 'rgba(66, 135, 245, 0.3)', boxShadow: '0 0 5px rgba(66, 135, 245, 0.2)' }} />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Shadow Army
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Manage and deploy your shadow army. Assign shadows to tasks or use them in combat.
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : user && user.shadows && user.shadows.length > 0 ? (
                    <Grid container spacing={2}>
                      {user.shadows.map(shadow => (
                        <Grid item xs={12} sm={6} md={4} key={shadow._id}>
                          <HolographicCard className="card-container">
                            <Box className="card-content" p={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  src={shadow.image} 
                                  alt={shadow.name}
                                  sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    mr: 2,
                                    border: '2px solid',
                                    borderColor: getRankColor(shadow.rank),
                                    boxShadow: `0 0 10px ${getRankColor(shadow.rank)}`
                                  }}
                                />
                                <Box>
                                  <Typography variant="h6" className="quest-title">
                                    {shadow.name}
                                  </Typography>
                                  <Chip 
                                    label={shadow.rank} 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: getRankColor(shadow.rank),
                                      color: '#fff',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" className="quest-description" mb={2}>
                                {shadow.description}
                              </Typography>
                              
                              <Box mb={2}>
                                <StatBar label="POWER" value={shadow.power} max={100} color={getRankColor(shadow.rank)} />
                                <StatBar label="HEALTH" value={shadow.health} max={100} color="#f44336" />
                                <StatBar label="AGILITY" value={shadow.agility} max={100} color="#4caf50" />
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Button 
                                  variant="contained" 
                                  color="primary"
                                  startIcon={<ViewIcon />}
                                  size="small"
                                >
                                  Details
                                </Button>
                                
                                <Button 
                                  variant="outlined" 
                                  color="secondary"
                                  startIcon={<ArrowIcon />}
                                  size="small"
                                >
                                  Deploy
                                </Button>
                              </Box>
                            </Box>
                          </HolographicCard>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(10, 10, 15, 0.5)', borderRadius: 2 }}>
                      <Typography variant="h6" color="#e0e0e0">
                        No shadows in your army yet
                      </Typography>
                      <Typography variant="body2" color="#e0e0e0" sx={{ mt: 1, mb: 3 }}>
                        Complete quests to encounter monsters and extract their shadows
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<QuestIcon />}
                        onClick={() => navigate('/quests')}
                      >
                        Go to Quests
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            
            {/* Skills Tab */}
            {tabValue === 2 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Skills & Abilities
                </Typography>
                
                <Grid container spacing={3} className="grid-container">
                  {skills.map((skill) => (
                    <Grid item xs={12} sm={6} md={4} key={skill.id}>
                      <HolographicCard className="card-container" sx={{
                        border: skill.unlocked ? '1px solid rgba(66, 135, 245, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        opacity: skill.unlocked ? 1 : 0.7
                      }}>
                        <Box className="card-content" p={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                backgroundColor: skill.unlocked ? 'rgba(66, 135, 245, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid',
                                borderColor: skill.unlocked ? 'rgba(66, 135, 245, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                fontSize: '1.5rem'
                              }}
                            >
                              {skill.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" className="quest-title" sx={{ 
                                color: skill.unlocked ? '#4287f5' : '#757575'
                              }}>
                                {skill.name}
                              </Typography>
                              <Typography variant="caption" color="#e0e0e0">
                                Level {skill.level}/{skill.maxLevel}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" className="quest-description" mb={2}>
                            {skill.description}
                          </Typography>
                          
                          {!skill.unlocked && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2, 
                              p: 1, 
                              borderRadius: 1,
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              border: '1px solid rgba(244, 67, 54, 0.3)'
                            }}>
                              <LockIcon sx={{ color: '#f44336', mr: 1, fontSize: '0.9rem' }} />
                              <Typography variant="caption" color="#f44336">
                                Requires Level {skill.requiredLevel}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={(skill.level / skill.maxLevel) * 100} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: skill.unlocked ? '#4287f5' : '#757575',
                                  boxShadow: skill.unlocked ? '0 0 10px rgba(66, 135, 245, 0.7)' : 'none'
                                }
                              }} 
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            {!skill.unlocked ? (
                              <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                startIcon={<UnlockIcon />}
                                disabled={!user || user.level < skill.requiredLevel}
                                onClick={() => handleSkillUnlock(skill.id)}
                              >
                                Unlock
                              </Button>
                            ) : (
                              <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                startIcon={<AddIcon />}
                                disabled={skill.level >= skill.maxLevel}
                                onClick={() => handleSkillLevelUp(skill.id)}
                              >
                                Level Up
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </HolographicCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Titles Tab */}
            {tabValue === 3 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Titles & Achievements
                </Typography>
                
                <List>
                  {titles.map((title) => (
                    <ListItem
                      key={title.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: title.acquired ? 'rgba(66, 135, 245, 0.1)' : 'rgba(10, 10, 15, 0.5)',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: title.acquired ? 'rgba(66, 135, 245, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      secondaryAction={
                        <Chip 
                          icon={title.acquired ? <StarIcon /> : <LockIcon />}
                          label={title.acquired ? "Acquired" : "Locked"} 
                          color={title.acquired ? "primary" : "default"}
                          variant={title.acquired ? "filled" : "outlined"}
                          sx={{
                            backgroundColor: title.acquired ? 'rgba(66, 135, 245, 0.2)' : 'transparent',
                            borderColor: title.acquired ? 'rgba(66, 135, 245, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" className="quest-title" sx={{ 
                            color: title.acquired ? '#4287f5' : '#e0e0e0',
                            textShadow: title.acquired ? '0 0 8px rgba(66, 135, 245, 0.6)' : 'none'
                          }}>
                            {title.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="#e0e0e0" sx={{ mt: 1 }}>
                              {title.description}
                            </Typography>
                            {title.acquired && (
                              <Typography variant="body2" color="#4287f5" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Bonus: {title.bonus}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Dungeon Keys Tab */}
            {tabValue === 4 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Dungeon Keys
                </Typography>
                
                <Grid container spacing={3} className="grid-container">
                  {dungeonKeys.map((key) => (
                    <Grid item xs={12} sm={6} md={4} key={key.id}>
                      <HolographicCard className="card-container">
                        <Box className="card-content" p={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" className="quest-title">
                              {key.name}
                            </Typography>
                            <Chip 
                              label={key.rank} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRankColor(key.rank),
                                color: '#fff',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body2" className="quest-description" mb={2}>
                            {key.description}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: 'rgba(10, 10, 15, 0.5)',
                            mb: 2
                          }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <KeyIcon sx={{ mr: 1, fontSize: '1rem' }} />
                              Available: {key.count}
                            </Typography>
                            
                            {key.cooldown > 0 && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                Cooldown: {key.cooldown}h
                              </Typography>
                            )}
                          </Box>
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            disabled={key.count <= 0}
                            onClick={() => handleUseKey(key.id)}
                          >
                            Use Key
                          </Button>
                        </Box>
                      </HolographicCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Habits Tab */}
            {tabValue === 5 && (
              <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
                <Typography variant="h5" className="section-title">
                  Habits
                </Typography>
                
                <HabitTracker />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
