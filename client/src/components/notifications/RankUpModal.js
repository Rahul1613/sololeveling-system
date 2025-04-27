import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faMedal } from '@fortawesome/free-solid-svg-icons';
import './ModalStyles.css';

const RankUpModal = ({ data, onClose }) => {
  const [animateRank, setAnimateRank] = useState(false);
  
  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 'S': return '#ff5e00';
      case 'A': return '#ff0000';
      case 'B': return '#a335ee';
      case 'C': return '#0070dd';
      case 'D': return '#1eff00';
      case 'E': return '#ffffff';
      default: return '#ffffff';
    }
  };
  
  // Get rank medal
  const getRankMedal = (rank) => {
    switch (rank) {
      case 'S': return 'rank-medal-s';
      case 'A': return 'rank-medal-a';
      case 'B': return 'rank-medal-b';
      case 'C': return 'rank-medal-c';
      case 'D': return 'rank-medal-d';
      case 'E': return 'rank-medal-e';
      default: return 'rank-medal-e';
    }
  };
  
  // Play rank up sound when modal opens
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(`Rank up! You have reached rank ${data.rank}.`);
      utterance.rate = 0.9;
      synth.speak(utterance);
    }
    
    // Start animation after a short delay
    setTimeout(() => {
      setAnimateRank(true);
    }, 500);
  }, [data.rank]);
  
  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      centered 
      backdrop="static" 
      className="solo-leveling-modal rank-up-modal"
      size="lg"
    >
      <div className="modal-glow rank-glow" style={{ borderColor: getRankColor(data.rank) }}></div>
      
      <Modal.Header>
        <Modal.Title className="text-center w-100">
          <FontAwesomeIcon icon={faArrowUp} className="me-2 rank-icon" />
          RANK UP!
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="rank-announcement">
          <h2>Your Rank Has Increased!</h2>
          
          <div className={`rank-display ${animateRank ? 'animate' : ''}`}>
            <div className={`rank-medal ${getRankMedal(data.rank)}`}>
              <FontAwesomeIcon icon={faMedal} className="medal-icon" />
              <span className="rank-letter" style={{ color: getRankColor(data.rank) }}>
                {data.rank}
              </span>
            </div>
          </div>
          
          <div className="rank-description">
            <p>You have reached <span style={{ color: getRankColor(data.rank) }}>Rank {data.rank}</span></p>
            <p className="rank-benefits">
              {data.rank === 'S' && "You have reached the highest rank! You now have access to legendary quests and items."}
              {data.rank === 'A' && "You now have access to elite quests and rare shadow soldiers."}
              {data.rank === 'B' && "You now have access to advanced quests and better rewards."}
              {data.rank === 'C' && "You now have access to intermediate quests and more shadow soldiers."}
              {data.rank === 'D' && "You now have access to beginner quests and basic shadow soldiers."}
              {data.rank === 'E' && "You have just begun your journey. Complete quests to rank up!"}
            </p>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="primary" 
          className="solo-btn confirm-btn" 
          onClick={onClose}
          style={{ backgroundColor: getRankColor(data.rank) }}
        >
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RankUpModal;
