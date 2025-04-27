import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  Avatar, 
  Slider,
  FormControl,
  FormControlLabel,
  Switch,
  useMediaQuery
} from '@mui/material';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import { HolographicCard } from '../components/HolographicUI';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.user || { stats: null });
  
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.8);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
    
    // Load sound settings from localStorage
    const soundEnabledSetting = localStorage.getItem('soundEnabled');
    const soundVolumeSetting = localStorage.getItem('soundVolume');
    
    setSoundEnabled(soundEnabledSetting === null ? true : soundEnabledSetting === 'true');
    setSoundVolume(soundVolumeSetting === null ? 0.8 : parseFloat(soundVolumeSetting));
  }, [user]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSaveProfile = () => {
    // Save profile changes
    // This will be implemented when we have the profile API endpoints
    setEditMode(false);
  };

  const handleSoundEnabledChange = (event) => {
    const enabled = event.target.checked;
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  const handleSoundVolumeChange = (event, newValue) => {
    setSoundVolume(newValue);
    localStorage.setItem('soundVolume', newValue.toString());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: isDesktop ? 4 : 2, mb: isDesktop ? 4 : 2 }}>
      <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Box sx={{ p: isDesktop ? 2 : 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: isDesktop ? 3 : 2 }}>
            <Avatar
              alt={user?.username}
              src={user?.profilePicture}
              sx={{ width: isDesktop ? 80 : 64, height: isDesktop ? 80 : 64, mr: 2, boxShadow: '0 0 12px #00eaff99' }}
            />
            <Box>
              <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 26 : 22, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
                {user?.username}
              </Typography>
              <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 15 }}>Rank: {user?.rank} • Level {user?.level}</Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <SystemButton
                variant="outlined"
                size="small"
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={editMode ? handleSaveProfile : handleEditToggle}
              >
                {editMode ? 'Save' : 'Edit'}
              </SystemButton>
            </Box>
          </Box>
          
          <Grid container spacing={isDesktop ? 3 : 2}>
            {editMode ? (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#eaf6ff', fontWeight: 700 }}>Username</Typography>
                <Typography sx={{ color: '#00eaff', fontSize: isDesktop ? 26 : 22, fontWeight: 700 }}>
                  <input
                    type="text"
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    variant="outlined"
                  />
                </Typography>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#eaf6ff', fontWeight: 700 }}>Username</Typography>
                <Typography sx={{ color: '#00eaff', fontSize: isDesktop ? 26 : 22, fontWeight: 700 }}>{user?.username}</Typography>
              </Grid>
            )}
            {editMode ? (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#eaf6ff', fontWeight: 700 }}>Email</Typography>
                <Typography sx={{ color: '#00eaff', fontSize: isDesktop ? 26 : 22, fontWeight: 700 }}>
                  <input
                    type="email"
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    variant="outlined"
                  />
                </Typography>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#eaf6ff', fontWeight: 700 }}>Email</Typography>
                <Typography sx={{ color: '#00eaff', fontSize: isDesktop ? 26 : 22, fontWeight: 700 }}>{user?.email}</Typography>
              </Grid>
            )}
            {!editMode && (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#eaf6ff', fontWeight: 700 }}>Joined</Typography>
                <Typography sx={{ color: '#00eaff', fontSize: isDesktop ? 26 : 22, fontWeight: 700 }}>{new Date(user?.createdAt).toLocaleDateString()}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </SystemPanel>
      
      <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Box sx={{ p: isDesktop ? 2 : 1 }}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={handleSoundEnabledChange}
                  color="primary"
                />
              }
              label="Enable Sound Effects"
            />
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>Sound Volume</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Slider
                    value={soundVolume}
                    onChange={handleSoundVolumeChange}
                    aria-labelledby="sound-volume-slider"
                    step={0.1}
                    marks
                    min={0}
                    max={1}
                    disabled={!soundEnabled}
                  />
                </Grid>
              </Grid>
            </Box>
          </FormControl>
        </Box>
      </SystemPanel>
      
      {stats && stats.statPoints > 0 && (
        <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
          <Box sx={{ p: isDesktop ? 2 : 1 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              You have {stats.statPoints} stat points to allocate
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Allocate your stat points to increase your abilities. Choose wisely!
            </Typography>
            
            <Grid container spacing={isDesktop ? 3 : 2}>
              {Object.entries(stats.stats || {}).map(([stat, value]) => (
                <Grid item xs={12} sm={6} md={4} key={stat}>
                  <Box sx={{ p: isDesktop ? 2 : 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }}>
                      {stat}: {value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SystemButton
                        variant="contained"
                        size="small"
                        color="primary"
                        sx={{ minWidth: '30px', mr: 1 }}
                      >
                        +1
                      </SystemButton>
                      <SystemButton
                        variant="contained"
                        size="small"
                        color="secondary"
                        sx={{ minWidth: '30px', mr: 1 }}
                      >
                        +5
                      </SystemButton>
                      <SystemButton
                        variant="contained"
                        size="small"
                        color="error"
                        sx={{ minWidth: '30px' }}
                      >
                        +All
                      </SystemButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </SystemPanel>
      )}
    </Container>
  );
};

export default Profile;
