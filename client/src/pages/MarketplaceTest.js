import React from 'react';
import { Box, Typography, Grid, Container, Card, CardContent, CardActions, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ItemImage from '../components/ItemImage';
import { sampleMarketplaceItems } from '../utils/marketplaceData';

// Styled components
const TestContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  maxWidth: '100%',
}));

const TestHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
}));

const TestTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  marginBottom: theme.spacing(1),
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
  fontFamily: '"Rajdhani", sans-serif',
}));

const ItemsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
}));

const ItemCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 10px rgba(95, 209, 249, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 20px rgba(95, 209, 249, 0.3)',
  },
}));

const RarityBadge = styled(Box)(({ rarity, theme }) => ({
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
  border: 
    rarity === 'legendary' ? '1px solid rgba(255, 215, 0, 0.5)' : 
    rarity === 'epic' ? '1px solid rgba(163, 53, 238, 0.5)' : 
    rarity === 'rare' ? '1px solid rgba(0, 112, 221, 0.5)' : 
    rarity === 'uncommon' ? '1px solid rgba(30, 255, 0, 0.5)' : 
    '1px solid rgba(190, 190, 190, 0.5)',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  textTransform: 'capitalize',
}));

/**
 * MarketplaceTest component to demonstrate the ItemImage component
 */
const MarketplaceTest = () => {
  return (
    <TestContainer>
      <TestHeader>
        <TestTitle variant="h4">
          Marketplace Image Test
        </TestTitle>
        <Typography variant="subtitle1" sx={{ color: '#eaf6ff', opacity: 0.8 }}>
          Testing the ItemImage component with sample marketplace items
        </Typography>
      </TestHeader>

      <ItemsContainer>
        <Grid container spacing={3}>
          {sampleMarketplaceItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item._id}>
              <ItemCard>
                <ItemImage item={item} height={180} />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <RarityBadge rarity={item.rarity}>
                      {item.rarity}
                    </RarityBadge>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2 }}>
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0, mt: 'auto' }}>
                  <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {item.price} G
                  </Typography>
                  <Button 
                    size="small" 
                    sx={{ 
                      color: '#5FD1F9',
                      border: '1px solid rgba(95, 209, 249, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(95, 209, 249, 0.1)',
                        border: '1px solid rgba(95, 209, 249, 0.8)',
                      }
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </ItemCard>
            </Grid>
          ))}
        </Grid>
      </ItemsContainer>
    </TestContainer>
  );
};

export default MarketplaceTest;
