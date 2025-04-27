import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faShoppingCart, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './MarketplaceItemCard.css';

const MarketplaceItemCard = ({ item, onAddToCart, onBuyNow, onViewDetails, isInCart, isOwned }) => {
  return (
    <Card className={`marketplace-item-card holographic-glow${isOwned ? ' owned' : ''}`}>  
      <div className="item-image-container">
        <img src={item.image || '/images/items/default-item.png'} alt={item.name} className="item-image" />
        <Badge bg="info" className="item-rarity-badge">{item.rarity}</Badge>
      </div>
      <Card.Body>
        <Card.Title className="item-name">{item.name}</Card.Title>
        <Card.Text className="item-description">{item.description}</Card.Text>
        <div className="item-meta">
          <span className="item-type">{item.type}</span>
          <span className="item-price">
            <FontAwesomeIcon icon={faCoins} className="me-1" />
            {item.price}
          </span>
        </div>
        <div className="item-actions">
          <Button 
            variant={isInCart ? 'success' : 'primary'} 
            size="sm" 
            onClick={() => onAddToCart(item)} 
            disabled={isOwned}
          >
            <FontAwesomeIcon icon={faShoppingCart} /> {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onBuyNow(item)}
            disabled={isOwned}
          >
            Buy Now
          </Button>
          <Button 
            variant="info" 
            size="sm" 
            onClick={() => onViewDetails(item)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MarketplaceItemCard;
