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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Collapse,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import AlarmIcon from '@mui/icons-material/Alarm';
import { acceptQuest } from '../../redux/slices/questSlice';

// Styled components
const EmergencyQuestCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  backgroundColor: 'rgba(10, 10, 15, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(244, 67, 54, 0.5)',
  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(244, 67, 54, 0.5)'
  }
}));

const QuestTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: '#f44336',
  textShadow: '0 0 8px rgba(244, 67, 54, 0.6)'
}));

const QuestDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: '#e0e0e0'
}));

const RewardChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  border: '1px solid rgba(244, 67, 54, 0.5)',
  '& .MuiChip-icon': {
    color: '#f44336'
  }
}));

const QuestInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1rem',
    color: '#f44336'
  }
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

const EmergencyQuestList = ({ quests = [] }) => {
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

  // Calculate time remaining until deadline
  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const deadlineTime = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineTime - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // Calculate urgency percentage for progress bar
  const calculateUrgency = (deadline) => {
    if (!deadline) return 100;
    
    const deadlineTime = new Date(deadline);
    const now = new Date();
    const totalTime = 24 * 60 * 60 * 1000; // Assuming emergency quests have 24 hours max
    const timeLeft = deadlineTime - now;
    
    if (timeLeft <= 0) return 100;
    
    const urgency = 100 - (timeLeft / totalTime * 100);
    return Math.min(Math.max(urgency, 0), 100);
  };

  return (
    <Box className="container-section">
      <Box className="flex-between" sx={{ mb: 3 }}>
        <Typography variant="h5" className="section-title" sx={{ mb: 0, color: '#f44336', textShadow: '0 0 10px rgba(244, 67, 54, 0.7)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            Emergency Quests
          </Box>
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3, backgroundColor: 'rgba(244, 67, 54, 0.3)', boxShadow: '0 0 5px rgba(244, 67, 54, 0.2)' }} />
      
      {quests && quests.length > 0 ? (
        <Grid container spacing={3} className="grid-container">
          {quests.map(quest => (
            <Grid item xs={12} sm={6} md={4} key={quest._id}>
              <EmergencyQuestCard className="quest-card">
                <CardContent className="card-content">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <QuestTitle variant="h6" className="quest-title">
                      {quest.title}
                    </QuestTitle>
                    {formatDifficulty(quest.difficulty)}
                  </Box>
                  
                  <QuestDescription variant="body2" className="quest-description">
                    {quest.description}
                  </QuestDescription>
                  
                  {/* Urgency Bar */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <AlarmIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                        Urgency
                      </Typography>
                      <Typography variant="body2">
                        {calculateTimeRemaining(quest.deadline)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUrgency(quest.deadline)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#f44336',
                          boxShadow: '0 0 10px rgba(244, 67, 54, 0.8)'
                        }
                      }}
                    />
                  </Box>
                  
                  <QuestInfoBox className="quest-info">
                    <AccessTimeIcon className="quest-info-icon" />
                    <Typography variant="body2">
                      Time Limit: {quest.timeLimit} hours
                    </Typography>
                  </QuestInfoBox>
                  
                  <Box className="quest-rewards">
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#f44336' }}>
                      Rewards:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      <RewardChip
                        size="small"
                        icon={<StarIcon />}
                        label={`${quest.rewards.experience} XP`}
                        color="error"
                        variant="outlined"
                        className="reward-chip"
                      />
                      <RewardChip
                        size="small"
                        icon={<MonetizationOnIcon />}
                        label={`${quest.rewards.currency} Gold`}
                        color="error"
                        variant="outlined"
                        className="reward-chip"
                      />
                      {quest.rewards.statPoints > 0 && (
                        <RewardChip
                          size="small"
                          icon={<FitnessCenterIcon />}
                          label={`${quest.rewards.statPoints} Stat Points`}
                          color="error"
                          variant="outlined"
                          className="reward-chip"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions className="card-actions">
                  <Button 
                    variant="contained" 
                    color="error" 
                    size="small"
                    onClick={() => handleOpenConfirmDialog(quest._id)}
                    disabled={quest.status !== 'available'}
                    sx={{ boxShadow: '0 0 15px rgba(244, 67, 54, 0.5)' }}
                  >
                    Accept Emergency
                  </Button>
                  
                  <ExpandMore
                    expand={expanded[quest._id] || false}
                    onClick={() => handleExpandClick(quest._id)}
                    aria-expanded={expanded[quest._id] || false}
                    aria-label="show more"
                    sx={{ color: '#f44336' }}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>
                
                <Collapse in={expanded[quest._id] || false} timeout="auto" unmountOnExit>
                  <CardContent sx={{ pt: 0 }}>
                    <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      Requirements:
                    </Typography>
                    <Typography paragraph variant="body2">
                      Level: {quest.requirements.level}+
                    </Typography>
                    <Typography paragraph variant="body2">
                      Rank: {quest.requirements.rank}+
                    </Typography>
                    
                    <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      Warning:
                    </Typography>
                    <Typography paragraph variant="body2" sx={{ color: '#f44336' }}>
                      Failure to complete this emergency quest before the deadline may result in penalties.
                    </Typography>
                  </CardContent>
                </Collapse>
              </EmergencyQuestCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5, backgroundColor: 'rgba(10, 10, 15, 0.5)', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No emergency quests available at the moment.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Stay alert for new emergency situations.
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 67, 54, 0.8)',
            boxShadow: '0 0 20px rgba(244, 67, 54, 0.5)',
            borderLeft: '4px solid #f44336'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: '#f44336', borderBottom: '1px solid rgba(244, 67, 54, 0.3)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            Accept Emergency Quest
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#e0e0e0', my: 2 }}>
            This is an emergency quest with a strict deadline. Failure to complete it in time may result in penalties. Are you sure you want to accept this challenge?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(244, 67, 54, 0.3)', px: 3, py: 2 }}>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => handleAcceptQuest(confirmDialog.questId)} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ boxShadow: '0 0 15px rgba(244, 67, 54, 0.5)' }}
          >
            Accept Emergency
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyQuestList;
