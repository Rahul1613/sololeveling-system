import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faCoins, faStar, faShoppingCart, 
  faTrash, faCheckCircle, faExclamationTriangle, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getMarketplaceItems, buyItem, sellItem } from '../redux/slices/marketplaceSlice';
import MarketplaceItemCard from '../components/marketplace/MarketplaceItemCard';
import FeaturedCarousel from '../components/marketplace/FeaturedCarousel';
import RecommendedItems from '../components/marketplace/RecommendedItems';
import HoloThreeEffect from '../components/marketplace/HoloThreeEffect';
import IntroAnimation from '../components/IntroAnimation';
import 'react-bootstrap/Carousel';
import '../components/marketplace/FeaturedCarousel.css';
import '../components/marketplace/RecommendedItems.css';
import '../components/IntroAnimation.css';
import { getInventory } from '../redux/slices/inventorySlice';
import StatusWindow from '../components/ui/StatusWindow';
import { updateUserCurrency } from '../redux/slices/userSlice';
import { addNotification } from '../redux/slices/notificationSlice';
import './MarketplacePage.css';

import socketService from '../utils/socketService';

const MarketplacePage = () => {
  // Intro animation state
  const [showIntro, setShowIntro] = React.useState(() => {
    return sessionStorage.getItem('solo_intro_shown') !== 'true';
  });
  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('solo_intro_shown', 'true');
  };

  // Render intro animation overlay if needed
  if (showIntro) {
    return <IntroAnimation onFinish={handleIntroFinish} />;
  }

  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.user);
  
  // Redux marketplace state
  const { items, isLoading: loading, isError, message: error, featuredItems, recommendedItems } = useSelector(state => state.marketplace);
  const [filteredItems, setFilteredItems] = useState([]);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  
  // State for shopping cart
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  
  // State for purchase confirmation
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // Fetch items and featured/recommended items from the server via Redux
  useEffect(() => {
    if (token) {
      dispatch(getMarketplaceItems());
      dispatch(getFeaturedItems());
      dispatch(getRecommendedItems());
    }
  }, [token, dispatch]);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);
  
  // Apply filters when any filter changes
  useEffect(() => {
    if (!items.length) return;
    
    let result = [...items];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }
    
    // Apply rarity filter
    if (selectedRarity !== 'all') {
      result = result.filter(item => item.rarity === selectedRarity);
    }
    
    // Apply price range filter
    if (minPrice !== '') {
      result = result.filter(item => item.price >= parseInt(minPrice));
    }
    
    if (maxPrice !== '') {
      result = result.filter(item => item.price <= parseInt(maxPrice));
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
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
      default:
        break;
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, selectedType, selectedRarity, minPrice, maxPrice, sortBy]);
  
  // Calculate cart total when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item) => {
    // Check if item is already in cart
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      // Update quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    // Show notification
    dispatch(addNotification({
      type: 'info',
      title: 'Item Added',
      message: `${item.name} added to your cart`,
      style: 'success',
      soundEffect: 'item_added.mp3'
    }));
  };
  
  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };
  
  // Update item quantity in cart
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(cart.map(item => 
      item._id === itemId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // TTS helper
  const speakTTS = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle purchase using Redux buyItem thunk
  const handlePurchase = async () => {
    if (cart.length === 0) return;
    if ((user?.currency || 0) < cartTotal) {
      setPurchaseError('You do not have enough currency to complete this purchase.');
      speakTTS('You do not have enough currency to complete this purchase.');
      return;
    }
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      // Buy each item in the cart
      for (const item of cart) {
        await dispatch(buyItem({ itemId: item._id, quantity: item.quantity })).unwrap();
      }
      // Refresh inventory and marketplace
      await dispatch(getInventory());
      await dispatch(getMarketplaceItems());
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Purchase Successful',
        message: 'Items have been added to your inventory',
        style: 'success',
        soundEffect: 'purchase_complete.mp3'
      }));
      speakTTS('Purchase successful. Items have been added to your inventory.');
      setCart([]);
      setPurchaseSuccess(true);
    } catch (error) {
      setPurchaseError(error.message || 'An error occurred during purchase. Please try again.');
      speakTTS(error.message || 'An error occurred during purchase. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Handle sell item (to be called from inventory)
  const handleSell = async (itemId, quantity = 1) => {
    // Optionally add TTS for selling if needed
  };
    try {
      await dispatch(sellItem({ itemId, quantity })).unwrap();
      await dispatch(getInventory());
      await dispatch(getMarketplaceItems());
      dispatch(addNotification({
        type: 'success',
        title: 'Item Sold',
        message: 'Item sold to the marketplace.',
        style: 'success',
        soundEffect: 'item_sold.mp3'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Sell Failed',
        message: error.message || 'Failed to sell item.',
        style: 'error',
        soundEffect: 'error.mp3'
      }));
    }
  };

  
  // Real-time marketplace updates via socket
  useEffect(() => {
    if (!socketService.isConnected) {
      socketService.init(user?._id);
    }
    // Listen for marketplace updates
    socketService.on('marketplace_update', () => {
      dispatch(getMarketplaceItems());
      dispatch(getFeaturedItems());
      dispatch(getRecommendedItems());
      speakTTS('Marketplace updated. New items available.');
    });
    return () => {
      socketService.off('marketplace_update');
    };
  }, [dispatch, user?._id]);

  // Reset purchase modal
  const resetPurchaseModal = () => {
    setShowPurchaseModal(false);
    setPurchaseError(null);
    setPurchaseSuccess(false);
  };
  
  // Get rarity color
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9d9d9d';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'mythic': return '#e6cc80';
      default: return '#ffffff';
    }
  };
  
  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'potion': return '🧪';
      case 'material': return '📦';
      case 'key': return '🔑';
      case 'consumable': return '🍖';
      default: return '📦';
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container className="marketplace-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="solo-spinner" />
          <p className="mt-3">Loading marketplace items...</p>
        </div>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container className="marketplace-page">
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon mb-3" />
          <h4>Error Loading Marketplace</h4>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="solo-btn mt-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <>
      <Container fluid className="marketplace-page">
        <Row>
          <Col lg={9} className="marketplace-main">
            {/* Marketplace Header */}
            <div className="marketplace-header">
              <h2 className="page-title">Marketplace</h2>
              <div className="marketplace-actions">
                <Button 
                  variant="primary" 
                  className="cart-button"
                  onClick={() => setShowCart(true)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Cart ({cart.length})
                </Button>
              </div>
            </div>
            
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
                          placeholder="Search items..."
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
                            <option value="weapon">Weapons</option>
                            <option value="armor">Armor</option>
                            <option value="potion">Potions</option>
                            <option value="material">Materials</option>
                            <option value="key">Keys</option>
                            <option value="consumable">Consumables</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col sm={4}>
                        <Form.Group className="mb-3">
                          <Form.Select 
                            value={selectedRarity} 
                            onChange={(e) => setSelectedRarity(e.target.value)}
                          >
                            <option value="all">All Rarities</option>
                            <option value="common">Common</option>
                            <option value="uncommon">Uncommon</option>
                            <option value="rare">Rare</option>
                            <option value="epic">Epic</option>
                            <option value="legendary">Legendary</option>
                            <option value="mythic">Mythic</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col sm={4}>
                        <Form.Group className="mb-3">
                          <Form.Select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                          >
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="level-asc">Level: Low to High</option>
                            <option value="level-desc">Level: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={8}>
                    <div className="price-filter">
                      <span className="price-label">Price Range:</span>
                      <InputGroup className="price-input">
                        <Form.Control
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          min="0"
                        />
                        <InputGroup.Text>to</InputGroup.Text>
                        <Form.Control
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          min="0"
                        />
                      </InputGroup>
                    </div>
                  </Col>
                  
                  <Col md={4} className="text-end">
                    <Button 
                      variant="outline-secondary" 
                      className="reset-filters-btn"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                        setSelectedRarity('all');
                        setMinPrice('');
                        setMaxPrice('');
                        setSortBy('price-asc');
                      }}
                    >
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      Reset Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Items Grid */}
            <div className="items-container">
              {/* ... (rest of the items grid remains the same) */}
            </div>

            {/* Recommended Items Section */}
            <RecommendedItems
              items={recommendedItems}
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
              onViewDetails={handleViewDetails}
              cart={cart}
              user={user}
            />
          </Col>

          <Col lg={3} className="marketplace-sidebar">
            {/* ... (rest of the sidebar remains the same) */}
          </Col>
        </Row>
        {/* ... (rest of the modals and other components remain the same) */}
      </Container>
      {/* Place all modals and overlays here, after main Container */}
    </>
  );
}

