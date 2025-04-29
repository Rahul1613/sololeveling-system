import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  LinearProgress
} from '@mui/material';
import { 
  AccessTime, 
  CheckCircle, 
  Cancel, 
  PlayArrow,
  Flag
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import mockQuestService from '../api/mockQuestService';
import QuestDetails from '../components/quests/QuestDetails';
import HolographicCard from '../components/HolographicUI/HolographicCard';
import DailyQuestDirections from '../components/quests/DailyQuestDirections';
// Import CSS is handled in the DailyQuestDirections component

const ActiveQuests = () => {
  const { token } = useSelector(state => state.auth);
  const [activeQuests, setActiveQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showQuestDetails, setShowQuestDetails] = useState(false);
  
  // Fetch active quests on component mount
  useEffect(() => {
    fetchActiveQuests();
  }, [token]);
  
  // Fetch active quests from mock service
  const fetchActiveQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching active quests...');
      const quests = await mockQuestService.getActiveQuests();
      console.log('Active quests fetched:', quests);
      setActiveQuests(quests);
      
    } catch (err) {
      console.error('Error fetching active quests:', err);
      setError('Failed to fetch active quests');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quest completion
  const handleQuestCompleted = (result) => {
    setSuccess(`Quest completed successfully! You earned ${result.rewards?.experience || 0} XP, ${result.rewards?.currency || 0} currency, and ${result.rewards?.statPoints || 0} stat points.`);
    
    // Refresh active quests
    fetchActiveQuests();
    
    // Close quest details dialog
    setShowQuestDetails(false);
  };
  
  // Render quest card
  const renderQuestCard = (quest) => {
    // Format difficulty for display
    const getDifficultyColor = (difficulty) => {
      switch(difficulty?.toLowerCase()) {
        case 'easy': return 'success';
        case 'medium': return 'info';
        case 'hard': return 'warning';
        case 'very-hard': return 'error';
        default: return 'default';
      }
    };
    
    // Format category for display
    const getCategoryIcon = (category) => {
      switch(category?.toLowerCase()) {
        case 'fitness': return '💪';
        case 'study': return '📚';
        case 'wellness': return '🧘';
        case 'creative': return '🎨';
        default: return '🎯';
      }
    };
    
    return (
      <HolographicCard key={quest._id} className="quest-card">
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" className="quest-title">
              {quest.title}
            </Typography>
            
            <Box>
              <Chip 
                label={(quest.difficulty || 'unknown').toUpperCase()} 
                color={getDifficultyColor(quest.difficulty)}
                size="small"
                sx={{ mr: 1 }}
                className="reward-chip"
              />
              
              <Chip 
                label={`${getCategoryIcon(quest.category)} ${(quest.category || 'other').toUpperCase()}`}
                color="secondary"
                size="small"
                className="reward-chip"
              />
            </Box>
          </Box>
          
          <Typography variant="body1" className="quest-description">
            {quest.description || 'No description provided'}
          </Typography>
          
          {/* Progress Bar */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="bold">
                Progress
              </Typography>
              <Typography variant="body2">
                {quest.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={quest.progress || 0} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Quest Info */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box className="quest-info">
                <AccessTime className="quest-info-icon" />
                <Typography variant="body2">
                  {quest.timeRemaining || 'No time limit'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box className="quest-info">
                <Flag className="quest-info-icon" />
                <Typography variant="body2">
                  {quest.type?.toUpperCase() || 'CUSTOM'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Rewards */}
          <Box className="quest-rewards">
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Rewards:
            </Typography>
            <Box display="flex" flexWrap="wrap">
              <Chip 
                label={`${quest.rewards?.experience || 0} XP`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                className="reward-chip"
              />
              <Chip 
                label={`${quest.rewards?.currency || 0} Gold`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                className="reward-chip"
              />
              {quest.rewards?.statPoints > 0 && (
                <Chip 
                  label={`${quest.rewards.statPoints} Stat Points`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                  className="reward-chip"
                />
              )}
            </Box>
          </Box>
          
          {/* Actions */}
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => {
                setSelectedQuest(quest);
                setShowQuestDetails(true);
              }}
            >
              Continue Quest
            </Button>
            
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<Cancel />}
            >
              Abandon
            </Button>
          </Box>
        </Box>
      </HolographicCard>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box className="container-section">
        <Box className="flex-between" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" className="page-title" sx={{ mb: 0 }}>
            Active Quests
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={fetchActiveQuests}
            disabled={loading}
          >
            Refresh Quests
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {/* No Active Quests Message */}
        {!loading && activeQuests.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(10, 10, 15, 0.7)', borderRadius: 2, border: '1px solid rgba(66, 135, 245, 0.5)', boxShadow: '0 0 15px rgba(66, 135, 245, 0.3)' }}>
            <Flag sx={{ fontSize: 60, color: '#4287f5', mb: 2, filter: 'drop-shadow(0 0 10px rgba(66, 135, 245, 0.7))' }} />
            <Typography variant="h5" gutterBottom sx={{ color: '#ffffff', textShadow: '0 0 10px rgba(66, 135, 245, 0.7)' }}>
              No Active Quests
            </Typography>
            <Typography variant="body1" color="#e0e0e0" mb={3}>
              You don't have any active quests. Visit the Quest Board or Custom Quests to accept new quests.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              href="/quests"
            >
              Go to Quest Board
            </Button>
          </Paper>
        )}
        
        {/* Daily Quest Directions */}
        {!loading && activeQuests.length > 0 && (
          <Box mb={4} className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
            <Typography variant="h5" component="h2" className="section-title">
              Daily Quest
            </Typography>
            
            {/* Find the first daily quest */}
            {activeQuests.find(quest => quest.type === 'daily') ? (
              <DailyQuestDirections 
                quest={{
                  title: activeQuests.find(quest => quest.type === 'daily').title,
                  goals: [
                    { name: 'PUSH-UPS', target: 100, current: activeQuests.find(quest => quest.type === 'daily').progress || 0 },
                    { name: 'CURL-UPS', target: 100, current: activeQuests.find(quest => quest.type === 'daily').progress || 0 },
                    { name: 'SQUATS', target: 100, current: activeQuests.find(quest => quest.type === 'daily').progress || 0 },
                    { name: 'RUNNING', target: 10, current: activeQuests.find(quest => quest.type === 'daily').progress / 10 || 0, unit: 'km' }
                  ],
                  warning: 'FAILING TO COMPLETE THIS DAILY QUEST WILL BRING A PUNISHMENT ASSOCIATED WITH THIS QUEST.'
                }}
              />
            ) : (
              <Typography variant="body1" color="#e0e0e0">
                No daily quests active. Visit the Quest Board to accept a daily quest.
              </Typography>
            )}
          </Box>
        )}
        
        {/* Active Quests List */}
        {!loading && activeQuests.length > 0 && (
          <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
            <Typography variant="h5" component="h2" className="section-title">
              All Active Quests
            </Typography>
            
            <Grid container spacing={3} className="grid-container">
              {activeQuests.map(quest => (
                <Grid item xs={12} key={quest._id}>
                  {renderQuestCard(quest)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Quest Details Dialog */}
        <Dialog 
          open={showQuestDetails} 
          onClose={() => setShowQuestDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(66, 135, 245, 0.8)',
              boxShadow: '0 0 20px rgba(66, 135, 245, 0.5)'
            }
          }}
        >
          {selectedQuest && (
            <QuestDetails 
              quest={selectedQuest}
              onComplete={handleQuestCompleted}
              onClose={() => setShowQuestDetails(false)}
            />
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ActiveQuests;
