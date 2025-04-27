import React from 'react';
import { Card, ProgressBar, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faBolt, faFistRaised, faRunning, 
  faBrain, faShieldAlt, faDumbbell
} from '@fortawesome/free-solid-svg-icons';
import './ShadowCard.css';

const ShadowCard = ({ shadow, onClick }) => {
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
  
  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'soldier': return '👤';
      case 'knight': return '🛡️';
      case 'mage': return '🧙';
      case 'archer': return '🏹';
      case 'assassin': return '🗡️';
      case 'tank': return '🛡️';
      case 'healer': return '💉';
      case 'boss': return '👑';
      default: return '👤';
    }
  };
  
  // Calculate HP percentage
  const hpPercentage = (shadow.hp.current / shadow.hp.max) * 100;
  
  // Calculate MP percentage
  const mpPercentage = (shadow.mp.current / shadow.mp.max) * 100;
  
  // Calculate XP percentage
  const xpPercentage = (shadow.experience / shadow.experienceToNextLevel) * 100;
  
  return (
    <Card className="shadow-card" onClick={onClick}>
      <div 
        className="rank-indicator" 
        style={{ backgroundColor: getRankColor(shadow.rank) }}
      >
        {shadow.rank}
      </div>
      
      <div className="shadow-image-container">
        <img 
          src={shadow.image || '/images/shadows/default-shadow.png'} 
          alt={shadow.name} 
          className="shadow-image"
        />
        <div className="shadow-type">
          {getTypeIcon(shadow.type)} {shadow.type}
        </div>
      </div>
      
      <Card.Body>
        <Card.Title className="shadow-name">
          {shadow.name}
        </Card.Title>
        
        <div className="shadow-level">
          Level {shadow.level}
          <Badge 
            bg="dark" 
            className="shadow-rank-badge"
            style={{ color: getRankColor(shadow.rank) }}
          >
            {shadow.rank}-Rank
          </Badge>
        </div>
        
        <div className="shadow-stats">
          <div className="stat-bar hp-bar">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <div className="stat-progress">
              <ProgressBar 
                now={hpPercentage} 
                variant="danger" 
                className="hp-progress"
              />
              <div className="stat-value">
                {shadow.hp.current}/{shadow.hp.max}
              </div>
            </div>
          </div>
          
          <div className="stat-bar mp-bar">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <div className="stat-progress">
              <ProgressBar 
                now={mpPercentage} 
                variant="info" 
                className="mp-progress"
              />
              <div className="stat-value">
                {shadow.mp.current}/{shadow.mp.max}
              </div>
            </div>
          </div>
          
          <div className="stat-bar xp-bar">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faDumbbell} />
            </div>
            <div className="stat-progress">
              <ProgressBar 
                now={xpPercentage} 
                variant="success" 
                className="xp-progress"
              />
              <div className="stat-value">
                {shadow.experience}/{shadow.experienceToNextLevel} XP
              </div>
            </div>
          </div>
        </div>
        
        <div className="shadow-attributes">
          <div className="attribute">
            <FontAwesomeIcon icon={faFistRaised} className="attribute-icon strength" />
            <span className="attribute-value">{shadow.stats.strength}</span>
          </div>
          <div className="attribute">
            <FontAwesomeIcon icon={faRunning} className="attribute-icon agility" />
            <span className="attribute-value">{shadow.stats.agility}</span>
          </div>
          <div className="attribute">
            <FontAwesomeIcon icon={faBrain} className="attribute-icon intelligence" />
            <span className="attribute-value">{shadow.stats.intelligence}</span>
          </div>
          <div className="attribute">
            <FontAwesomeIcon icon={faHeart} className="attribute-icon vitality" />
            <span className="attribute-value">{shadow.stats.vitality}</span>
          </div>
          <div className="attribute">
            <FontAwesomeIcon icon={faShieldAlt} className="attribute-icon endurance" />
            <span className="attribute-value">{shadow.stats.endurance}</span>
          </div>
        </div>
        
        {shadow.isDeployed && (
          <div className="deployed-badge">
            Deployed
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ShadowCard;
