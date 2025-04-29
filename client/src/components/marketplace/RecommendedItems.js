import React from 'react';
import { Box, Grid, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import MarketplaceItemCard from './MarketplaceItemCard';

const RecommendedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 20px rgba(95, 209, 249, 0.2)',
  marginBottom: theme.spacing(4),
}));

const RecommendedTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
}));

const RecommendedItems = ({ items, onAddToCart, onBuyNow, onViewDetails, cart, user }) => {
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  
  if (!items || items.length === 0) return null;
  
  return (
    <RecommendedContainer>
      <RecommendedTitle variant={isDesktop ? 'h4' : 'h5'}>
        Recommended For You
      </RecommendedTitle>
      
      <Grid container spacing={3}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={3} key={item._id}>
            <MarketplaceItemCard
              item={item}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onViewDetails={onViewDetails}
              isInCart={cart.some(c => c._id === item._id)}
              isOwned={user?.inventory?.some(inv => inv._id === item._id)}
            />
          </Grid>
        ))}
      </Grid>
    </RecommendedContainer>
  );
};

export default RecommendedItems;
