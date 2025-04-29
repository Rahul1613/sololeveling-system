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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { acceptQuest } from '../../redux/slices/questSlice';

// Styled components
const PunishmentQuestCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  backgroundColor: 'rgba(30, 30, 30, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(156, 39, 176, 0.3)',
  boxShadow: '0 4px 20px rgba(156, 39, 176, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(156, 39, 176, 0.3)',
  },
}));

const QuestTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: '#9c27b0',
}));

const QuestDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const RewardChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
}));

const PenaltyChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
  backgroundColor: 'rgba(156, 39, 176, 0.1)',
  borderColor: 'rgba(156, 39, 176, 0.5)',
  color: '#9c27b0',
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

const PunishmentQuestList = ({ quests = [] }) => {
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
    setExpanded((prev) => ({ ...prev, [questId]: !prev[questId] }));
  };

  // Format difficulty for display
  const formatDifficulty = (difficulty) => {
    if (!difficulty) return 'Unknown';

    const difficultyColors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336',
      'very-hard': '#9C27B0',
    };

    const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    return (
      <Chip
        label={difficultyText}
        size="small"
        sx={{
          backgroundColor: difficultyColors[difficulty] || '#757575',
          color: 'white',
          fontWeight: 'bold',
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorOutlineIcon sx={{ color: '#9c27b0', mr: 1 }} />
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 'bold', color: '#9c27b0' }}
          >
            Punishment Quests
          </Typography>
        </Box>
        <Chip
          icon={<RemoveCircleOutlineIcon />}
          label="Mandatory"
          color="secondary"
          variant="outlined"
        />
      </Box>

      {quests && quests.length > 0 ? (
        <Grid container spacing={3}>
          {quests.map((quest) => (
            <Grid item xs={12} sm={6} md={4} key={quest._id}>
              <PunishmentQuestCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <QuestTitle variant="h6">{quest.title}</QuestTitle>
                    {formatDifficulty(quest.difficulty)}
                  </Box>

                  <QuestDescription variant="body2">
                    {quest.description}
                  </QuestDescription>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="secondary">
                        Time Remaining: {calculateTimeRemaining(quest.deadline)}
                      </Typography>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'text.secondary' }}
                    />
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

                  {quest.penalty && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#9c27b0' }}
                      >
                        Additional Penalties if Not Completed:
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {quest.penalty.experience < 0 && (
                          <PenaltyChip
                            size="small"
                            icon={<StarIcon />}
                            label={`${Math.abs(quest.penalty.experience)} XP`}
                            variant="outlined"
                          />
                        )}
                        {quest.penalty.currency < 0 && (
                          <PenaltyChip
                            size="small"
                            icon={<MonetizationOnIcon />}
                            label={`${Math.abs(quest.penalty.currency)} Gold`}
                            variant="outlined"
                          />
                        )}
                        {quest.penalty.statPoints < 0 && (
                          <PenaltyChip
                            size="small"
                            icon={<FitnessCenterIcon />}
                            label={`${Math.abs(quest.penalty.statPoints)} Stat Points`}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => handleOpenConfirmDialog(quest._id)}
                    disabled={quest.status !== 'available'}
                  >
                    Accept Punishment
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

                    <Typography
                      paragraph
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', color: 'secondary.main' }}
                    >
                      Warning:
                    </Typography>
                    <Typography paragraph variant="body2" color="secondary.main">
                      This is a punishment quest. Ignoring it will result in additional penalties.
                      Complete it to atone for your previous failure.
                    </Typography>
                  </CardContent>
                </Collapse>
              </PunishmentQuestCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No punishment quests available.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Good job! Keep completing your quests on time to avoid punishments.
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
            borderLeft: '4px solid #9c27b0',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: '#9c27b0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorOutlineIcon sx={{ mr: 1 }} />
            Accept Punishment Quest
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This punishment quest was assigned due to a previous failure. Completing it will
            allow you to atone, but ignoring it will result in additional penalties. Do you
            accept this punishment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Not Now
          </Button>
          <Button
            onClick={() => handleAcceptQuest(confirmDialog.questId)}
            color="secondary"
            variant="contained"
            autoFocus
          >
            Accept Punishment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PunishmentQuestList;
