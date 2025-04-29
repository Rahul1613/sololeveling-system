import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faUserPlus, faExclamationTriangle, 
  faChevronUp, faChevronDown, faSortAmountUp, faSortAmountDown,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import StatusWindow from '../components/ui/StatusWindow';
import ShadowCard from '../components/shadows/ShadowCard';
import ShadowDetailsModal from '../components/shadows/ShadowDetailsModal';
import ShadowSummoning from '../components/shadows/ShadowSummoning';
import ShadowExtraction from '../components/shadows/ShadowExtraction';
import './ShadowArmyPage.css';

const ShadowArmyPage = () => {
  const { token } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.user);
  
  // State for shadows and filtering
  const [shadows, setShadows] = useState([]);
  const [filteredShadows, setFilteredShadows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [sortBy, setSortBy] = useState('level-desc');
  const [showDeployed, setShowDeployed] = useState(true);
  
  // State for selected shadow and modal
  const [selectedShadow, setSelectedShadow] = useState(null);
  const [showShadowModal, setShowShadowModal] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('army');
  const [previousTab, setPreviousTab] = useState('army');
  
  // Fetch shadows from the server
  const fetchShadows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/shadows', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setShadows(response.data);
      setFilteredShadows(response.data);
    } catch (error) {
      console.error('Error fetching shadows:', error);
      setError('Failed to load shadow army. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch shadows on component mount
  useEffect(() => {
    if (token) {
      fetchShadows();
    }
  }, [token]);
  
  // Apply filters when any filter changes
  useEffect(() => {
    if (!shadows.length) return;
    
    let result = [...shadows];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(shadow => 
        shadow.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(shadow => shadow.type === selectedType);
    }
    
    // Apply rank filter
    if (selectedRank !== 'all') {
      result = result.filter(shadow => shadow.rank === selectedRank);
    }
    
    // Apply deployed filter
    if (!showDeployed) {
      result = result.filter(shadow => !shadow.isDeployed);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'level-asc':
        result.sort((a, b) => a.level - b.level);
        break;
      case 'level-desc':
        result.sort((a, b) => b.level - a.level);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rank-asc':
        result.sort((a, b) => {
          const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];
          return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
        });
        break;
      case 'rank-desc':
        result.sort((a, b) => {
          const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];
          return ranks.indexOf(b.rank) - ranks.indexOf(a.rank);
        });
        break;
      default:
        break;
    }
    
    setFilteredShadows(result);
  }, [shadows, searchTerm, selectedType, selectedRank, sortBy, showDeployed]);
  
  // Handle shadow card click
  const handleShadowClick = (shadow) => {
    setSelectedShadow(shadow);
    setShowShadowModal(true);
  };
  
  // Handle summon complete
  const handleSummonComplete = (newShadow) => {
    // Refresh shadows
    fetchShadows();
    
    // Switch to army tab
    setActiveTab('army');
    
    // Select the new shadow
    setSelectedShadow(newShadow);
    setShowShadowModal(true);
  };
  
  // Render loading state
  if (loading && shadows.length === 0) {
    return (
      <Container className="shadow-army-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="solo-spinner" />
          <p className="mt-3">Loading shadow army...</p>
        </div>
      </Container>
    );
  }
  
  // Render error state
  if (error && shadows.length === 0) {
    return (
      <Container className="shadow-army-page">
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon mb-3" />
          <h4>Error Loading Shadow Army</h4>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="solo-btn mt-3" 
            onClick={fetchShadows}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container fluid className="shadow-army-page">
      <Row>
        <Col lg={9} className="shadow-army-main">
          {/* Page Header */}
          <div className="page-header">
            <h2 className="page-title">Shadow Army</h2>
            <div className="page-actions">
              <Button 
                variant={activeTab === 'army' ? 'primary' : 'outline-primary'} 
                className="tab-btn"
                onClick={() => setActiveTab('army')}
              >
                My Army
              </Button>
              <Button 
                variant={activeTab === 'extract' ? 'primary' : 'outline-primary'} 
                className="tab-btn"
                onClick={() => setActiveTab('extract')}
              >
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                Extract
              </Button>
              <Button 
                variant={activeTab === 'summon' ? 'primary' : 'outline-primary'} 
                className="tab-btn"
                onClick={() => setActiveTab('summon')}
              >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Summon
              </Button>
            </div>
          </div>
          
          {/* Tabs Content */}
          <div className="tabs-content">
            {activeTab === 'army' ? (
              <>
                {/* Filters Section */}
                <Card className="filter-card mb-4">
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Search shadows..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      
                      <Col md={8}>
                        <Row>
                          <Col sm={4}>
                            <Form.Group className="mb-3">
                              <Form.Select 
                                value={selectedType} 
                                onChange={(e) => setSelectedType(e.target.value)}
                              >
                                <option value="all">All Types</option>
                                <option value="soldier">Soldiers</option>
                                <option value="knight">Knights</option>
                                <option value="mage">Mages</option>
                                <option value="archer">Archers</option>
                                <option value="assassin">Assassins</option>
                                <option value="tank">Tanks</option>
                                <option value="healer">Healers</option>
                                <option value="boss">Bosses</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          
                          <Col sm={4}>
                            <Form.Group className="mb-3">
                              <Form.Select 
                                value={selectedRank} 
                                onChange={(e) => setSelectedRank(e.target.value)}
                              >
                                <option value="all">All Ranks</option>
                                <option value="S">S Rank</option>
                                <option value="A">A Rank</option>
                                <option value="B">B Rank</option>
                                <option value="C">C Rank</option>
                                <option value="D">D Rank</option>
                                <option value="E">E Rank</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          
                          <Col sm={4}>
                            <Form.Group className="mb-3">
                              <Form.Select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                              >
                                <option value="level-desc">Level: High to Low</option>
                                <option value="level-asc">Level: Low to High</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                                <option value="rank-desc">Rank: High to Low</option>
                                <option value="rank-asc">Rank: Low to High</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Check 
                          type="switch"
                          id="deployed-switch"
                          label="Show deployed shadows"
                          checked={showDeployed}
                          onChange={(e) => setShowDeployed(e.target.checked)}
                          className="deployed-switch"
                        />
                      </Col>
                      
                      <Col md={6} className="text-end">
                        <Button 
                          variant="outline-secondary" 
                          className="reset-filters-btn"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedType('all');
                            setSelectedRank('all');
                            setSortBy('level-desc');
                            setShowDeployed(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faFilter} className="me-2" />
                          Reset Filters
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                
                {/* Shadows Grid */}
                <div className="shadows-container">
                  {filteredShadows.length === 0 ? (
                    <div className="no-shadows-message">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mb-3" />
                      <h4>No shadows found</h4>
                      {shadows.length === 0 ? (
                        <>
                          <p>You don't have any shadows in your army yet.</p>
                          <Button 
                            variant="primary" 
                            className="solo-btn mt-3" 
                            onClick={() => setActiveTab('summon')}
                          >
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            Summon Your First Shadow
                          </Button>
                        </>
                      ) : (
                        <p>Try adjusting your filters to see more shadows.</p>
                      )}
                    </div>
                  ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                      {filteredShadows.map(shadow => (
                        <Col key={shadow._id}>
                          <ShadowCard 
                            shadow={shadow} 
                            onClick={() => handleShadowClick(shadow)}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </>
            ) : activeTab === 'extract' ? (
              <ShadowExtraction />
            ) : (
              <ShadowSummoning onSummonComplete={handleSummonComplete} />
            )}
          </div>
        </Col>
        
        <Col lg={3} className="shadow-army-sidebar">
          {/* User Status */}
          <StatusWindow user={user} />
          
          {/* Army Stats */}
          <Card className="army-stats-card mt-4">
            <Card.Header>
              <h5>Army Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="stat-item">
                <div className="stat-label">Total Shadows</div>
                <div className="stat-value">{shadows.length}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Deployed</div>
                <div className="stat-value">{shadows.filter(s => s.isDeployed).length}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Highest Level</div>
                <div className="stat-value">
                  {shadows.length > 0 ? Math.max(...shadows.map(s => s.level)) : 0}
                </div>
              </div>
              
              <div className="rank-distribution">
                <h6>Rank Distribution</h6>
                <div className="rank-bars">
                  {['S', 'A', 'B', 'C', 'D', 'E'].map(rank => {
                    const count = shadows.filter(s => s.rank === rank).length;
                    const percentage = shadows.length > 0 ? (count / shadows.length) * 100 : 0;
                    
                    return (
                      <div key={rank} className="rank-bar">
                        <div className="rank-label">{rank}</div>
                        <div className="rank-progress">
                          <div 
                            className="rank-progress-fill" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getRankColor(rank)
                            }}
                          ></div>
                        </div>
                        <div className="rank-count">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="type-distribution">
                <h6>Type Distribution</h6>
                <div className="type-chart">
                  {['soldier', 'knight', 'mage', 'archer', 'assassin', 'tank', 'healer', 'boss'].map(type => {
                    const count = shadows.filter(s => s.type === type).length;
                    if (count === 0) return null;
                    
                    return (
                      <div key={type} className="type-item">
                        <div className="type-name">{type}</div>
                        <div className="type-count">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Army Power */}
          <Card className="army-power-card mt-4">
            <Card.Header>
              <h5>Army Power</h5>
            </Card.Header>
            <Card.Body>
              <div className="power-level">
                <div className="power-value">
                  {calculateArmyPower(shadows)}
                </div>
                <div className="power-label">Total Power</div>
              </div>
              
              <div className="power-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-label">Deployed Power</div>
                  <div className="breakdown-value">
                    {calculateArmyPower(shadows.filter(s => s.isDeployed))}
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <div className="breakdown-label">Reserve Power</div>
                  <div className="breakdown-value">
                    {calculateArmyPower(shadows.filter(s => !s.isDeployed))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Shadow Details Modal */}
      <ShadowDetailsModal 
        shadow={selectedShadow}
        show={showShadowModal}
        onHide={() => setShowShadowModal(false)}
        onUpdate={fetchShadows}
      />
    </Container>
  );
};

// Helper function to get rank color
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

// Helper function to calculate army power
const calculateArmyPower = (shadows) => {
  if (!shadows || shadows.length === 0) return 0;
  
  return shadows.reduce((total, shadow) => {
    // Calculate power based on stats and rank
    const statsPower = Object.values(shadow.stats || {}).reduce((sum, stat) => sum + stat, 0);
    const rankMultiplier = 
      shadow.rank === 'S' ? 10 : 
      shadow.rank === 'A' ? 5 : 
      shadow.rank === 'B' ? 3 : 
      shadow.rank === 'C' ? 2 : 
      shadow.rank === 'D' ? 1.5 : 1;
    
    return total + Math.floor(statsPower * rankMultiplier);
  }, 0);
};

export default ShadowArmyPage;
