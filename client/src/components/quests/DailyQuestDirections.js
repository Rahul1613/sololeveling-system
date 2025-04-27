import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import UploadIcon from '@mui/icons-material/Upload';
import VideoVerification from '../verification/VideoVerification';
import mockQuestService from '../../api/mockQuestService';
import { updateExperience } from '../../redux/slices/userSlice';
import SystemPanel from '../common/SystemPanel';
import SystemButton from '../common/SystemButton';

const REWARD = {
  xp: 500,
  message: 'You gained 500 XP!'
};

const DailyQuestDirections = ({ quest }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.userStats);

  const defaultQuest = {
    _id: 'daily-quest-1',
    title: 'GETTING READY TO BECOME POWERFUL',
    goals: [
      { name: 'PUSH-UPS', target: 100, current: 0 },
      { name: 'CURL-UPS', target: 100, current: 0 },
      { name: 'SQUATS', target: 100, current: 0 },
      { name: 'RUNNING', target: 10, current: 0, unit: 'km' }
    ],
    warning: 'FAILING TO COMPLETE THIS DAILY QUEST WILL BRING A PUNISHMENT ASSOCIATED WITH THIS QUEST.'
  };

  const questData = quest || defaultQuest;
  const [goalTargets, setGoalTargets] = useState(questData.goals.map(g => g.target));
  const [goalProgress, setGoalProgress] = useState(questData.goals.map(g => g.current));
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [punished, setPunished] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const handleTargetChange = (idx, delta) => {
    setGoalTargets(prev => {
      const updated = [...prev];
      let newValue = updated[idx] + delta;
      if (newValue < 0) newValue = 0;
      updated[idx] = newValue;
      return updated;
    });
  };

  const handleProgressChange = (idx, value) => {
    setGoalProgress(prev => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const allGoalsMet = goalProgress.every((val, idx) => val >= goalTargets[idx] && goalTargets[idx] > 0);

  const handleCompleteQuest = () => {
    setShowProofDialog(true);
  };

  const handlePunish = () => {
    setPunished(true);
    setSuccessMsg('You failed the daily quest. Punishment triggered!');
  };

  const handleVerificationSubmitted = (result) => {
    setShowProofDialog(false);
    if (result && result.success) {
      setCompleted(true);
      setSuccessMsg('Quest completed! Proof submitted. Awaiting verification.');
      setErrorMsg('');
    } else {
      setErrorMsg('Verification failed. Please try again.');
    }
  };

  const handleClaimReward = async () => {
    setShowRewardDialog(true);
    setRewardClaimed(true);
    if (user && user._id) {
      dispatch(updateExperience({ userId: user._id, experiencePoints: REWARD.xp }));
    }
  };

  return (
    <SystemPanel style={{ mt: 2, mb: 2 }}>
      <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: 22, mb: 1, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
        DAILY QUEST - {questData.title}
      </Typography>
      <Box className="quest-goal-section">
        <Typography variant="h6" className="goal-header" sx={{ color: '#4eafe9', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 18, mb: 1 }}>
          GOAL
        </Typography>
        {questData.goals.map((goal, index) => (
          <Grid key={index} container alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <Typography variant="body1" className="goal-name" sx={{ color: '#eaf6ff', fontWeight: 600, fontSize: 15 }}>
                {goal.name}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={() => handleTargetChange(index, -1)} disabled={completed || punished} size="small" sx={{ color: '#00eaff' }}>
                <RemoveIcon />
              </IconButton>
            </Grid>
            <Grid item xs={2}>
              <TextField
                type="number"
                value={goalTargets[index]}
                size="small"
                inputProps={{ min: 0, style: { width: 40, textAlign: 'center', color: '#00eaff', fontWeight: 700 } }}
                onChange={e => handleTargetChange(index, parseInt(e.target.value, 10) - goalTargets[index])}
                disabled={completed || punished}
                sx={{ input: { color: '#00eaff', background: 'rgba(30,60,120,0.3)', borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={() => handleTargetChange(index, 1)} disabled={completed || punished} size="small" sx={{ color: '#00eaff' }}>
                <AddIcon />
              </IconButton>
            </Grid>
            <Grid item xs={2}>
              <TextField
                type="number"
                value={goalProgress[index]}
                size="small"
                inputProps={{ min: 0, style: { width: 40, textAlign: 'center', color: '#4eafe9', fontWeight: 700 } }}
                onChange={e => handleProgressChange(index, Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={completed || punished}
                label="Done"
                sx={{ input: { color: '#4eafe9', background: 'rgba(20,40,60,0.3)', borderRadius: 1 } }}
              />
            </Grid>
          </Grid>
        ))}
      </Box>
      {!completed && !punished && (
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <SystemButton
            startIcon={<UploadIcon />}
            onClick={handleCompleteQuest}
            disabled={!allGoalsMet}
          >
            Complete Quest (Upload Video Proof)
          </SystemButton>
          <SystemButton
            style={{ background: 'linear-gradient(90deg, #ff4eae 0%, #4eafe9 100%)', color: '#fff' }}
            onClick={handlePunish}
          >
            Fail Quest (Punishment)
          </SystemButton>
        </Box>
      )}
      {completed && !rewardClaimed && (
        <Box mt={3} p={2} textAlign="center">
          <Typography color="#00eaff" fontWeight="bold">{successMsg}</Typography>
          <SystemButton sx={{ mt: 2 }} onClick={handleClaimReward}>
            Claim Reward
          </SystemButton>
        </Box>
      )}
      {completed && rewardClaimed && (
        <Box mt={3} p={2} textAlign="center">
          <Typography color="#00eaff" fontWeight="bold">{REWARD.message}</Typography>
        </Box>
      )}
      {punished && (
        <Box mt={3} p={2} textAlign="center">
          <Typography color="#ff4eae" fontWeight="bold">{successMsg}</Typography>
          <Typography color="#ff4eae" mt={1}>You must complete a punishment quest!</Typography>
        </Box>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>
      )}
      <Box className="quest-warning" sx={{ color: '#b8eaff', fontSize: 13, mt: 2 }}>
        <Typography variant="body2" className="warning-text">
          {questData.warning}
        </Typography>
      </Box>
      {/* Proof Upload Dialog */}
      <Dialog open={showProofDialog} onClose={() => setShowProofDialog(false)} maxWidth="sm" fullWidth PaperProps={{ style: { background: 'rgba(20,40,60,0.95)', borderRadius: 18, border: '2px solid #4eafe9', boxShadow: '0 0 20px #00eaff99' } }}>
        <DialogTitle sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 20, letterSpacing: 1.5 }}>Complete Quest - Upload Video Proof</DialogTitle>
        <DialogContent>
          <VideoVerification quest={questData} onVerificationSubmitted={handleVerificationSubmitted} />
        </DialogContent>
        <DialogActions>
          <SystemButton onClick={() => setShowProofDialog(false)} style={{ background: 'linear-gradient(90deg, #ff4eae 0%, #4eafe9 100%)', color: '#fff' }}>Cancel</SystemButton>
        </DialogActions>
      </Dialog>
      {/* Reward Dialog */}
      <Dialog open={showRewardDialog} onClose={() => setShowRewardDialog(false)} PaperProps={{ style: { background: 'rgba(20,40,60,0.95)', borderRadius: 18, border: '2px solid #4eafe9', boxShadow: '0 0 20px #00eaff99' } }}>
        <DialogTitle sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 20, letterSpacing: 1.5 }}>Reward Claimed!</DialogTitle>
        <DialogContent>
          <Typography>{REWARD.message}</Typography>
        </DialogContent>
        <DialogActions>
          <SystemButton onClick={() => setShowRewardDialog(false)}>OK</SystemButton>
        </DialogActions>
      </Dialog>
    </SystemPanel>
  );
};

export default DailyQuestDirections;
