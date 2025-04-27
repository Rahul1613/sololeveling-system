import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Slider,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { createCustomQuest } from '../../redux/slices/questSlice';

// Styled components
const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(30, 30, 30, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 255, 255, 0.1)'
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main
}));

const RewardPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2)
}));

const RewardItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1)
}));

const CreateCustomQuest = () => {
  const dispatch = useDispatch();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeEstimate: '30 minutes',
    rewards: {
      experience: 100,
      currency: 50,
      statPoints: 0
    },
    deadline: '',
    requirements: {
      level: 1,
      rank: 'F'
    }
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle slider change
  const handleSliderChange = (name) => (e, newValue) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: newValue
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Add deadline if provided
      let questData = { ...formData };
      if (questData.deadline) {
        const deadlineDate = new Date();
        const [days, hours] = questData.deadline.split(':').map(Number);
        deadlineDate.setDate(deadlineDate.getDate() + days);
        deadlineDate.setHours(deadlineDate.getHours() + hours);
        questData.deadline = deadlineDate.toISOString();
      } else {
        delete questData.deadline;
      }
      
      await dispatch(createCustomQuest(questData)).unwrap();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        timeEstimate: '30 minutes',
        rewards: {
          experience: 100,
          currency: 50,
          statPoints: 0
        },
        deadline: '',
        requirements: {
          level: 1,
          rank: 'F'
        }
      });
      
      // Show success notification
      // Removed notification code here
    } catch (error) {
      console.error('Failed to create custom quest:', error);
      // Removed notification code here
    }
  };
  
  // Calculate suggested rewards based on difficulty
  const calculateSuggestedRewards = () => {
    const difficultyMultipliers = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2.5,
      'very-hard': 4
    };
    
    const multiplier = difficultyMultipliers[formData.difficulty] || 1;
    
    return {
      experience: Math.round(100 * multiplier),
      currency: Math.round(50 * multiplier),
      statPoints: formData.difficulty === 'hard' ? 1 : (formData.difficulty === 'very-hard' ? 2 : 0)
    };
  };
  
  // Handle auto-calculate rewards
  const handleAutoCalculateRewards = () => {
    setFormData({
      ...formData,
      rewards: calculateSuggestedRewards()
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AddCircleOutlineIcon sx={{ color: '#2196F3', mr: 1 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Create Custom Quest
          </Typography>
        </Box>
      </Box>
      
      <FormPaper>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <FormTitle variant="h6">Quest Details</FormTitle>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quest Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quest Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="difficulty-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    label="Difficulty"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                    <MenuItem value="very-hard">Very Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Estimate"
                  name="timeEstimate"
                  value={formData.timeEstimate}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <Divider sx={{ my: 3 }} />
          
          <FormSection>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormTitle variant="h6">Quest Rewards</FormTitle>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleAutoCalculateRewards}
                sx={{ ml: 2 }}
              >
                Auto-Calculate
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography gutterBottom>Experience Points</Typography>
                <Slider
                  value={formData.rewards.experience}
                  onChange={handleSliderChange('rewards.experience')}
                  aria-labelledby="experience-slider"
                  valueLabelDisplay="auto"
                  step={50}
                  marks
                  min={50}
                  max={1000}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={formData.rewards.experience}
                  onChange={handleInputChange}
                  name="rewards.experience"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography gutterBottom>Currency (Gold)</Typography>
                <Slider
                  value={formData.rewards.currency}
                  onChange={handleSliderChange('rewards.currency')}
                  aria-labelledby="currency-slider"
                  valueLabelDisplay="auto"
                  step={25}
                  marks
                  min={0}
                  max={500}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={formData.rewards.currency}
                  onChange={handleInputChange}
                  name="rewards.currency"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography gutterBottom>Stat Points</Typography>
                <Slider
                  value={formData.rewards.statPoints}
                  onChange={handleSliderChange('rewards.statPoints')}
                  aria-labelledby="stat-points-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={5}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={formData.rewards.statPoints}
                  onChange={handleInputChange}
                  name="rewards.statPoints"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FitnessCenterIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <RewardPreview>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Reward Preview:
                  </Typography>
                  <RewardItem>
                    <StarIcon fontSize="small" sx={{ mr: 1, color: '#FFC107' }} />
                    <Typography variant="body2">
                      {formData.rewards.experience} Experience Points
                    </Typography>
                  </RewardItem>
                  <RewardItem>
                    <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: '#FFC107' }} />
                    <Typography variant="body2">
                      {formData.rewards.currency} Gold
                    </Typography>
                  </RewardItem>
                  {formData.rewards.statPoints > 0 && (
                    <RewardItem>
                      <FitnessCenterIcon fontSize="small" sx={{ mr: 1, color: '#4CAF50' }} />
                      <Typography variant="body2">
                        {formData.rewards.statPoints} Stat Points
                      </Typography>
                    </RewardItem>
                  )}
                </RewardPreview>
              </Grid>
            </Grid>
          </FormSection>
          
          <Divider sx={{ my: 3 }} />
          
          <FormSection>
            <FormTitle variant="h6">Additional Settings</FormTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deadline (days:hours)"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  placeholder="e.g. 3:12 for 3 days and 12 hours"
                  variant="outlined"
                  helperText="Leave empty for no deadline"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="rank-requirement-label">Minimum Rank Requirement</InputLabel>
                  <Select
                    labelId="rank-requirement-label"
                    name="requirements.rank"
                    value={formData.requirements.rank}
                    onChange={handleInputChange}
                    label="Minimum Rank Requirement"
                  >
                    <MenuItem value="F">F Rank</MenuItem>
                    <MenuItem value="E">E Rank</MenuItem>
                    <MenuItem value="D">D Rank</MenuItem>
                    <MenuItem value="C">C Rank</MenuItem>
                    <MenuItem value="B">B Rank</MenuItem>
                    <MenuItem value="A">A Rank</MenuItem>
                    <MenuItem value="S">S Rank</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Level Requirement"
                  name="requirements.level"
                  value={formData.requirements.level}
                  onChange={handleInputChange}
                  type="number"
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Create Custom Quest
            </Button>
          </Box>
        </form>
      </FormPaper>
    </Box>
  );
};

export default CreateCustomQuest;
