import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Snackbar,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import { 
  getMarketplaceItems, 
  getFeaturedItems, 
  getRecommendedItems,
  buyItem
} from '../redux/slices/marketplaceSlice';
import ItemImage from '../components/marketplace/ItemImage';
import MarketplaceSkills from '../components/marketplace/MarketplaceSkills';
import MarketplaceTitles from '../components/marketplace/MarketplaceTitles';

// Styled components
const MarketplaceContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  maxWidth: '100%',
  background: 'linear-gradient(to bottom, rgba(13, 17, 23, 0.9), rgba(13, 17, 23, 0.95))',
  minHeight: '100vh',
}));

const MarketplaceHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  position: 'relative',
  padding: theme.spacing(3, 0),
  borderBottom: '1px solid rgba(95, 209, 249, 0.3)',
  background: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(95, 209, 249, 0.1), rgba(0, 0, 0, 0))',
}));

const MarketplaceTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  marginBottom: theme.spacing(1),
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
  fontFamily: '"Rajdhani", sans-serif',
  fontSize: '2.5rem',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  marginBottom: theme.spacing(3),
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(to right, #5FD1F9, transparent)',
  },
}));

const ItemsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(to right, transparent, rgba(95, 209, 249, 0.5), transparent)',
  },
}));

const ItemCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 10px rgba(95, 209, 249, 0.1)',
  transition: 'all 0.3s ease',
  height: '320px', 
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  margin: theme.spacing(1, 0),
  width: '100%', 
  maxWidth: '280px', 
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(95, 209, 249, 0.2)',
    border: '1px solid rgba(95, 209, 249, 0.5)',
  },
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30px',
    height: '30px',
    background: 'linear-gradient(135deg, transparent 50%, rgba(95, 209, 249, 0.3) 50%)',
    zIndex: 1,
  }
}));

