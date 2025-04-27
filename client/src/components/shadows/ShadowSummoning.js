import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faCoins, faCheck, faExclamationTriangle, 
  faInfoCircle, faRandom
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

import { addNotification } from '../../redux/slices/notificationSlice';
import './ShadowSummoning.css';

const ShadowSummoning = ({ onSummonComplete }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { user = {} } = useSelector(state => state.user);
  
  const [summonType, setSummonType] = useState('basic');
  const [shadowName, setShadowName] = useState('');
  const [shadowType, setShadowType] = useState('soldier');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newShadow, setNewShadow] = useState(null);
  
  // Generate random shadow name
  const generateRandomName = () => {
    const prefixes = ['Shadow', 'Dark', 'Night', 'Void', 'Phantom', 'Ghost', 'Specter', 'Wraith', 'Shade', 'Grim'];
    const suffixes = ['Walker', 'Stalker', 'Hunter', 'Slayer', 'Guard', 'Knight', 'Warrior', 'Blade', 'Fang', 'Claw'];
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    setShadowName(`${randomPrefix} ${randomSuffix}`);
  };
  
  // Get summon cost
  const getSummonCost = () => {
    switch (summonType) {
      case 'advanced':
        return 500;
      case 'premium':
        return 1000;
      case 'basic':
      default:
        return 200;
    }
  };
  
  // Get summon description
  const getSummonDescription = () => {
    switch (summonType) {
      case 'advanced':
        return 'Summon a shadow with improved stats and a chance for rare types.';
      case 'premium':
        return 'Summon a powerful shadow with high stats and a chance for elite types.';
      case 'basic':
      default:
        return 'Summon a basic shadow with standard stats.';
    }
  };
  
  // Handle summon
  const handleSummon = async () => {
    if (!shadowName.trim()) {
      setError('Please enter a name for your shadow');
      return;
    }
    
    const cost = getSummonCost();
    
    if ((user?.currency || 0) < cost) {
      setError(`You don't have enough currency. Summoning costs ${cost}.`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/shadows/summon', {
        name: shadowName,
        type: shadowType,
        summonType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update user currency in Redux store

      
      // Set success state
      setSuccess(true);
      setNewShadow(response.data);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Summoned',
        message: `${response.data.name} has joined your shadow army!`,
        style: 'success',
        soundEffect: 'shadow_summon.mp3'
      }));
      
      // Call the onSummonComplete callback
      if (onSummonComplete) {
        onSummonComplete(response.data);
      }
    } catch (error) {
      console.error('Error summoning shadow:', error);
      setError(error.response?.data?.message || 'Failed to summon shadow');
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Summoning Failed',
        message: error.response?.data?.message || 'Failed to summon shadow',
        style: 'danger'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form after successful summon
  const handleReset = () => {
    setShadowName('');
    setShadowType('soldier');
    setSummonType('basic');
    setSuccess(false);
    setNewShadow(null);
  };
  
  return (
    <Card className="shadow-summoning-card">
      <Card.Header>
        <h4>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Shadow Summoning
        </h4>
      </Card.Header>
      
      <Card.Body>
        {success && newShadow ? (
          <div className="summon-success">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            
            <h4>Summoning Successful!</h4>
            
            <div className="new-shadow-info">
              <div className="shadow-image-container">
                <img 
                  src={newShadow.image || '/images/shadows/default-shadow.png'} 
                  alt={newShadow.name} 
                  className="shadow-image"
                />
              </div>
              
              <div className="shadow-details">
                <div className="shadow-name">{newShadow.name}</div>
                <div className="shadow-type">{newShadow.type}</div>
                <div className="shadow-level">Level {newShadow.level}</div>
                <div className="shadow-rank">Rank {newShadow.rank}</div>
              </div>
            </div>
            
            <div className="success-actions">
              <Button 
                variant="primary" 
                className="view-shadow-btn"
                onClick={() => {
                  if (onSummonComplete) {
                    onSummonComplete(newShadow);
                  }
                }}
              >
                View Shadow
              </Button>
              
              <Button 
                variant="outline-secondary" 
                className="summon-again-btn"
                onClick={handleReset}
              >
                Summon Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="summon-info">
              <p>
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Summon a shadow to join your army. Each shadow has unique stats and abilities based on its type.
              </p>
            </div>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Shadow Name</Form.Label>
                <div className="name-input-group">
                  <Form.Control
                    type="text"
                    placeholder="Enter shadow name"
                    value={shadowName}
                    onChange={(e) => setShadowName(e.target.value)}
                    maxLength={30}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={generateRandomName}
                    title="Generate random name"
                  >
                    <FontAwesomeIcon icon={faRandom} />
                  </Button>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Shadow Type</Form.Label>
                <Form.Select 
                  value={shadowType} 
                  onChange={(e) => setShadowType(e.target.value)}
                >
                  <option value="soldier">Soldier</option>
                  <option value="knight">Knight</option>
                  <option value="mage">Mage</option>
                  <option value="archer">Archer</option>
                  <option value="assassin">Assassin</option>
                  <option value="tank">Tank</option>
                  <option value="healer">Healer</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Each type has different base stats and abilities.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Summoning Method</Form.Label>
                <Row className="summon-options">
                  <Col md={4}>
                    <div 
                      className={`summon-option ${summonType === 'basic' ? 'active' : ''}`}
                      onClick={() => setSummonType('basic')}
                    >
                      <div className="option-header">
                        <h5>Basic</h5>
                        <div className="option-cost">
                          <FontAwesomeIcon icon={faCoins} className="me-1" />
                          200
                        </div>
                      </div>
                      <div className="option-description">
                        {getSummonDescription()}
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div 
                      className={`summon-option ${summonType === 'advanced' ? 'active' : ''}`}
                      onClick={() => setSummonType('advanced')}
                    >
                      <div className="option-header">
                        <h5>Advanced</h5>
                        <div className="option-cost">
                          <FontAwesomeIcon icon={faCoins} className="me-1" />
                          500
                        </div>
                      </div>
                      <div className="option-description">
                        {getSummonDescription()}
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div 
                      className={`summon-option ${summonType === 'premium' ? 'active' : ''}`}
                      onClick={() => setSummonType('premium')}
                    >
                      <div className="option-header">
                        <h5>Premium</h5>
                        <div className="option-cost">
                          <FontAwesomeIcon icon={faCoins} className="me-1" />
                          1000
                        </div>
                      </div>
                      <div className="option-description">
                        {getSummonDescription()}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form.Group>
              
              {error && (
                <Alert variant="danger" className="mb-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  {error}
                </Alert>
              )}
              
              <div className="summon-footer">
                <div className="currency-display">
                  <span>Your Currency:</span>
                  <span className="currency-amount">
                    <FontAwesomeIcon icon={faCoins} className="me-1" />
                    {user.currency}
                  </span>
                </div>
                
                <Button 
                  variant="primary" 
                  className="summon-btn"
                  onClick={handleSummon}
                  disabled={loading || !shadowName.trim() || user.currency < getSummonCost()}
                >
                  {loading ? (
                    <>
                      <Spinner 
                        as="span" 
                        animation="border" 
                        size="sm" 
                        role="status" 
                        aria-hidden="true" 
                      />
                      <span className="ms-2">Summoning...</span>
                    </>
                  ) : (
                    <>
                      Summon Shadow
                      <span className="ms-2">
                        (<FontAwesomeIcon icon={faCoins} /> {getSummonCost()})
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ShadowSummoning;
