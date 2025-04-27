import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import FitnessVerification from '../components/quests/FitnessVerification';
import StatusWindow from '../components/ui/StatusWindow';
import './FitnessVerificationPage.css';

const FitnessVerificationPage = () => {
  const { questId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.user);
  
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  // Fetch quest details
  useEffect(() => {
    const fetchQuest = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/quests/${questId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setQuest(response.data);
      } catch (error) {
        console.error('Error fetching quest:', error);
        setError('Failed to load quest details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (questId && token) {
      fetchQuest();
    }
  }, [questId, token]);
  
  // Handle verification submission
  const handleVerificationSubmitted = (newSubmissionId) => {
    setSubmissionId(newSubmissionId);
    setVerificationStatus('pending');
    
    // Start polling for status updates if AI verification is enabled
    if (quest.verificationMethod === 'ai') {
      pollVerificationStatus(newSubmissionId);
    }
  };
  
  // Poll for verification status
  const pollVerificationStatus = async (id) => {
    try {
      const checkStatus = async () => {
        const response = await axios.get(`/api/verification/status/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status !== 'pending') {
          setVerificationStatus(response.data.status);
          return true;
        }
        return false;
      };
      
      // Poll every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(async () => {
        attempts++;
        const isDone = await checkStatus();
        
        if (isDone || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);
    } catch (error) {
      console.error('Error polling verification status:', error);
    }
  };
  
  // Go back to quests page
  const handleGoBack = () => {
    navigate('/quests');
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container className="fitness-verification-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="solo-spinner" />
          <p className="mt-3">Loading quest details...</p>
        </div>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container className="fitness-verification-page">
        <Card className="error-card">
          <Card.Body className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon mb-3" />
            <h4>Error Loading Quest</h4>
            <p>{error}</p>
            <Button variant="primary" className="solo-btn mt-3" onClick={handleGoBack}>
              Return to Quests
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Render quest not found
  if (!quest) {
    return (
      <Container className="fitness-verification-page">
        <Card className="error-card">
          <Card.Body className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon mb-3" />
            <h4>Quest Not Found</h4>
            <p>The quest you're looking for doesn't exist or you don't have access to it.</p>
            <Button variant="primary" className="solo-btn mt-3" onClick={handleGoBack}>
              Return to Quests
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="fitness-verification-page">
      <Row className="mb-4">
        <Col>
          <Button 
            variant="outline-light" 
            className="back-button"
            onClick={handleGoBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Quests
          </Button>
          <h2 className="page-title">Fitness Verification</h2>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <FitnessVerification 
            quest={quest} 
            onVerificationSubmitted={handleVerificationSubmitted}
          />
          
          {verificationStatus === 'verified' && (
            <Card className="success-card mt-4">
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faCheck} className="success-icon mb-3" />
                <h4>Verification Successful!</h4>
                <p>Your quest has been completed. Rewards have been added to your account.</p>
                <Button variant="primary" className="solo-btn mt-3" onClick={handleGoBack}>
                  Return to Quests
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col lg={4}>
          <StatusWindow user={user} />
          
          <Card className="quest-rewards-card mt-4">
            <Card.Header>
              <h5>Quest Rewards</h5>
            </Card.Header>
            <Card.Body>
              <div className="reward-item">
                <div className="reward-label">Experience</div>
                <div className="reward-value">+{quest.rewards.experience} XP</div>
              </div>
              
              {quest.rewards.currency > 0 && (
                <div className="reward-item">
                  <div className="reward-label">Currency</div>
                  <div className="reward-value">+{quest.rewards.currency}</div>
                </div>
              )}
              
              {quest.rewards.statPoints > 0 && (
                <div className="reward-item">
                  <div className="reward-label">Stat Points</div>
                  <div className="reward-value">+{quest.rewards.statPoints}</div>
                </div>
              )}
              
              {quest.rewards.items && quest.rewards.items.length > 0 && (
                <div className="reward-section">
                  <h6>Items</h6>
                  {quest.rewards.items.map((itemReward, index) => (
                    <div key={index} className="reward-item">
                      <div className="reward-label">{itemReward.item.name}</div>
                      <div className="reward-value">x{itemReward.quantity}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FitnessVerificationPage;