const RarityChip = styled(Chip)(({ rarity, theme }) => ({
  backgroundColor: 
    rarity === 'legendary' ? 'rgba(255, 215, 0, 0.2)' : 
    rarity === 'epic' ? 'rgba(163, 53, 238, 0.2)' : 
    rarity === 'rare' ? 'rgba(0, 112, 221, 0.2)' : 
    rarity === 'uncommon' ? 'rgba(30, 255, 0, 0.2)' : 
    'rgba(190, 190, 190, 0.2)',
  color: 
    rarity === 'legendary' ? '#FFD700' : 
    rarity === 'epic' ? '#A335EE' : 
    rarity === 'rare' ? '#0070DD' : 
    rarity === 'uncommon' ? '#1EFF00' : 
    '#BEBEBE',
  border: `1px solid ${
    rarity === 'legendary' ? 'rgba(255, 215, 0, 0.5)' : 
    rarity === 'epic' ? 'rgba(163, 53, 238, 0.5)' : 
    rarity === 'rare' ? 'rgba(0, 112, 221, 0.5)' : 
    rarity === 'uncommon' ? 'rgba(30, 255, 0, 0.5)' : 
    'rgba(190, 190, 190, 0.5)'
  }`,
  fontWeight: 'bold',
  fontSize: '0.7rem',
  height: '24px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)',
  border: '1px solid rgba(66, 135, 245, 0.5)',
  boxShadow: '0 0 10px rgba(66, 135, 245, 0.5)',
  color: '#ffffff',
  fontWeight: 'bold',
  padding: '6px 16px',
  '&:hover': {
    background: 'rgba(20, 20, 20, 0.9)',
    boxShadow: '0 0 15px rgba(66, 135, 245, 0.8)',
    border: '1px solid rgba(66, 135, 245, 0.8)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const SectionDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  background: 'linear-gradient(to right, transparent, rgba(95, 209, 249, 0.3), transparent)',
  margin: theme.spacing(2, 0, 4),
  width: '100%',
}));

// Simple marketplace component that fixes the refresh issues and properly displays images
const MarketplaceSimple = () => {
  const dispatch = useDispatch();
  const { items, featuredItems, recommendedItems, isLoading, isError, message } = useSelector(state => state.marketplace);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to handle buying an item
  const handleBuyItem = (item) => {
    dispatch(buyItem(item))
      .unwrap()
      .then(() => {
        setSnackbar({
          open: true,
          message: `Successfully purchased ${item.name}!`,
          severity: 'success'
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `Failed to purchase item: ${error.message || 'Unknown error'}`,
          severity: 'error'
        });
      });
  };

  // Function to close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Load data once without continuous refresh
  useEffect(() => {
    if (isDataLoaded) return;
    
    console.log('Current state:', { items, featuredItems, recommendedItems, isLoading, isError, message });
    
    const loadData = async () => {
      try {
        console.log('Loading marketplace items...');
        const marketplaceResult = await dispatch(getMarketplaceItems()).unwrap();
        console.log("Marketplace items loaded:", marketplaceResult);
        
        console.log('Loading featured items...');
        const featuredResult = await dispatch(getFeaturedItems()).unwrap();
        console.log("Featured items loaded:", featuredResult);
        
        console.log('Loading recommended items...');
        const recommendedResult = await dispatch(getRecommendedItems()).unwrap();
        console.log("Recommended items loaded:", recommendedResult);
        
        console.log('All data loaded, setting isDataLoaded to true');
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading marketplace data:", error);
      }
    };

    loadData();
  }, [dispatch, isDataLoaded]);

  // Show loading state when data is being fetched
  if ((isLoading || !isDataLoaded) && (!items || !featuredItems || !recommendedItems)) {
    return (
      <MarketplaceContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#5FD1F9', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
            Loading marketplace data...
          </Typography>
        </Box>
      </MarketplaceContainer>
    );
  }

  if (isError) {
    return (
      <MarketplaceContainer>
        <Alert severity="error" sx={{ mb: 4 }}>
          {message || 'An error occurred while loading marketplace data'}
        </Alert>
      </MarketplaceContainer>
    );
  }

  // Render the marketplace with all sections
  return (
    <MarketplaceContainer>
      {/* Snackbar for purchase feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <MarketplaceHeader>
        <MarketplaceTitle variant="h3">
          MARKETPLACE
        </MarketplaceTitle>
        <Typography variant="subtitle1" sx={{ color: '#eaf6ff', letterSpacing: '1px', fontFamily: '"Rajdhani", sans-serif' }}>
          Buy and sell items to enhance your journey
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box sx={{ width: '50px', height: '3px', background: 'linear-gradient(to right, transparent, #5FD1F9, transparent)' }} />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="marketplace tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#5FD1F9',
                height: 3,
                borderRadius: 3
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                minWidth: 100,
                color: '#eaf6ff',
                '&.Mui-selected': {
                  color: '#5FD1F9'
                }
              }
            }}
          >
            <Tab label="Items" />
            <Tab label="Skills" />
            <Tab label="Titles" />
          </Tabs>
        </Box>
      </MarketplaceHeader>
      
      {/* Featured Items Section */}
      {activeTab === 0 && featuredItems && Array.isArray(featuredItems) && featuredItems.length > 0 && (
        <ItemsContainer>
          <SectionTitle variant="h5">
            Featured Items
            <StarIcon sx={{ ml: 1, verticalAlign: 'middle', fontSize: '1.2rem', color: '#FFD700' }} />
          </SectionTitle>
          
          <Grid container spacing={4} sx={{ mb: 2 }}>
            {featuredItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={item._id || index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ItemCard>
                  <ItemImage 
                    item={item} 
                    height={140} 
                    sx={{ 
                      objectFit: 'contain', 
                      p: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <RarityChip label={item.rarity} rarity={item.rarity} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                      {item.price} G
                    </Typography>
                    <StyledButton size="small" onClick={() => handleBuyItem(item)}>Buy Now</StyledButton>
                  </CardActions>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        </ItemsContainer>
      )}
      
      {/* Recommended Items Section */}
      {activeTab === 0 && recommendedItems && Array.isArray(recommendedItems) && recommendedItems.length > 0 && (
        <ItemsContainer>
          <SectionTitle variant="h5">
            Recommended For You
          </SectionTitle>
          
          <Grid container spacing={4} sx={{ mb: 2 }}>
            {recommendedItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={item._id || index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ItemCard>
                  <ItemImage 
                    item={item} 
                    height={140} 
                    sx={{ 
                      objectFit: 'contain', 
                      p: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <RarityChip label={item.rarity} rarity={item.rarity} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                      {item.price} G
                    </Typography>
                    <StyledButton size="small" onClick={() => handleBuyItem(item)}>Buy Now</StyledButton>
                  </CardActions>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        </ItemsContainer>
      )}
      
      {/* All Items Section */}
      {activeTab === 0 && items && Array.isArray(items) && items.length > 0 && (
        <ItemsContainer>
          <SectionTitle variant="h5">
            All Items
          </SectionTitle>
          
          <Grid container spacing={4} sx={{ mb: 2 }}>
            {items.map((item, index) => (
              <Grid item xs={12} sm={6} key={item._id || index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ItemCard>
                  <ItemImage 
                    item={item} 
                    height={140} 
                    sx={{ 
                      objectFit: 'contain', 
                      p: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <RarityChip label={item.rarity} rarity={item.rarity} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                      {item.price} G
                    </Typography>
                    <StyledButton size="small" onClick={() => handleBuyItem(item)}>Buy Now</StyledButton>
                  </CardActions>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        </ItemsContainer>
      )}
      
      {/* Show loading state if no items are available */}
      {(!items || !Array.isArray(items) || items.length === 0) && (
        <ItemsContainer>
          <Typography variant="h5" sx={{ mb: 3, color: '#5FD1F9', textAlign: 'center' }}>
            Loading Items...
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#5FD1F9' }} />
          </Box>
        </ItemsContainer>
      )}
      
      {activeTab === 1 && (
        <ItemsContainer>
          <MarketplaceSkills />
        </ItemsContainer>
      )}

      {activeTab === 2 && (
        <ItemsContainer>
          <MarketplaceTitles />
        </ItemsContainer>
      )}
      
    </MarketplaceContainer>
  );
};

export default MarketplaceSimple;
