import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSkull, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './PenaltyModal.css';

const PenaltyModal = ({ penalty, show, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  // Start animation when modal is shown
  useEffect(() => {
    if (show) {
      // Play penalty sound
      const penaltySound = new Audio('/sounds/penalty.mp3');
      penaltySound.volume = 0.7;
      penaltySound.play().catch(err => console.error('Error playing penalty sound:', err));
      
      // Trigger voice announcement
      const synth = window.speechSynthesis;
      if (synth) {
        const utterance = new SpeechSynthesisUtterance('Warning! Quest failure penalty applied.');
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        synth.speak(utterance);
      }
      
      // Start animation
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(timer);
        setCountdown(10);
        setAnimateIn(false);
      };
    }
  }, [show]);
  
  // Format penalties for display
  const formatPenalties = () => {
    if (!penalty) return [];
    
    const result = [];
    
    if (penalty.experienceLoss > 0) {
      result.push({
        type: 'Experience',
        value: `-${penalty.experienceLoss} XP`,
        icon: '⭐',
        color: '#00c8ff'
      });
    }
    
    if (penalty.currencyLoss > 0) {
      result.push({
        type: 'Currency',
        value: `-${penalty.currencyLoss}`,
        icon: '💰',
        color: '#ffd700'
      });
    }
    
    if (penalty.statPointsLoss > 0) {
      result.push({
        type: 'Stat Points',
        value: `-${penalty.statPointsLoss}`,
        icon: '📊',
        color: '#a335ee'
      });
    }
    
    if (penalty.itemsLost && penalty.itemsLost.length > 0) {
      penalty.itemsLost.forEach(item => {
        result.push({
          type: 'Item Lost',
          value: item.name,
          icon: '📦',
          color: '#ff8000'
        });
      });
    }
    
    if (penalty.debuffs && penalty.debuffs.length > 0) {
      penalty.debuffs.forEach(debuff => {
        result.push({
          type: 'Debuff',
          value: `${debuff.name} (${debuff.duration} hours)`,
          icon: '⚠️',
          color: '#ff4444'
        });
      });
    }
    
    return result;
  };
  
  if (!penalty) return null;
  
  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="penalty-modal-dialog"
      contentClassName={`penalty-modal-content ${animateIn ? 'animate-in' : ''}`}
    >
      <div className="penalty-background">
        <div className="penalty-overlay"></div>
        <div className="penalty-glitch-effect"></div>
      </div>
      
      <div className="penalty-header">
        <div className="skull-icon">
          <FontAwesomeIcon icon={faSkull} />
        </div>
        <h2 className="penalty-title">QUEST FAILURE</h2>
      </div>
      
      <div className="penalty-body">
        <div className="warning-message">
          <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
          <p className="message-text">{penalty.message || 'You have failed to complete your quest within the time limit.'}</p>
        </div>
        
        <div className="penalty-details">
          <h3>Penalties Applied:</h3>
          
          <div className="penalties-list">
            {formatPenalties().map((item, index) => (
              <div key={index} className="penalty-item">
                <div className="penalty-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <div className="penalty-info">
                  <div className="penalty-type">{item.type}</div>
                  <div className="penalty-value" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {penalty.recoveryMethod && (
            <div className="recovery-info">
              <h4>Recovery Method:</h4>
              <p>{penalty.recoveryMethod}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="penalty-footer">
        <Button 
          variant="danger" 
          className="close-btn"
          onClick={onClose}
          disabled={countdown > 0}
        >
          {countdown > 0 ? (
            <>Continue ({countdown})</>
          ) : (
            <>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Close
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default PenaltyModal;
