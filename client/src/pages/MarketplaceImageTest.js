import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid, Container, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getMarketplaceItems } from '../redux/slices/marketplaceSlice';
import ItemImage from '../components/marketplace/ItemImage';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Styled components
const MarketplaceContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  maxWidth: '100%',
}));

const ItemsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
  position: 'relative',
  overflow: 'hidden',
}));

const ItemCard = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 10px rgba(95, 209, 249, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(95, 209, 249, 0.2)',
    border: '1px solid rgba(95, 209, 249, 0.5)',
  }
}));

// Simple marketplace component that demonstrates the ItemImage component
const MarketplaceImageTest = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector(state => state.marketplace);

  useEffect(() => {
    dispatch(getMarketplaceItems());
  }, [dispatch]);

  if (isLoading) {
    return (
      <MarketplaceContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#5FD1F9' }} />
        </Box>
      </MarketplaceContainer>
    );
  }

  if (error) {
    return (
      <MarketplaceContainer>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </MarketplaceContainer>
    );
  }

  return (
    <MarketplaceContainer>
      <Typography variant="h4" sx={{ mb: 4, color: '#5FD1F9', textAlign: 'center' }}>
        Marketplace Image Test
      </Typography>
      
      <ItemsContainer>
        <Typography variant="h5" sx={{ mb: 3, color: '#5FD1F9' }}>
          All Items with ItemImage Component
        </Typography>
        
        <Grid container spacing={3}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={item._id || index}>
              <ItemCard>
                {/* Using our new ItemImage component */}
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
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                    {item.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {item.price} G
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7 }}>
                      {item.category}
                    </Typography>
                  </Box>
                </Box>
              </ItemCard>
            </Grid>
          ))}
        </Grid>
      </ItemsContainer>
    </MarketplaceContainer>
  );
};

export default MarketplaceImageTest;
