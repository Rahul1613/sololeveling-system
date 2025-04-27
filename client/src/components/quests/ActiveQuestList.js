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
  LinearProgress,
  Slider,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import { updateQuestProgress, completeQuest, abandonQuest } from '../../redux/slices/questSlice';

// Styled components
const ActiveQuestCard = styled(Card)(({ theme, questType }) => {
  const typeColors = {
    'daily': 'rgba(76, 175, 80, 0.3)',
    'emergency': 'rgba(244, 67, 54, 0.3)',
    'punishment': 'rgba(156, 39, 176, 0.3)',
    'custom': 'rgba(33, 150, 243, 0.3)'
  };
  
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${typeColors[questType] || 'rgba(255, 255, 255, 0.1)'}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)'
    }
  };
});

const QuestTitle = styled(Typography)(({ theme, questType }) => {
  const typeColors = {
    'daily': '#4CAF50',
    'emergency': '#F44336',
    'punishment': '#9C27B0',
    'custom': '#2196F3'
  };
  
  return {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    color: typeColors[questType] || theme.palette.primary.main
  };
});

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

const ActiveQuestList = ({ quests = [] }) => {
  const dispatch = useDispatch();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, questId: null, action: null });
  const [expanded, setExpanded] = useState({});
  const [progressDialog, setProgressDialog] = useState({ open: false, questId: null, progress: 0 });
  const [completeDialog, setCompleteDialog] = useState({ open: false, questId: null, proof: null });
  const [proofDescription, setProofDescription] = useState('');

  // Handle quest completion
  const handleCompleteQuest = async () => {
    try {
      await dispatch(completeQuest({ 
        questId: completeDialog.questId, 
        proof: { description: proofDescription } 
      })).unwrap();
      
      setCompleteDialog({ open: false, questId: null, proof: null });
      setProofDescription('');
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  // Handle quest abandonment
  const handleAbandonQuest = async () => {
    try {
      await dispatch(abandonQuest(confirmDialog.questId)).unwrap();
      setConfirmDialog({ open: false, questId: null, action: null });
    } catch (error) {
      console.error('Failed to abandon quest:', error);
    }
  };

  // Handle progress update
  const handleUpdateProgress = async () => {
    try {
      await dispatch(updateQuestProgress({ 
        questId: progressDialog.questId, 
        progress: progressDialog.progress 
      })).unwrap();
      
      setProgressDialog({ open: false, questId: null, progress: 0 });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Handle dialog open for confirmation
  const handleOpenConfirmDialog = (questId, action) => {
    setConfirmDialog({ open: true, questId, action });
  };

  // Handle dialog close for confirmation
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, questId: null, action: null });
  };

  // Handle dialog open for progress update
  const handleOpenProgressDialog = (questId, currentProgress) => {
    setProgressDialog({ open: true, questId, progress: currentProgress });
  };

  // Handle dialog close for progress update
  const handleCloseProgressDialog = () => {
    setProgressDialog({ open: false, questId: null, progress: 0 });
  };

  // Handle dialog open for quest completion
  const handleOpenCompleteDialog = (questId) => {
    setCompleteDialog({ open: true, questId, proof: null });
  };

  // Handle dialog close for quest completion
  const handleCloseCompleteDialog = () => {
    setCompleteDialog({ open: false, questId: null, proof: null });
    setProofDescription('');
  };

  // Handle card expansion
  const handleExpandClick = (questId) => {
    setExpanded(prev => ({ ...prev, [questId]: !prev[questId] }));
  };

  // Format quest type for display
  const formatQuestType = (type) => {
    if (!type) return 'Unknown';
    
    const typeColors = {
      'daily': '#4CAF50',
      'emergency': '#F44336',
      'punishment': '#9C27B0',
      'custom': '#2196F3'
    };
    
    const typeText = type.charAt(0).toUpperCase() + type.slice(1);
    
    return (
      <Chip 
        label={typeText} 
        size="small" 
        sx={{ 
          backgroundColor: typeColors[type] || '#757575',
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PlayArrowIcon sx={{ color: '#2196F3', mr: 1 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Active Quests
          </Typography>
        </Box>
      </Box>

      {quests && quests.length > 0 ? (
        <Grid container spacing={3}>
          {quests.map((quest) => (
            <Grid item xs={12} sm={6} md={4} key={quest._id}>
              <ActiveQuestCard questType={quest.type}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <QuestTitle variant="h6" questType={quest.type}>
                      {quest.title}
                    </QuestTitle>
                    {formatQuestType(quest.type)}
                  </Box>
                  
                  <QuestDescription variant="body2">
                    {quest.description}
                  </QuestDescription>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" color="primary">
                        Progress: {quest.progress}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quest.deadline ? `Deadline: ${calculateTimeRemaining(quest.deadline)}` : ''}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={quest.progress} 
                      color={
                        quest.type === 'daily' ? 'success' :
                        quest.type === 'emergency' ? 'error' :
                        quest.type === 'punishment' ? 'secondary' : 'primary'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
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
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    startIcon={<UpdateIcon />}
                    onClick={() => handleOpenProgressDialog(quest._id, quest.progress)}
                  >
                    Update
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="small"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => handleOpenCompleteDialog(quest._id)}
                    disabled={quest.progress < 100}
                  >
                    Complete
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => handleOpenConfirmDialog(quest._id, 'abandon')}
                  >
                    Abandon
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
                      Quest Details:
                    </Typography>
                    <Typography paragraph variant="body2">
                      Accepted on: {new Date(quest.acceptedAt).toLocaleString()}
                    </Typography>
                    <Typography paragraph variant="body2">
                      Type: {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
                    </Typography>
                    <Typography paragraph variant="body2">
                      Difficulty: {quest.difficulty ? quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1) : 'Unknown'}
                    </Typography>
                  </CardContent>
                </Collapse>
              </ActiveQuestCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            You have no active quests.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Visit the Daily, Emergency, or Custom Quest tabs to accept new quests.
          </Typography>
        </Box>
      )}

      {/* Abandon Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open && confirmDialog.action === 'abandon'}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="abandon-dialog-title"
        aria-describedby="abandon-dialog-description"
      >
        <DialogTitle id="abandon-dialog-title" sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CancelOutlinedIcon sx={{ mr: 1 }} />
            Abandon Quest
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="abandon-dialog-description">
            Are you sure you want to abandon this quest? All progress will be lost, and for certain quest types, you may incur penalties.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAbandonQuest} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Abandon Quest
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog
        open={progressDialog.open}
        onClose={handleCloseProgressDialog}
        aria-labelledby="progress-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="progress-dialog-title" sx={{ color: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UpdateIcon sx={{ mr: 1 }} />
            Update Quest Progress
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Current Progress: {progressDialog.progress}%
            </Typography>
            <Slider
              value={progressDialog.progress}
              onChange={(e, newValue) => setProgressDialog({ ...progressDialog, progress: newValue })}
              aria-labelledby="progress-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgressDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProgress} 
            color="primary" 
            variant="contained" 
            autoFocus
          >
            Update Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Quest Dialog */}
      <Dialog
        open={completeDialog.open}
        onClose={handleCloseCompleteDialog}
        aria-labelledby="complete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="complete-dialog-title" sx={{ color: 'success.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlineIcon sx={{ mr: 1 }} />
            Complete Quest
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide a brief description of how you completed this quest. This will be used for verification.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="proof-description"
            label="Completion Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteQuest} 
            color="success" 
            variant="contained" 
            autoFocus
            disabled={!proofDescription.trim()}
          >
            Complete Quest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveQuestList;
