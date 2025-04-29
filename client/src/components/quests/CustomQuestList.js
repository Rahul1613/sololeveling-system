import React, { useState, useCallback, useMemo } from 'react';
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
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { acceptQuest, abandonQuest } from '../../redux/slices/questSlice';

// Styled components
const QuestCard = styled(Card)(({ theme, difficulty }) => {
  const difficultyColors = {
    'easy': 'rgba(76, 175, 80, 0.5)',
    'medium': 'rgba(255, 152, 0, 0.5)',
    'hard': 'rgba(244, 67, 54, 0.5)',
    'very-hard': 'rgba(156, 39, 176, 0.5)'
  };
  
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${difficultyColors[difficulty] || 'rgba(66, 135, 245, 0.5)'}`,
    boxShadow: `0 4px 20px ${difficultyColors[difficulty] || 'rgba(66, 135, 245, 0.3)'}`,
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 12px 28px ${difficultyColors[difficulty] || 'rgba(66, 135, 245, 0.5)'}`
    }
  };
});

const QuestTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: '#4287f5',
  textShadow: '0 0 8px rgba(66, 135, 245, 0.6)'
}));

const QuestDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: '#e0e0e0'
}));

const RewardChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  border: '1px solid rgba(66, 135, 245, 0.5)',
  '& .MuiChip-icon': {
    color: '#4287f5'
  }
}));

const QuestInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1rem'
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

