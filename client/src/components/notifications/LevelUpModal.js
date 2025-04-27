import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import SystemPanel from '../common/SystemPanel';
import SystemButton from '../common/SystemButton';
import { updateUserStats } from '../../redux/slices/userSlice';
import './ModalStyles.css';

const LevelUpModal = ({ data, onClose }) => {
  const dispatch = useDispatch();
  const [statPoints, setStatPoints] = useState({
    strength: 0,
    agility: 0,
    intelligence: 0,
    vitality: 0,
    endurance: 0,
    luck: 0
  });
  const [remainingPoints, setRemainingPoints] = useState(data.statPoints || 5);
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Play level up sound when modal opens
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(`Level up! You have reached level ${data.level}.`);
      utterance.rate = 0.9;
      synth.speak(utterance);
    }
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [data.level]);
  
  // Increment stat
  const incrementStat = (stat) => {
    if (remainingPoints > 0) {
      setStatPoints(prev => ({
        ...prev,
        [stat]: prev[stat] + 1
      }));
      setRemainingPoints(prev => prev - 1);
    }
  };
  
  // Decrement stat
  const decrementStat = (stat) => {
    if (statPoints[stat] > 0) {
      setStatPoints(prev => ({
        ...prev,
        [stat]: prev[stat] - 1
      }));
      setRemainingPoints(prev => prev + 1);
    }
  };
  
  // Submit stat allocation
  const handleSubmit = () => {
    // Only dispatch if points were allocated
    if (Object.values(statPoints).some(val => val > 0)) {
      dispatch(updateUserStats(statPoints));
    }
    onClose();
  };
  
  return (
    <SystemPanel style={{ p: 3, textAlign: 'center', minWidth: 280 }}>
      <DialogTitle sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 24, letterSpacing: 2, textShadow: '0 0 8px #00eaffcc' }}>
        SYSTEM
      </DialogTitle>
      <DialogContent>
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className="confetti" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
                }}
              />
            ))}
          </div>
        )}
        
        <Typography sx={{ color: '#eaf6ff', fontSize: 20, fontWeight: 700, mb: 2, textShadow: '0 0 8px #4eafe9cc' }}>
          LEVEL UP!
        </Typography>
        <Typography sx={{ color: '#00eaff', fontSize: 18, fontFamily: 'Orbitron', letterSpacing: 1 }}>
          You are now Level {data.level}
        </Typography>
        
        <div className="stat-allocation-section">
          <h3>Allocate Stat Points: {remainingPoints} remaining</h3>
          
          <div className="stat-grid">
            {Object.keys(statPoints).map(stat => (
              <div key={stat} className="stat-item">
                <div className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                <div className="stat-controls">
                  <button 
                    className="stat-btn decrease" 
                    onClick={() => decrementStat(stat)}
                    disabled={statPoints[stat] === 0}
                  >
                    -
                  </button>
                  <span className="stat-value">{statPoints[stat]}</span>
                  <button 
                    className="stat-btn increase" 
                    onClick={() => incrementStat(stat)}
                    disabled={remainingPoints === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <SystemButton onClick={handleSubmit}>Confirm</SystemButton>
      </DialogActions>
    </SystemPanel>
  );
};

export default LevelUpModal;
