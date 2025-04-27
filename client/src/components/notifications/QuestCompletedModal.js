import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import SystemPanel from '../common/SystemPanel';
import SystemButton from '../common/SystemButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll, faCoins, faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';

const QuestCompletedModal = ({ data, onClose }) => {
  // Play quest completion sound when modal opens
  React.useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(`Quest completed! You have earned rewards.`);
      utterance.rate = 0.9;
      synth.speak(utterance);
    }
  }, []);

  // Format rewards for display
  const formatRewards = () => {
    const rewards = [];
    
    if (data.rewards.experience) {
      rewards.push(
        <div key="exp" className="reward-item">
          <div className="reward-icon xp">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="reward-details">
            <span className="reward-value">+{data.rewards.experience}</span>
            <span className="reward-label">Experience</span>
          </div>
        </div>
      );
    }
    
    if (data.rewards.currency) {
      rewards.push(
        <div key="currency" className="reward-item">
          <div className="reward-icon currency">
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className="reward-details">
            <span className="reward-value">+{data.rewards.currency}</span>
            <span className="reward-label">Currency</span>
          </div>
        </div>
      );
    }
    
    if (data.rewards.statPoints) {
      rewards.push(
        <div key="stats" className="reward-item">
          <div className="reward-icon stats">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div className="reward-details">
            <span className="reward-value">+{data.rewards.statPoints}</span>
            <span className="reward-label">Stat Points</span>
          </div>
        </div>
      );
    }
    
    return rewards;
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="xs" PaperProps={{ style: { background: 'none', boxShadow: 'none' } }}>
      <SystemPanel style={{ p: 3, textAlign: 'center', minWidth: 280 }}>
        <DialogTitle sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 24, letterSpacing: 2, textShadow: '0 0 8px #00eaffcc' }}>
          SYSTEM
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#eaf6ff', fontSize: 20, fontWeight: 700, mb: 2, textShadow: '0 0 8px #4eafe9cc' }}>
            QUEST COMPLETED!
          </Typography>
          <Typography sx={{ color: '#00eaff', fontSize: 16, fontFamily: 'Orbitron', letterSpacing: 1, mb: 1 }}>
            {data.questTitle || "Quest"}
          </Typography>
          <Typography sx={{ color: '#b8eaff', fontSize: 15 }}>
            Rewards:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {formatRewards()}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <SystemButton onClick={onClose}>OK</SystemButton>
        </DialogActions>
      </SystemPanel>
    </Dialog>
  );
};

export default QuestCompletedModal;
