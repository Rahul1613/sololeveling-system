import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as StreakIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import HolographicCard from '../HolographicUI/HolographicCard';

// Styled components
const HabitItem = styled(Box)(({ theme, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '8px',
  marginBottom: '8px',
  backgroundColor: completed ? 'rgba(66, 135, 245, 0.1)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${completed ? 'rgba(66, 135, 245, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: completed ? 'rgba(66, 135, 245, 0.15)' : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  }
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
}));

const StreakChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 152, 0, 0.2)',
  color: '#FFA726',
  border: '1px solid rgba(255, 152, 0, 0.3)',
  '& .MuiChip-icon': {
    color: '#FFA726',
  },
}));

// Mock data for habits
const mockHabits = [
  { id: 1, name: 'Morning Meditation', streak: 5, completed: false, xp: 50 },
  { id: 2, name: 'Read for 30 minutes', streak: 12, completed: true, xp: 30 },
  { id: 3, name: 'Exercise', streak: 3, completed: false, xp: 100 },
  { id: 4, name: 'Drink 8 glasses of water', streak: 7, completed: true, xp: 20 },
  { id: 5, name: 'Practice coding', streak: 15, completed: false, xp: 80 },
];

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    xp: 50,
    difficulty: 'medium',
    streak: 0,
    completed: false
  });

  useEffect(() => {
    // Simulate fetching habits from API
    const fetchHabits = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setHabits(mockHabits);
          setLoading(false);
          
          // Calculate today's progress
          const completed = mockHabits.filter(habit => habit.completed).length;
          const total = mockHabits.length;
          setTodayProgress(total > 0 ? (completed / total) * 100 : 0);
        }, 1000);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const toggleHabit = (id) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === id) {
          return { ...habit, completed: !habit.completed };
        }
        return habit;
      });
      
      // Recalculate progress
      const completed = updatedHabits.filter(habit => habit.completed).length;
      const total = updatedHabits.length;
      setTodayProgress(total > 0 ? (completed / total) * 100 : 0);
      
      return updatedHabits;
    });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setNewHabit({
      name: '',
      xp: 50,
      difficulty: 'medium',
      streak: 0,
      completed: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHabit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleXpChange = (event, newValue) => {
    setNewHabit(prev => ({
      ...prev,
      xp: newValue
    }));
  };

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const newHabitItem = {
      id: Date.now(), // Simple unique ID
      name: newHabit.name.trim(),
      xp: newHabit.xp,
      difficulty: newHabit.difficulty,
      streak: 0,
      completed: false
    };
    
    setHabits(prev => [...prev, newHabitItem]);
    
    // Recalculate progress
    const total = habits.length + 1;
    const completed = habits.filter(habit => habit.completed).length;
    setTodayProgress(total > 0 ? (completed / total) * 100 : 0);
    
    handleCloseDialog();
  };

  const handleDeleteHabit = (id) => {
    setHabits(prev => {
      const updatedHabits = prev.filter(habit => habit.id !== id);
      
      // Recalculate progress
      const completed = updatedHabits.filter(habit => habit.completed).length;
      const total = updatedHabits.length;
      setTodayProgress(total > 0 ? (completed / total) * 100 : 0);
      
      return updatedHabits;
    });
  };

  const getTotalXP = () => {
    return habits
      .filter(habit => habit.completed)
      .reduce((total, habit) => total + habit.xp, 0);
  };

  return (
    <HolographicCard title="Daily Habits" height="auto">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {/* Today's Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Today's Progress
              </Typography>
              <Typography variant="body2" color="primary">
                {Math.round(todayProgress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={todayProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4287f5',
                  backgroundImage: 'linear-gradient(90deg, rgba(66, 135, 245, 0.8) 0%, rgba(123, 104, 238, 0.8) 100%)',
                  boxShadow: '0 0 10px rgba(66, 135, 245, 0.7)'
                }
              }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Chip 
                icon={<TrophyIcon />} 
                label={`+${getTotalXP()} XP`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(66, 135, 245, 0.1)', 
                  color: '#4287f5',
                  border: '1px solid rgba(66, 135, 245, 0.3)'
                }} 
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          {/* Habits List */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Daily Habits
          </Typography>
          
          {habits.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No habits added yet. Start building your routine!
            </Typography>
          ) : (
            <Box>
              {habits.map((habit) => (
                <HabitItem key={habit.id} completed={habit.completed}>
                  <StyledCheckbox
                    checked={habit.completed}
                    onChange={() => toggleHabit(habit.id)}
                    icon={<UncheckedIcon />}
                    checkedIcon={<CheckCircleIcon />}
                  />
                  <Box sx={{ ml: 1, flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      textDecoration: habit.completed ? 'line-through' : 'none',
                      color: habit.completed ? 'text.secondary' : 'text.primary'
                    }}>
                      {habit.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <StreakChip
                        icon={<StreakIcon />}
                        label={`${habit.streak} day streak`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`+${habit.xp} XP`}
                        size="small"
                        sx={{ 
                          ml: 1, 
                          backgroundColor: 'rgba(66, 135, 245, 0.1)', 
                          color: '#4287f5',
                          border: '1px solid rgba(66, 135, 245, 0.3)'
                        }}
                      />
                    </Box>
                  </Box>
                  <Tooltip title="Remove habit">
                    <IconButton 
                      size="small" 
                      sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </HabitItem>
              ))}
            </Box>
          )}
          
          {/* Add New Habit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Tooltip title="Add new habit">
              <IconButton 
                sx={{ 
                  backgroundColor: 'rgba(66, 135, 245, 0.1)', 
                  color: '#4287f5',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 135, 245, 0.2)',
                  }
                }}
                onClick={handleOpenDialog}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      {/* New Habit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ backgroundColor: 'rgba(66, 135, 245, 0.1)', color: '#4287f5' }}>
          Add New Habit
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Habit Name"
              name="name"
              value={newHabit.name}
              onChange={handleInputChange}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'text.primary' }}
            />
            <FormControl>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                label="Difficulty"
                name="difficulty"
                value={newHabit.difficulty}
                onChange={handleInputChange}
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'text.primary' }}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                XP Reward
              </Typography>
              <Slider
                value={newHabit.xp}
                onChange={handleXpChange}
                min={10}
                max={100}
                step={10}
                sx={{ width: '100%' }}
              />
              <Typography variant="body2" color="text.secondary">
                {newHabit.xp} XP
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button onClick={handleAddHabit} sx={{ backgroundColor: 'rgba(66, 135, 245, 0.1)', color: '#4287f5' }}>
            Add Habit
          </Button>
        </DialogActions>
      </Dialog>
    </HolographicCard>
  );
};

export default HabitTracker;
