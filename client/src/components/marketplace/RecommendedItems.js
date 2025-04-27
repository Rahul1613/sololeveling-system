import React from 'react';
import MarketplaceItemCard from './MarketplaceItemCard';
import './RecommendedItems.css';

const RecommendedItems = ({ items, onAddToCart, onBuyNow, onViewDetails, cart, user }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="recommended-items-section holographic-glow">
      <h2 className="recommended-title">Recommended For You</h2>
      <div className="recommended-items-grid">
        {items.map(item => (
          <MarketplaceItemCard
            key={item._id}
            item={item}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            onViewDetails={onViewDetails}
            isInCart={cart.some(c => c._id === item._id)}
            isOwned={user?.inventory?.some(inv => inv._id === item._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedItems;