const CustomQuestList = ({ quests = [] }) => {
  const dispatch = useDispatch();
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    questId: null, 
    action: null // 'accept' or 'reject'
  });
  const [expanded, setExpanded] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle quest acceptance
  const handleAcceptQuest = useCallback(async (questId) => {
    try {
      await dispatch(acceptQuest(questId)).unwrap();
      setConfirmDialog({ open: false, questId: null, action: null });
      setNotification({
        open: true,
        message: 'Quest accepted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to accept quest:', error);
      setNotification({
        open: true,
        message: `Failed to accept quest: ${error.message}`,
        severity: 'error'
      });
    }
  }, [dispatch]);

  // Handle quest rejection/abandonment
  const handleRejectQuest = useCallback(async (questId) => {
    try {
      await dispatch(abandonQuest(questId)).unwrap();
      setConfirmDialog({ open: false, questId: null, action: null });
      setNotification({
        open: true,
        message: 'Quest rejected successfully!',
        severity: 'info'
      });
    } catch (error) {
      console.error('Failed to reject quest:', error);
      setNotification({
        open: true,
        message: `Failed to reject quest: ${error.message}`,
        severity: 'error'
      });
    }
  }, [dispatch]);

  // Handle dialog open
  const handleOpenConfirmDialog = useCallback((questId, action) => {
    setConfirmDialog({ open: true, questId, action });
  }, []);

  // Handle dialog close
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({ open: false, questId: null, action: null });
  }, []);

  // Handle card expansion
  const handleExpandClick = useCallback((questId) => {
    setExpanded(prev => ({ ...prev, [questId]: !prev[questId] }));
  }, []);

  // Handle notification close
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Format difficulty for display
  const formatDifficulty = useMemo(() => {
    return (difficulty) => {
      if (!difficulty) return 'Unknown';
      
      const difficultyColors = {
        'easy': '#4CAF50',
        'medium': '#FF9800',
        'hard': '#F44336',
        'very-hard': '#9C27B0'
      };
      
      const difficultyLabels = {
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'very-hard': 'Very Hard'
      };
      
      return (
        <Chip 
          size="small" 
          label={difficultyLabels[difficulty] || 'Unknown'} 
          sx={{ 
            backgroundColor: `${difficultyColors[difficulty] || '#4287f5'}20`,
            color: difficultyColors[difficulty] || '#4287f5',
            fontWeight: 'bold',
            border: `1px solid ${difficultyColors[difficulty] || '#4287f5'}50`
          }}
        />
      );
    };
  }, []);

  // If no quests, show a message
  if (!quests || quests.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 2 }}>
          No custom quests available
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
          Create your own custom quests to track your personal goals and earn rewards!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {notification.open && (
        <Alert 
          severity={notification.severity} 
          sx={{ mb: 2 }}
          onClose={handleCloseNotification}
        >
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {quests.map(quest => (
          <Grid item xs={12} sm={6} md={4} key={quest._id}>
            <QuestCard difficulty={quest.difficulty}>
              <CardContent className="card-content">
                <QuestTitle variant="h6">
                  {quest.title}
                </QuestTitle>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  {formatDifficulty(quest.difficulty)}
                  <Typography variant="caption" color="text.secondary">
                    Custom Quest
                  </Typography>
                </Box>
                
                <QuestDescription variant="body2">
                  {quest.description}
                </QuestDescription>
                
                {quest.timeEstimate && (
                  <QuestInfoBox>
                    <AccessTimeIcon />
                    <Typography variant="body2">
                      Estimated time: {quest.timeEstimate}
                    </Typography>
                  </QuestInfoBox>
                )}
                
                <Divider sx={{ my: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#4287f5' }}>
                    Rewards:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {quest.rewards.experience > 0 && (
                      <RewardChip
                        size="small"
                        icon={<StarIcon />}
                        label={`${quest.rewards.experience} XP`}
                        color="primary"
                        variant="outlined"
                        className="reward-chip"
                      />
                    )}
                    {quest.rewards.currency > 0 && (
                      <RewardChip
                        size="small"
                        icon={<MonetizationOnIcon />}
                        label={`${quest.rewards.currency} Gold`}
                        color="secondary"
                        variant="outlined"
                        className="reward-chip"
                      />
                    )}
                    {quest.rewards.statPoints > 0 && (
                      <RewardChip
                        size="small"
                        icon={<FitnessCenterIcon />}
                        label={`${quest.rewards.statPoints} Stat Points`}
                        color="success"
                        variant="outlined"
                        className="reward-chip"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions className="card-actions" sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenConfirmDialog(quest._id, 'accept')}
                    disabled={quest.status !== 'available'}
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => handleOpenConfirmDialog(quest._id, 'reject')}
                    startIcon={<DeleteIcon />}
                  >
                    Reject
                  </Button>
                </Box>
                
                <ExpandMore
                  expand={expanded[quest._id]}
                  onClick={() => handleExpandClick(quest._id)}
                  aria-expanded={expanded[quest._id]}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              
              <Collapse in={expanded[quest._id]} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                  <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4287f5' }}>
                    Requirements:
                  </Typography>
                  {quest.requirements && (
                    <>
                      <Typography paragraph variant="body2">
                        Level: {quest.requirements.level}+
                      </Typography>
                      <Typography paragraph variant="body2">
                        Rank: {quest.requirements.rank}+
                      </Typography>
                    </>
                  )}
                  {quest.deadline && (
                    <Typography paragraph variant="body2">
                      Deadline: {quest.deadline}
                    </Typography>
                  )}
                </CardContent>
              </Collapse>
            </QuestCard>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(66, 135, 245, 0.3)' }}>
          {confirmDialog.action === 'accept' ? 'Accept Quest' : 'Reject Quest'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: '#e0e0e0' }}>
            {confirmDialog.action === 'accept' 
              ? 'Are you sure you want to accept this quest? It will be added to your active quests.'
              : 'Are you sure you want to reject this quest? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(66, 135, 245, 0.3)', px: 3, py: 2 }}>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => confirmDialog.action === 'accept' 
              ? handleAcceptQuest(confirmDialog.questId)
              : handleRejectQuest(confirmDialog.questId)
            } 
            color={confirmDialog.action === 'accept' ? 'primary' : 'error'} 
            variant="contained" 
            autoFocus
          >
            {confirmDialog.action === 'accept' ? 'Accept' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(CustomQuestList);