export default MarketplacePage;

            </>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Purchase Confirmation Modal */}
      <Modal 
        show={showPurchaseModal} 
        onHide={resetPurchaseModal} 
        centered
        className="purchase-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {purchaseSuccess ? 'Purchase Complete' : 'Confirm Purchase'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {purchaseLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Processing your purchase...</p>
            </div>
          ) : purchaseSuccess ? (
            <div className="purchase-success">
              <FontAwesomeIcon icon={faCheckCircle} className="success-icon mb-3" />
              <h4>Purchase Successful!</h4>
              <p>Your items have been added to your inventory.</p>
            </div>
          ) : purchaseError ? (
            <div className="purchase-error">
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon mb-3" />
              <h4>Purchase Failed</h4>
              <p>{purchaseError}</p>
            </div>
          ) : (
            <>
              <p>Are you sure you want to purchase these items?</p>
              
              <div className="purchase-summary">
                <div className="summary-item">
                  <span>Items:</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                
                <div className="summary-item">
                  <span>Total Cost:</span>
                  <span>
                    <FontAwesomeIcon icon={faCoins} className="me-1" />
                    {cartTotal}
                  </span>
                </div>
                
                <div className="summary-item">
                  <span>Remaining Currency:</span>
                  <span>
                    <FontAwesomeIcon icon={faCoins} className="me-1" />
                    {user.currency - cartTotal}
                  </span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {purchaseSuccess ? (
            <Button 
              variant="primary" 
              onClick={resetPurchaseModal}
            >
              Continue Shopping
            </Button>
          ) : purchaseError ? (
            <>
              <Button 
                variant="outline-secondary" 
                onClick={resetPurchaseModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setPurchaseError(null);
                  handlePurchase();
                }}
              >
                Try Again
              </Button>
            </>
          ) : !purchaseLoading && (
            <>
              <Button 
                variant="outline-secondary" 
                onClick={resetPurchaseModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePurchase}
              >
                Confirm Purchase
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MarketplacePage;
