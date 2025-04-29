import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Badge,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SystemButton from '../common/SystemButton';

// Styled components
const StyledCard = styled(Card)(({ theme, rarity, owned }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  background: 'rgba(10, 25, 41, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: owned 
    ? '0 0 15px rgba(0, 255, 0, 0.5)' 
    : rarity === 'legendary' ? '0 0 15px rgba(255, 215, 0, 0.7)' 
    : rarity === 'epic' ? '0 0 12px rgba(163, 53, 238, 0.6)' 
    : rarity === 'rare' ? '0 0 10px rgba(0, 112, 221, 0.5)' 
    : rarity === 'uncommon' ? '0 0 8px rgba(30, 255, 0, 0.4)' 
    : '0 0 5px rgba(95, 209, 249, 0.3)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: owned 
      ? '0 0 20px rgba(0, 255, 0, 0.7)' 
      : rarity === 'legendary' ? '0 0 20px rgba(255, 215, 0, 0.9)' 
      : rarity === 'epic' ? '0 0 18px rgba(163, 53, 238, 0.8)' 
      : rarity === 'rare' ? '0 0 15px rgba(0, 112, 221, 0.7)' 
      : rarity === 'uncommon' ? '0 0 12px rgba(30, 255, 0, 0.6)' 
      : '0 0 10px rgba(95, 209, 249, 0.5)',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const RarityChip = styled(Chip)(({ theme, rarity }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  fontWeight: 'bold',
  color: '#fff',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  backgroundColor: 
    rarity === 'legendary' ? 'rgba(255, 215, 0, 0.9)' : 
    rarity === 'epic' ? 'rgba(163, 53, 238, 0.8)' : 
    rarity === 'rare' ? 'rgba(0, 112, 221, 0.7)' : 
    rarity === 'uncommon' ? 'rgba(30, 255, 0, 0.6)' : 
    'rgba(190, 190, 190, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
}));

const ItemImage = styled(CardMedia)(({ theme }) => ({
  height: 140,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  margin: '10px',
  borderRadius: '4px',
  border: '1px solid rgba(95, 209, 249, 0.2)',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 215, 0, 0.2)',
  color: '#FFD700',
  border: '1px solid rgba(255, 215, 0, 0.5)',
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: '#FFD700',
  },
}));

const TypeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(95, 209, 249, 0.2)',
  color: '#5FD1F9',
  border: '1px solid rgba(95, 209, 249, 0.5)',
  fontWeight: 'bold',
}));

const MarketplaceItemCard = ({ 
  item, 
  onAddToCart, 
  onBuyNow, 
  onViewDetails, 
  isInCart, 
  isOwned,
  limitedQuantity
}) => {
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  
  // Get rarity color for text
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A335EE';
      case 'rare': return '#0070DD';
      case 'uncommon': return '#1EFF00';
      default: return '#BEBEBE';
    }
  };

  return (
    <StyledCard rarity={item.rarity} owned={isOwned}>
      <RarityChip 
        label={item.rarity} 
        size="small" 
        rarity={item.rarity}
      />
      
      {isOwned && (
        <Chip 
          label="OWNED" 
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: 'rgba(0, 255, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
          }}
        />
      )}
      
      <ItemImage
        image={item.image || '/images/items/default-item.png'}
        title={item.name}
      />
      
      <CardContent sx={{ flexGrow: 1, p: isDesktop ? 2 : 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div"
          sx={{ 
            color: getRarityColor(item.rarity),
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            fontSize: isDesktop ? '1.1rem' : '1rem',
            mb: 1,
            height: '2.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            color: '#eaf6ff',
            mb: 2,
            height: '3em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TypeChip 
            label={item.type} 
            size="small" 
          />
          
          <PriceChip 
            icon={<CurrencyExchangeIcon />} 
            label={item.price} 
            size="small" 
          />
        </Box>
        
        {item.isLimited && (
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: item.limitedQuantity > 5 ? '#eaf6ff' : '#ff5555',
                display: 'block',
                textAlign: 'center',
              }}
            >
              {item.limitedQuantity > 0 
                ? `Limited: ${item.limitedQuantity} remaining` 
                : 'Out of stock!'}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: 1
        }}>
          <Tooltip title={isOwned ? "Already owned" : isInCart ? "Already in cart" : "Add to cart"}>
            <span>
              <SystemButton 
                variant={isInCart ? "contained" : "outlined"}
                color={isInCart ? "success" : "primary"}
                size="small"
                startIcon={<ShoppingCartIcon />}
                onClick={() => onAddToCart(item)}
                disabled={isOwned || item.limitedQuantity === 0}
                sx={{ 
                  flexGrow: isMobile ? 1 : 0,
                  minWidth: isMobile ? '48%' : 'auto',
                  mb: isMobile ? 1 : 0
                }}
              >
                {isInCart ? 'In Cart' : 'Add'}
              </SystemButton>
            </span>
          </Tooltip>
          
          <Tooltip title="View details">
            <SystemButton 
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => onViewDetails(item)}
              sx={{ 
                flexGrow: isMobile ? 1 : 0,
                minWidth: isMobile ? '48%' : 'auto',
                mb: isMobile ? 1 : 0
              }}
            >
              Details
            </SystemButton>
          </Tooltip>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MarketplaceItemCard;
