import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  Tabs, 
  Tab, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Slider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Chip,
  Avatar,
  useMediaQuery
} from '@mui/material';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import { HolographicCard } from '../components/HolographicUI';
import FeaturedCarousel from '../components/marketplace/FeaturedCarousel';
import RecommendedItems from '../components/marketplace/RecommendedItems';
import MarketplaceItemCard from '../components/marketplace/MarketplaceItemCard';
import { 
  getMarketplaceItems, 
  getFeaturedItems, 
  getRecommendedItems, 
  buyItem, 
  sellItem, 
  reset 
} from '../redux/slices/marketplaceSlice';

const Marketplace = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    items, 
    featuredItems, 
    recommendedItems, 
    isLoading, 
    isSuccess, 
    isError, 
    message 
  } = useSelector((state) => state.marketplace);
  const { items: inventoryItems } = useSelector((state) => state.inventory);

  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');

  // State for tabs and filters
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    rarity: '',
    minLevel: 1,
    maxLevel: 100,
    minPrice: 0,
    maxPrice: 10000
  });

  // State for cart and item details
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState('buy'); // 'buy' or 'sell'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Update type filter based on tab
    const types = ['weapon', 'armor', 'potion', 'consumable', 'material', 'key'];
    if (newValue > 0 && newValue <= types.length) {
      setFilters({...filters, type: types[newValue - 1]});
    } else {
      setFilters({...filters, type: ''});
    }
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({...filters, [name]: value});
  };

  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    });
  };

  // Handle level range change
  const handleLevelRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      minLevel: newValue[0],
      maxLevel: newValue[1]
    });
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(getMarketplaceItems(filters));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: tabValue > 0 ? filters.type : '',
      rarity: '',
      minLevel: 1,
      maxLevel: 100,
      minPrice: 0,
      maxPrice: 10000
    });
    dispatch(getMarketplaceItems({ type: tabValue > 0 ? filters.type : '' }));
  };

  // Add item to cart
  const handleAddToCart = (item) => {
    const existingItem = cart.find(i => i._id === item._id);
    if (existingItem) {
      setCart(cart.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
    
    setNotification({
      show: true,
      message: `${item.name} added to cart`,
      type: 'success'
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Remove item from cart
  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  // View item details
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  // Close item details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Buy item now
  const handleBuyNow = (item) => {
    setSelectedItem(item);
    setPurchaseQuantity(1);
    setPurchaseType('buy');
    setPurchaseDialogOpen(true);
  };

  // Sell item
  const handleSellItem = (item) => {
    setSelectedItem(item);
    setPurchaseQuantity(1);
    setPurchaseType('sell');
    setPurchaseDialogOpen(true);
  };

  // Confirm purchase
  const handleConfirmPurchase = () => {
    if (purchaseType === 'buy') {
      dispatch(buyItem({ itemId: selectedItem._id, quantity: purchaseQuantity }));
    } else {
      dispatch(sellItem({ itemId: selectedItem._id, quantity: purchaseQuantity }));
    }
    setPurchaseDialogOpen(false);
  };

  // Check if user owns an item
  const isItemOwned = (itemId) => {
    return inventoryItems.some(item => item.item._id === itemId);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
      mythic: '#f44336'
    };
    return colors[rarity] || '#9e9e9e';
  };

  // Load marketplace data when component mounts
  useEffect(() => {
    dispatch(getMarketplaceItems({}));
    dispatch(getFeaturedItems());
    dispatch(getRecommendedItems());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Reset notification when success/error state changes
  useEffect(() => {
    if (isSuccess) {
      setNotification({
        show: true,
        message: 'Transaction completed successfully!',
        type: 'success'
      });
      
      // Reset cart if purchase was successful
      if (purchaseType === 'buy') {
        setCart([]);
      }
      
      dispatch(reset());
    }
    
    if (isError) {
      setNotification({
        show: true,
        message: message || 'Transaction failed',
        type: 'error'
      });
      dispatch(reset());
    }
    
    if (notification.show) {
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' });
      }, 3000);
    }
  }, [isSuccess, isError, message, dispatch, purchaseType]);

  return (
    <Container maxWidth="lg" sx={{ mt: isDesktop ? 4 : 2, mb: isDesktop ? 4 : 2 }}>
      {/* Header */}
      <SystemPanel sx={{ mb: isDesktop ? 4 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 26 : 22, mb: 2, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
          MARKETPLACE
        </Typography>
        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
          Your Currency: {formatCurrency(user?.currency || 0)}
        </Typography>
      </SystemPanel>
      
      {/* Notification */}
      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: isDesktop ? 2 : 1, borderRadius: 2, boxShadow: 3 }}
          onClose={() => setNotification({ show: false, message: '', type: 'info' })}
        >
          {notification.message}
        </Alert>
      )}
      
      {/* Featured Items */}
      <SystemPanel sx={{ mb: isDesktop ? 4 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        {isLoading && featuredItems.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: isDesktop ? 4 : 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FeaturedCarousel 
            items={featuredItems} 
            onAddToCart={handleAddToCart} 
            onBuyNow={handleBuyNow} 
            onViewDetails={handleViewDetails}
            cart={cart}
            user={{ inventory: inventoryItems }}
          />
        )}
      </SystemPanel>
      
      {/* Tabs and Filters */}
      <SystemPanel sx={{ mb: isDesktop ? 3 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Items" />
          <Tab label="Weapons" />
          <Tab label="Armor" />
          <Tab label="Potions" />
          <Tab label="Consumables" />
          <Tab label="Materials" />
          <Tab label="Keys" />
        </Tabs>
        <Grid container spacing={isDesktop ? 3 : 2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Rarity</InputLabel>
              <Select
                name="rarity"
                value={filters.rarity}
                label="Rarity"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="common">Common</MenuItem>
                <MenuItem value="uncommon">Uncommon</MenuItem>
                <MenuItem value="rare">Rare</MenuItem>
                <MenuItem value="epic">Epic</MenuItem>
                <MenuItem value="legendary">Legendary</MenuItem>
                <MenuItem value="mythic">Mythic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography gutterBottom>Level Range</Typography>
            <Slider
              value={[filters.minLevel, filters.maxLevel]}
              onChange={handleLevelRangeChange}
              valueLabelDisplay="auto"
              min={1}
              max={100}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <SystemButton variant="contained" onClick={applyFilters} sx={{ mr: isDesktop ? 1 : 0 }}>
              Apply
            </SystemButton>
            <SystemButton variant="outlined" onClick={resetFilters}>
              Reset
            </SystemButton>
          </Grid>
        </Grid>
      </SystemPanel>
      
      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <SystemPanel sx={{ mb: isDesktop ? 4 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
          <RecommendedItems 
            items={recommendedItems} 
            onAddToCart={handleAddToCart} 
            onBuyNow={handleBuyNow} 
            onViewDetails={handleViewDetails}
            cart={cart}
            user={{ inventory: inventoryItems }}
          />
        </SystemPanel>
      )}
      
      {/* Marketplace Items */}
      <SystemPanel sx={{ mb: isDesktop ? 4 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: isDesktop ? 4 : 2 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: isDesktop ? 4 : 2, textAlign: 'center' }}>
            <Typography variant="body1">
              No items found matching your filters.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={isDesktop ? 3 : 2} sx={{ p: isDesktop ? 2 : 1 }}>
            {items.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <MarketplaceItemCard
                  item={item}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={handleViewDetails}
                  isInCart={cart.some(c => c._id === item._id)}
                  isOwned={isItemOwned(item._id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </SystemPanel>
      
      {/* Shopping Cart */}
      {cart.length > 0 && (
        <SystemPanel sx={{ mt: isDesktop ? 4 : 2, maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
          <Box sx={{ p: isDesktop ? 2 : 1 }}>
            {cart.map(item => (
              <Box key={item._id} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: isDesktop ? 2 : 1,
                p: isDesktop ? 2 : 1,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={item.image || '/images/items/default-item.png'} 
                    alt={item.name} 
                    sx={{ width: isDesktop ? 50 : 40, height: isDesktop ? 50 : 40, marginRight: isDesktop ? 16 : 8, borderRadius: 8, boxShadow: '0 0 8px #00eaff99' }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#eaf6ff' }}>
                      {item.name}
                    </Typography>
                    <Chip 
                      label={item.rarity} 
                      size="small" 
                      sx={{ 
                        bgcolor: getRarityColor(item.rarity), 
                        color: 'white',
                        mr: isDesktop ? 1 : 0
                      }} 
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Quantity: {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
                    </Typography>
                  </Box>
                </Box>
                <SystemButton 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => handleRemoveFromCart(item._id)}
                >
                  Remove
                </SystemButton>
              </Box>
            ))}
            <Divider sx={{ my: isDesktop ? 2 : 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#eaf6ff' }}>
                Total: {formatCurrency(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </Typography>
              <SystemButton 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => {
                  if (cart.length === 1) {
                    handleBuyNow(cart[0]);
                  } else {
                    // Handle multiple items checkout
                    setNotification({
                      show: true,
                      message: 'Multi-item checkout coming soon!',
                      type: 'info'
                    });
                  }
                }}
              >
                Checkout
              </SystemButton>
            </Box>
          </Box>
        </SystemPanel>
      )}
      
      {/* Item Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'background.paper', 
              borderBottom: 1, 
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h5" sx={{ color: '#eaf6ff' }}>{selectedItem.name}</Typography>
              <Chip 
                label={selectedItem.rarity} 
                sx={{ 
                  bgcolor: getRarityColor(selectedItem.rarity), 
                  color: 'white' 
                }} 
              />
            </DialogTitle>
            <DialogContent sx={{ p: isDesktop ? 3 : 2 }}>
              <Grid container spacing={isDesktop ? 3 : 2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%'
                  }}>
                    <Avatar 
                      src={selectedItem.image || '/images/items/default-item.png'} 
                      alt={selectedItem.name} 
                      sx={{ 
                        maxWidth: '100%', 
                        maxHeight: isDesktop ? 300 : 200, 
                        borderRadius: 8,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" sx={{ mb: isDesktop ? 2 : 1, color: '#eaf6ff' }}>
                    {selectedItem.description}
                  </Typography>
                  
                  <Grid container spacing={isDesktop ? 2 : 1} sx={{ mb: isDesktop ? 2 : 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Type</Typography>
                      <Typography variant="body1">{selectedItem.type}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Level</Typography>
                      <Typography variant="body1">{selectedItem.level}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Price</Typography>
                      <Typography variant="body1">{formatCurrency(selectedItem.price)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Sell Value</Typography>
                      <Typography variant="body1">{formatCurrency(selectedItem.price * 0.7)}</Typography>
                    </Grid>
                  </Grid>
                  
                  {selectedItem.effects && selectedItem.effects.length > 0 && (
                    <Box sx={{ mb: isDesktop ? 2 : 1 }}>
                      <Typography variant="h6" sx={{ mb: isDesktop ? 1 : 0.5, color: '#eaf6ff' }}>Effects</Typography>
                      <Grid container spacing={isDesktop ? 1 : 0.5}>
                        {selectedItem.effects.map((effect, index) => (
                          <Grid item xs={6} key={index}>
                            <Chip 
                              label={`${effect.stat} ${effect.value > 0 ? '+' : ''}${effect.value}${effect.isPercentage ? '%' : ''}`} 
                              sx={{ mb: isDesktop ? 1 : 0.5 }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {selectedItem.requirements && (
                    <Box sx={{ mb: isDesktop ? 2 : 1 }}>
                      <Typography variant="h6" sx={{ mb: isDesktop ? 1 : 0.5, color: '#eaf6ff' }}>Requirements</Typography>
                      <Grid container spacing={isDesktop ? 1 : 0.5}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Level: {selectedItem.requirements.level || 1}
                          </Typography>
                        </Grid>
                        {selectedItem.requirements.stats && Object.entries(selectedItem.requirements.stats)
                          .filter(([_, value]) => value > 0)
                          .map(([stat, value]) => (
                            <Grid item xs={6} key={stat}>
                              <Typography variant="body2">
                                {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
                              </Typography>
                            </Grid>
                          ))
                        }
                      </Grid>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: isDesktop ? 2 : 1 }}>
                    {isItemOwned(selectedItem._id) ? (
                      <SystemButton 
                        variant="outlined" 
                        color="secondary" 
                        onClick={() => {
                          handleCloseDetails();
                          handleSellItem(selectedItem);
                        }}
                      >
                        Sell Item
                      </SystemButton>
                    ) : (
                      <>
                        <SystemButton 
                          variant="outlined" 
                          onClick={() => {
                            handleAddToCart(selectedItem);
                            handleCloseDetails();
                          }}
                          sx={{ mr: isDesktop ? 1 : 0 }}
                        >
                          Add to Cart
                        </SystemButton>
                        <SystemButton 
                          variant="contained" 
                          onClick={() => {
                            handleCloseDetails();
                            handleBuyNow(selectedItem);
                          }}
                        >
                          Buy Now
                        </SystemButton>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: isDesktop ? 2 : 1, borderTop: 1, borderColor: 'divider' }}>
              <SystemButton onClick={handleCloseDetails}>Close</SystemButton>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Purchase Dialog */}
      <Dialog 
        open={purchaseDialogOpen} 
        onClose={() => setPurchaseDialogOpen(false)}
      >
        {selectedItem && (
          <>
            <DialogTitle>
              {purchaseType === 'buy' ? 'Buy Item' : 'Sell Item'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: isDesktop ? 2 : 1 }}>
                <Avatar 
                  src={selectedItem.image || '/images/items/default-item.png'} 
                  alt={selectedItem.name} 
                  sx={{ width: isDesktop ? 50 : 40, height: isDesktop ? 50 : 40, marginRight: isDesktop ? 16 : 8, borderRadius: 8, boxShadow: '0 0 8px #00eaff99' }}
                />
                <Typography variant="h6" sx={{ color: '#eaf6ff' }}>{selectedItem.name}</Typography>
              </Box>
              
              <TextField
                label="Quantity"
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <Typography variant="body1" sx={{ mt: isDesktop ? 2 : 1, color: '#eaf6ff' }}>
                {purchaseType === 'buy' ? 'Total Cost' : 'Total Value'}: {formatCurrency(purchaseQuantity * (
                  purchaseType === 'buy' 
                    ? selectedItem.price 
                    : selectedItem.price * 0.7
                ))}
              </Typography>
              
              {purchaseType === 'buy' && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: isDesktop ? 1 : 0.5 }}>
                  Your Currency: {formatCurrency(user?.currency || 0)}
                </Typography>
              )}
              
              {purchaseType === 'buy' && user?.currency < (purchaseQuantity * selectedItem.price) && (
                <Alert severity="error" sx={{ mt: isDesktop ? 2 : 1 }}>
                  You don't have enough currency to make this purchase.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <SystemButton onClick={() => setPurchaseDialogOpen(false)}>Cancel</SystemButton>
              <SystemButton 
                onClick={handleConfirmPurchase} 
                variant="contained"
                disabled={purchaseType === 'buy' && user?.currency < (purchaseQuantity * selectedItem.price)}
              >
                Confirm
              </SystemButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Marketplace;
