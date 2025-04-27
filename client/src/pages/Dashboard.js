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
  Tooltip
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
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

// Import holographic UI components
import { HolographicCard, StatusWindow } from '../components/HolographicUI';
import GlobalRanking from '../components/Leaderboard/GlobalRanking';
import SkillsPanel from '../components/skills/SkillsPanel';
import SkillTree from '../components/skills/SkillTree';
import TitlesPanel from '../components/titles/TitlesPanel';
import voiceService from '../utils/voiceService';
import userService from '../api/userService';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';

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
    <Typography sx={{ fontSize: 13, color: '#4eafe9', fontWeight: 700, letterSpacing: 1 }}>{label}</Typography>
    <LinearProgress
      variant="determinate"
      value={Math.min(100, (value / max) * 100)}
      sx={{
        height: 10,
        borderRadius: 5,
        background: 'rgba(78,175,233,0.15)',
        '& .MuiLinearProgress-bar': {
          background: color || '#00eaff',
          boxShadow: `0 0 8px ${color || '#00eaff'}`
        }
      }}
    />
    <Typography sx={{ fontSize: 12, color: '#eaf6ff', mt: 0.5 }}>{value} / {max}</Typography>
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* DEMO: Button to simulate "arise" animation completion */}
      {!arisePlayed && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <button style={{ fontSize: 18, padding: '10px 24px', background: '#00eaff', border: 'none', borderRadius: 8, color: '#222', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px #00eaff55' }} onClick={() => setArisePlayed(true)}>Simulate "Arise" Animation</button>
        </Box>
      )}
      {/* Background music audio element */}
      <audio ref={bgAudioRef} src={process.env.PUBLIC_URL + '/sounds/solo leveling bg.mp3'} loop preload="auto" style={{ display: 'none' }} />
      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Status Window */}
        <Grid item xs={12} md={4}>
          <SystemPanel style={{ mb: 2 }}>
            <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: 22, mb: 1, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
              STATUS WINDOW
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 26, letterSpacing: 2 }}>
                  Lv. {safeUser.level}
                </Typography>
                <Typography sx={{ color: '#4eafe9', fontSize: 18, fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: 1 }}>
                  {safeUser.username}
                </Typography>
                <Typography sx={{ color: '#b8eaff', fontSize: 14, fontWeight: 600, mt: 1 }}>
                  Rank: {safeUser.rank}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <StatBar label="HP" value={safeUser.hp.current} max={safeUser.hp.max} color="#ff4eae" />
                <StatBar label="MP" value={safeUser.mp.current} max={safeUser.mp.max} color="#4eafe9" />
                <StatBar label="XP" value={safeUser.experience} max={safeUser.experienceToNextLevel} color="#00eaff" />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}><SystemButton>Quests</SystemButton></Grid>
                <Grid item xs={6}><SystemButton>Inventory</SystemButton></Grid>
                <Grid item xs={6}><SystemButton>Shadow Army</SystemButton></Grid>
                <Grid item xs={6}><SystemButton>Skills</SystemButton></Grid>
              </Grid>
            </Box>
          </SystemPanel>
          {/* Dungeon Keys */}
          <SystemPanel style={{ mt: 2 }}>
            <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: 22, mb: 1, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
              DUNGEON KEYS
            </Typography>
            <List>
              {dungeonKeys.map((key) => (
                <ListItem
                  key={key.id}
                  secondaryAction={
                    <SystemButton
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={key.count === 0}
                      onClick={() => handleUseKey(key.id)}
                      startIcon={key.count > 0 ? <UnlockIcon /> : <LockIcon />}
                    >
                      {key.count > 0 ? 'Use' : 'Locked'}
                    </SystemButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getRankColor(key.rank) }}>
                      <KeyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{key.name}</Typography>
                        <Chip 
                          label={`x${key.count}`} 
                          size="small" 
                          sx={{ ml: 1, bgcolor: key.count > 0 ? 'rgba(123, 104, 238, 0.2)' : 'rgba(0, 0, 0, 0.2)', color: key.count > 0 ? 'primary.main' : 'text.disabled' }} 
                        />
                      </Box>
                    }
                    secondary={key.description}
                  />
                </ListItem>
              ))}
            </List>
          </SystemPanel>
        </Grid>
        
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab icon={<LeaderboardIcon />} label="Rankings" />
              <Tab icon={<SkillsIcon />} label="Skills" />
              <Tab icon={<TitlesIcon />} label="Titles" />
            </Tabs>
          </Box>
          
          {/* Tab Panels */}
          <Box sx={{ mt: 2 }}>
            {/* Rankings Tab */}
            {tabValue === 0 && (
              <GlobalRanking />
            )}
            
            {/* Skills Tab */}
            {tabValue === 1 && (
              <SystemPanel title="Skills" height="auto">
                <Grid container spacing={2}>
                  {skills.map((skill) => (
                    <Grid item xs={12} sm={6} key={skill.id}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          bgcolor: skill.unlocked ? 'rgba(123, 104, 238, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid',
                          borderColor: skill.unlocked ? 'rgba(123, 104, 238, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {skill.unlocked && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(45deg, rgba(123, 104, 238, 0.05) 25%, transparent 25%, transparent 50%, rgba(123, 104, 238, 0.05) 50%, rgba(123, 104, 238, 0.05) 75%, transparent 75%, transparent)',
                              backgroundSize: '20px 20px',
                              opacity: 0.3
                            }} 
                          />
                        )}
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ marginRight: '8px', fontSize: '1.5rem' }}>{skill.icon}</span>
                              {skill.name}
                            </Typography>
                            {!skill.unlocked && (
                              <Chip 
                                label={`Requires Level ${skill.requiredLevel}`} 
                                size="small" 
                                color="error" 
                                icon={<LockIcon />} 
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            {skill.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              Level: {skill.level}/{skill.maxLevel}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(skill.level / skill.maxLevel) * 100} 
                              sx={{ 
                                flexGrow: 1, 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: skill.unlocked ? 'primary.main' : 'text.disabled'
                                }
                              }} 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            {!skill.unlocked ? (
                              <SystemButton 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                disabled={!user || user.level < skill.requiredLevel}
                                onClick={() => handleSkillUnlock(skill.id)}
                              >
                                Unlock
                              </SystemButton>
                            ) : (
                              <SystemButton 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                disabled={skill.level >= skill.maxLevel}
                                onClick={() => handleSkillLevelUp(skill.id)}
                              >
                                Level Up
                              </SystemButton>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </SystemPanel>
            )}
            
            {/* Titles Tab */}
            {tabValue === 2 && (
              <SystemPanel title="Titles" height="auto">
                <List>
                  {titles.map((title) => (
                    <ListItem
                      key={title.id}
                      sx={{
                        mb: 2,
                        bgcolor: title.acquired ? 'rgba(123, 104, 238, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: title.acquired ? 'rgba(123, 104, 238, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      secondaryAction={
                        <Chip 
                          icon={title.acquired ? <StarIcon /> : <StarBorderIcon />}
                          label={title.acquired ? "Acquired" : "Locked"} 
                          color={title.acquired ? "primary" : "default"}
                          variant={title.acquired ? "filled" : "outlined"}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6">{title.name}</Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {title.description}
                            </Typography>
                            {title.acquired && (
                              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                Bonus: {title.bonus}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </SystemPanel>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
