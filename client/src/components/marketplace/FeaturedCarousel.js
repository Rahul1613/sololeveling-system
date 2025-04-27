import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import MarketplaceItemCard from './MarketplaceItemCard';
import './FeaturedCarousel.css';

const FeaturedCarousel = ({ items, onAddToCart, onBuyNow, onViewDetails, cart, user }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="featured-carousel-container">
      <Carousel fade controls indicators interval={4000} className="featured-carousel holographic-glow">
        {items.map((item) => (
          <Carousel.Item key={item._id}>
            <div className="carousel-item-content">
              <MarketplaceItemCard
                item={item}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onViewDetails={onViewDetails}
                isInCart={cart.some(c => c._id === item._id)}
                isOwned={user?.inventory?.some(inv => inv._id === item._id)}
              />
            </div>
            <Carousel.Caption>
              <h3 className="carousel-title">{item.name}</h3>
              <p className="carousel-desc">{item.description}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
