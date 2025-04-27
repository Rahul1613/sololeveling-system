import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { acceptQuest } from '../../redux/slices/questSlice';

// Styled components
const QuestCard = styled(Card)(({ theme, difficulty }) => {
  const difficultyColors = {
    'easy': 'rgba(76, 175, 80, 0.2)',
    'medium': 'rgba(255, 152, 0, 0.2)',
    'hard': 'rgba(244, 67, 54, 0.2)',
    'very-hard': 'rgba(156, 39, 176, 0.2)'
  };
  
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${difficultyColors[difficulty] || 'rgba(255, 255, 255, 0.1)'}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)'
    }
  };
});

const QuestTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main
}));

const QuestDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary
}));

const RewardChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold'
}));

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const DailyQuestList = ({ quests = { quests: [], refreshTime: '' } }) => {
  const dispatch = useDispatch();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, questId: null });
  const [expanded, setExpanded] = useState({});

  // Handle quest acceptance
  const handleAcceptQuest = async (questId) => {
    try {
      await dispatch(acceptQuest(questId)).unwrap();
      setConfirmDialog({ open: false, questId: null });
    } catch (error) {
      console.error('Failed to accept quest:', error);
    }
  };

  // Handle dialog open
  const handleOpenConfirmDialog = (questId) => {
    setConfirmDialog({ open: true, questId });
  };

  // Handle dialog close
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, questId: null });
  };

  // Handle card expansion
  const handleExpandClick = (questId) => {
    setExpanded(prev => ({ ...prev, [questId]: !prev[questId] }));
  };

  // Format difficulty for display
  const formatDifficulty = (difficulty) => {
    if (!difficulty) return 'Unknown';
    
    const difficultyColors = {
      'easy': '#4CAF50',
      'medium': '#FF9800',
      'hard': '#F44336',
      'very-hard': '#9C27B0'
    };
    
    const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    return (
      <Chip 
        label={difficultyText} 
        size="small" 
        sx={{ 
          backgroundColor: difficultyColors[difficulty] || '#757575',
          color: 'white',
          fontWeight: 'bold'
        }} 
      />
    );
  };

  // Calculate time until refresh
  const calculateTimeUntilRefresh = () => {
    if (!quests.refreshTime) return 'Unknown';
    
    const refreshTime = new Date(quests.refreshTime);
    const now = new Date();
    const diffMs = refreshTime - now;
    
    if (diffMs <= 0) return 'Refreshing soon';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Daily Quests
        </Typography>
        <Chip
          icon={<AccessTimeIcon />}
          label={`Refreshes in: ${calculateTimeUntilRefresh()}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {quests.quests && quests.quests.length > 0 ? (
        <Grid container spacing={3}>
          {quests.quests.map((quest) => (
            <Grid item xs={12} sm={6} md={4} key={quest._id}>
              <QuestCard difficulty={quest.difficulty}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <QuestTitle variant="h6">
                      {quest.title}
                    </QuestTitle>
                    {formatDifficulty(quest.difficulty)}
                  </Box>
                  
                  <QuestDescription variant="body2">
                    {quest.description}
                  </QuestDescription>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {quest.timeEstimate}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Rewards:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <RewardChip
                      size="small"
                      icon={<StarIcon />}
                      label={`${quest.rewards.experience} XP`}
                      color="primary"
                      variant="outlined"
                    />
                    <RewardChip
                      size="small"
                      icon={<MonetizationOnIcon />}
                      label={`${quest.rewards.currency} Gold`}
                      color="secondary"
                      variant="outlined"
                    />
                    {quest.rewards.statPoints > 0 && (
                      <RewardChip
                        size="small"
                        icon={<FitnessCenterIcon />}
                        label={`${quest.rewards.statPoints} Stat Points`}
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenConfirmDialog(quest._id)}
                    disabled={quest.status !== 'available'}
                  >
                    Accept Quest
                  </Button>
                  
                  <ExpandMore
                    expand={expanded[quest._id] || false}
                    onClick={() => handleExpandClick(quest._id)}
                    aria-expanded={expanded[quest._id] || false}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>
                
                <Collapse in={expanded[quest._id] || false} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Requirements:
                    </Typography>
                    <Typography paragraph variant="body2">
                      Level: {quest.requirements.level}+
                    </Typography>
                    <Typography paragraph variant="body2">
                      Rank: {quest.requirements.rank}+
                    </Typography>
                  </CardContent>
                </Collapse>
              </QuestCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No daily quests available at the moment.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check back later for new quests.
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Accept Quest
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to accept this quest? Once accepted, you will need to complete it or abandon it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => handleAcceptQuest(confirmDialog.questId)} 
            color="primary" 
            variant="contained" 
            autoFocus
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyQuestList;
