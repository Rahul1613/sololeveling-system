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

const DailyQuestList = ({ quests = { quests: [], refreshTime: '' } }) => {
  const dispatch = useDispatch();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, questId: null });
  const [expanded, setExpanded] = useState({});

  // Handle quest acceptance
  const handleAcceptQuest = useCallback(async (questId) => {
    try {
      await dispatch(acceptQuest(questId)).unwrap();
      setConfirmDialog({ open: false, questId: null });
    } catch (error) {
      console.error('Failed to accept quest:', error);
    }
  }, [dispatch]);

  // Handle dialog open
  const handleOpenConfirmDialog = useCallback((questId) => {
    setConfirmDialog({ open: true, questId });
  }, []);

  // Handle dialog close
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({ open: false, questId: null });
  }, []);

  // Handle card expansion
  const handleExpandClick = useCallback((questId) => {
    setExpanded(prev => ({ ...prev, [questId]: !prev[questId] }));
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
  }, []);

  // Calculate time until refresh
  const calculateTimeUntilRefresh = useMemo(() => {
    return () => {
      if (!quests.refreshTime) return 'Unknown';
      
      const refreshTime = new Date(quests.refreshTime);
      const now = new Date();
      const diffMs = refreshTime - now;
      
      if (diffMs <= 0) return 'Refreshing soon';
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${diffHrs}h ${diffMins}m`;
    };
  }, [quests.refreshTime]);

  return (
    <Box className="container-section">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Daily Quests
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem', color: '#4287f5' }} />
          <Typography variant="body2" color="text.secondary">
            Refreshes in: {calculateTimeUntilRefresh()}
          </Typography>
        </Box>
      </Box>

      {quests.quests && quests.quests.length > 0 ? (
        <Grid container spacing={3}>
          {quests.quests.map((quest) => (
            <QuestItem 
              key={quest._id} 
              quest={quest} 
              expanded={expanded[quest._id] || false}
              onExpand={() => handleExpandClick(quest._id)}
              onAccept={() => handleOpenConfirmDialog(quest._id)}
              formatDifficulty={formatDifficulty}
            />
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5, backgroundColor: 'rgba(10, 10, 15, 0.5)', borderRadius: 2 }}>
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
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 135, 245, 0.5)',
            boxShadow: '0 0 20px rgba(66, 135, 245, 0.4)'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ borderBottom: '1px solid rgba(66, 135, 245, 0.3)' }}>
          Accept Quest
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#e0e0e0', my: 2 }}>
            Are you sure you want to accept this quest? Once accepted, you will need to complete it or abandon it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(66, 135, 245, 0.3)', px: 3, py: 2 }}>
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

// Memoized Quest Item component for better performance
const QuestItem = React.memo(({ quest, expanded, onExpand, onAccept, formatDifficulty }) => {
  return (
    <Grid item xs={12} sm={6} md={4} key={quest._id}>
      <QuestCard difficulty={quest.difficulty}>
        <CardContent className="card-content">
          <QuestTitle variant="h6">
            {quest.title}
          </QuestTitle>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            {formatDifficulty(quest.difficulty)}
            <Typography variant="caption" color="text.secondary">
              {quest.type}
            </Typography>
          </Box>
          
          <QuestDescription variant="body2">
            {quest.description}
          </QuestDescription>
          
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
        
        <CardActions className="card-actions">
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={onAccept}
            disabled={quest.status !== 'available'}
          >
            Accept Quest
          </Button>
          
          <ExpandMore
            expand={expanded}
            onClick={onExpand}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4287f5' }}>
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
  );
});

export default React.memo(DailyQuestList);
