import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import Carousel from 'react-material-ui-carousel';
import MarketplaceItemCard from './MarketplaceItemCard';

const StyledCarousel = styled(Carousel)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(4),
  '& .MuiPaper-root': {
    backgroundColor: 'transparent',
  },
  '& .MuiButtonBase-root': {
    color: '#5FD1F9',
  },
  '& .MuiButtonBase-root:hover': {
    backgroundColor: 'rgba(95, 209, 249, 0.1)',
  },
  '& .MuiButtonBase-root.Mui-disabled': {
    color: 'rgba(95, 209, 249, 0.3)',
  },
  '& .CarouselItem': {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
}));

const FeaturedItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 20px rgba(95, 209, 249, 0.2)',
}));

const FeaturedTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
}));

const FeaturedCarousel = ({ items, onAddToCart, onBuyNow, onViewDetails, cart, user }) => {
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  
  if (!items || items.length === 0) return null;
  
  return (
    <FeaturedItemContainer>
      <FeaturedTitle variant={isDesktop ? 'h4' : 'h5'}>
        Featured Items
      </FeaturedTitle>
      
      <StyledCarousel
        animation="fade"
        autoPlay
        interval={6000}
        navButtonsAlwaysVisible={isDesktop}
        navButtonsWrapperProps={{
          style: {
            padding: isDesktop ? '0 20px' : '0 10px',
          }
        }}
        indicatorContainerProps={{
          style: {
            marginTop: '20px',
            textAlign: 'center',
          }
        }}
        indicatorIconButtonProps={{
          style: {
            color: 'rgba(95, 209, 249, 0.3)',
            margin: '0 8px',
          }
        }}
        activeIndicatorIconButtonProps={{
          style: {
            color: '#5FD1F9',
          }
        }}
      >
        {items.map((item) => (
          <Box key={item._id} className="CarouselItem" sx={{ width: '100%', maxWidth: isDesktop ? '400px' : '100%' }}>
            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <MarketplaceItemCard
                item={item}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onViewDetails={onViewDetails}
                isInCart={cart.some(c => c._id === item._id)}
                isOwned={user?.inventory?.some(inv => inv._id === item._id)}
              />
            </Box>
            
            <Box sx={{ 
              mt: 2, 
              textAlign: 'center',
              display: isDesktop ? 'block' : 'none',
            }}>
              <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                {item.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#eaf6ff', mt: 1 }}>
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </StyledCarousel>
    </FeaturedItemContainer>
  );
};

export default FeaturedCarousel;
