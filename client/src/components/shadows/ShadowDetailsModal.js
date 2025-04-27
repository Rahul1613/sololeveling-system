import React, { useState } from 'react';
import { Modal, Button, Tabs, Tab, ProgressBar, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faBolt, faFistRaised, faRunning, faBrain, 
  faShieldAlt, faDumbbell, faMagic, faArrowUp,
  faTrash, faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../../redux/slices/notificationSlice';
import './ShadowDetailsModal.css';

const ShadowDetailsModal = ({ shadow, show, onHide, onUpdate }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
  
  // Calculate HP percentage
  const hpPercentage = (shadow.hp.current / shadow.hp.max) * 100;
  
  // Calculate MP percentage
  const mpPercentage = (shadow.mp.current / shadow.mp.max) * 100;
  
  // Calculate XP percentage
  const xpPercentage = (shadow.experience / shadow.experienceToNextLevel) * 100;
  
  // Handle level up shadow
  const handleLevelUp = async () => {
    if (!shadow) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/shadows/${shadow._id}/level-up`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Leveled Up',
        message: `${shadow.name} has reached level ${response.data.newLevel}!`,
        style: 'success',
        soundEffect: 'shadow_level_up.mp3'
      }));
      
      // Update shadow data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error leveling up shadow:', error);
      setError(error.response?.data?.message || 'Failed to level up shadow');
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Level Up Failed',
        message: error.response?.data?.message || 'Failed to level up shadow',
        style: 'danger'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deploy shadow
  const handleDeploy = async () => {
    if (!shadow) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`/api/shadows/${shadow._id}/deploy`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Deployed',
        message: `${shadow.name} has been deployed!`,
        style: 'success',
        soundEffect: 'shadow_deploy.mp3'
      }));
      
      // Update shadow data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deploying shadow:', error);
      setError(error.response?.data?.message || 'Failed to deploy shadow');
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Deployment Failed',
        message: error.response?.data?.message || 'Failed to deploy shadow',
        style: 'danger'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle recall shadow
  const handleRecall = async () => {
    if (!shadow) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`/api/shadows/${shadow._id}/recall`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Recalled',
        message: `${shadow.name} has been recalled!`,
        style: 'success',
        soundEffect: 'shadow_recall.mp3'
      }));
      
      // Update shadow data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error recalling shadow:', error);
      setError(error.response?.data?.message || 'Failed to recall shadow');
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Recall Failed',
        message: error.response?.data?.message || 'Failed to recall shadow',
        style: 'danger'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dismiss shadow
  const handleDismiss = async () => {
    if (!shadow) return;
    
    if (!window.confirm(`Are you sure you want to dismiss ${shadow.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/shadows/${shadow._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Dismissed',
        message: `${shadow.name} has been dismissed from your army.`,
        style: 'warning',
        soundEffect: 'shadow_dismiss.mp3'
      }));
      
      // Close modal and update shadow data
      onHide();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error dismissing shadow:', error);
      setError(error.response?.data?.message || 'Failed to dismiss shadow');
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Dismiss Failed',
        message: error.response?.data?.message || 'Failed to dismiss shadow',
        style: 'danger'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  if (!shadow) return null;
  
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      className="shadow-details-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="shadow-modal-title">
          <span className="shadow-name">{shadow.name}</span>
          <Badge 
            bg="dark" 
            className="shadow-rank-badge"
            style={{ color: getRankColor(shadow.rank) }}
          >
            {shadow.rank}-Rank
          </Badge>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="shadow-details-container">
          <div className="shadow-image-section">
            <div className="shadow-image-wrapper">
              <img 
                src={shadow.image || '/images/shadows/default-shadow.png'} 
                alt={shadow.name} 
                className="shadow-detail-image"
              />
              <div className="shadow-type-badge">
                {shadow.type}
              </div>
            </div>
            
            <div className="shadow-level-info">
              <div className="level-display">
                Level {shadow.level}
              </div>
              
              <div className="xp-bar-container">
                <ProgressBar 
                  now={xpPercentage} 
                  variant="success" 
                  className="xp-progress-detail"
                />
                <div className="xp-text">
                  {shadow.experience}/{shadow.experienceToNextLevel} XP
                </div>
              </div>
              
              <Button 
                variant="primary" 
                className="level-up-btn"
                onClick={handleLevelUp}
                disabled={loading || shadow.experience < shadow.experienceToNextLevel}
              >
                <FontAwesomeIcon icon={faArrowUp} className="me-2" />
                Level Up
              </Button>
            </div>
            
            <div className="shadow-status-bars">
              <div className="status-bar hp-bar">
                <div className="status-label">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  HP
                </div>
                <div className="status-progress">
                  <ProgressBar 
                    now={hpPercentage} 
                    variant="danger" 
                    className="hp-progress-detail"
                  />
                  <div className="status-value">
                    {shadow.hp.current}/{shadow.hp.max}
                  </div>
                </div>
              </div>
              
              <div className="status-bar mp-bar">
                <div className="status-label">
                  <FontAwesomeIcon icon={faBolt} className="me-2" />
                  MP
                </div>
                <div className="status-progress">
                  <ProgressBar 
                    now={mpPercentage} 
                    variant="info" 
                    className="mp-progress-detail"
                  />
                  <div className="status-value">
                    {shadow.mp.current}/{shadow.mp.max}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="shadow-actions">
              {shadow.isDeployed ? (
                <Button 
                  variant="warning" 
                  className="recall-btn"
                  onClick={handleRecall}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faChevronDown} className="me-2" />
                  Recall Shadow
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  className="deploy-btn"
                  onClick={handleDeploy}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faChevronUp} className="me-2" />
                  Deploy Shadow
                </Button>
              )}
              
              <Button 
                variant="danger" 
                className="dismiss-btn"
                onClick={handleDismiss}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Dismiss
              </Button>
            </div>
          </div>
          
          <div className="shadow-details-tabs">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="shadow-tabs"
            >
              <Tab eventKey="stats" title="Stats">
                <div className="shadow-stats-container">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faFistRaised} className="strength-icon" />
                      </div>
                      <div className="stat-info">
                        <div className="stat-name">Strength</div>
                        <div className="stat-value">{shadow.stats.strength}</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faRunning} className="agility-icon" />
                      </div>
                      <div className="stat-info">
                        <div className="stat-name">Agility</div>
                        <div className="stat-value">{shadow.stats.agility}</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faBrain} className="intelligence-icon" />
                      </div>
                      <div className="stat-info">
                        <div className="stat-name">Intelligence</div>
                        <div className="stat-value">{shadow.stats.intelligence}</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faHeart} className="vitality-icon" />
                      </div>
                      <div className="stat-info">
                        <div className="stat-name">Vitality</div>
                        <div className="stat-value">{shadow.stats.vitality}</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faShieldAlt} className="endurance-icon" />
                      </div>
                      <div className="stat-info">
                        <div className="stat-name">Endurance</div>
                        <div className="stat-value">{shadow.stats.endurance}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="power-level">
                    <div className="power-label">Power Level</div>
                    <div className="power-value">
                      {shadow.calculatePower ? shadow.calculatePower() : 
                        Math.floor(Object.values(shadow.stats).reduce((sum, stat) => sum + stat, 0) * 
                        (shadow.rank === 'S' ? 10 : 
                         shadow.rank === 'A' ? 5 : 
                         shadow.rank === 'B' ? 3 : 
                         shadow.rank === 'C' ? 2 : 
                         shadow.rank === 'D' ? 1.5 : 1))}
                    </div>
                  </div>
                </div>
              </Tab>
              
              <Tab eventKey="abilities" title="Abilities">
                <div className="shadow-abilities-container">
                  {shadow.abilities && shadow.abilities.length > 0 ? (
                    shadow.abilities.map((ability, index) => (
                      <div key={index} className="ability-item">
                        <div className="ability-header">
                          <div className="ability-name">{ability.name}</div>
                          {ability.unlockLevel > shadow.level && (
                            <div className="ability-locked">
                              Unlocks at Level {ability.unlockLevel}
                            </div>
                          )}
                        </div>
                        
                        <div className="ability-description">
                          {ability.description}
                        </div>
                        
                        <div className="ability-stats">
                          {ability.damage > 0 && (
                            <div className="ability-stat">
                              <FontAwesomeIcon icon={faDumbbell} className="me-2" />
                              Damage: {ability.damage}
                            </div>
                          )}
                          
                          {ability.mpCost > 0 && (
                            <div className="ability-stat">
                              <FontAwesomeIcon icon={faBolt} className="me-2" />
                              MP Cost: {ability.mpCost}
                            </div>
                          )}
                          
                          {ability.cooldown > 0 && (
                            <div className="ability-stat">
                              <FontAwesomeIcon icon={faMagic} className="me-2" />
                              Cooldown: {ability.cooldown}s
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-abilities">
                      <p>This shadow has no abilities yet.</p>
                      <p>Level up to unlock abilities!</p>
                    </div>
                  )}
                </div>
              </Tab>
              
              <Tab eventKey="equipment" title="Equipment">
                <div className="shadow-equipment-container">
                  <div className="equipment-slots">
                    <div className="equipment-slot weapon-slot">
                      <div className="slot-label">Weapon</div>
                      <div className="slot-content">
                        {shadow.equipment && shadow.equipment.weapon ? (
                          <div className="equipped-item">
                            <img 
                              src={shadow.equipment.weapon.image || '/images/items/default-item.png'} 
                              alt={shadow.equipment.weapon.name} 
                              className="item-image"
                            />
                            <div className="item-name">{shadow.equipment.weapon.name}</div>
                          </div>
                        ) : (
                          <div className="empty-slot">No weapon equipped</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="equipment-slot armor-slot">
                      <div className="slot-label">Armor</div>
                      <div className="slot-content">
                        {shadow.equipment && shadow.equipment.armor ? (
                          <div className="equipped-item">
                            <img 
                              src={shadow.equipment.armor.image || '/images/items/default-item.png'} 
                              alt={shadow.equipment.armor.name} 
                              className="item-image"
                            />
                            <div className="item-name">{shadow.equipment.armor.name}</div>
                          </div>
                        ) : (
                          <div className="empty-slot">No armor equipped</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="equipment-slot accessory-slot">
                      <div className="slot-label">Accessory</div>
                      <div className="slot-content">
                        {shadow.equipment && shadow.equipment.accessory ? (
                          <div className="equipped-item">
                            <img 
                              src={shadow.equipment.accessory.image || '/images/items/default-item.png'} 
                              alt={shadow.equipment.accessory.name} 
                              className="item-image"
                            />
                            <div className="item-name">{shadow.equipment.accessory.name}</div>
                          </div>
                        ) : (
                          <div className="empty-slot">No accessory equipped</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="equipment-note">
                    <p>Visit your inventory to equip items to your shadow.</p>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShadowDetailsModal;
