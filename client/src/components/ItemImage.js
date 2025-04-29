import React, { useState } from 'react';
import { CardMedia } from '@mui/material';

/**
 * ItemImage component for displaying marketplace item images with proper fallbacks
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - The marketplace item
 * @param {number} props.height - Image height (default: 140)
 * @param {Object} props.sx - Additional styles
 * @returns {JSX.Element} - CardMedia component with proper image handling
 */
const ItemImage = ({ item, height = 140, sx = {} }) => {
  const [imageSrc, setImageSrc] = useState(() => {
    // If the item already has an image path, use it
    if (item?.image) return item.image;
    
    // Try to use the item name
    if (item?.name) {
      return `/images/items/${item.name}.png`;
    }
    
    // Default fallback
    return '/images/items/default.png';
  });

  // Handle image loading errors
  const handleImageError = () => {
    const imgName = item?.name;
    
    // If no name, use a default image
    if (!imgName) {
      setImageSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==');
      return;
    }
    
    // Try different file extensions
    if (imageSrc.endsWith('.png')) {
      setImageSrc(`/images/items/${imgName}.jpg`);
    } else if (imageSrc.endsWith('.jpg')) {
      setImageSrc(`/images/items/${imgName}.jpeg`);
    } else if (imageSrc.endsWith('.jpeg')) {
      // If we've tried all extensions, use a category-based fallback
      const categoryFallbacks = {
        'weapons': 'Steel Sword.jpg',
        'armor': 'Leather Armor.jpg',
        'potions': 'Health Potion.jpg',
        'accessories': 'Shadow Essence.jpeg',
        'special': 'Teleportation Scroll.jpeg'
      };
      
      const fallbackImage = categoryFallbacks[item?.category?.toLowerCase()] || 'default';
      setImageSrc(`/images/items/${fallbackImage}`);
    } else {
      // Last resort fallback
      setImageSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==');
    }
  };

  const defaultStyles = { 
    objectFit: 'contain', 
    p: 1,
    background: 'rgba(0, 0, 0, 0.3)',
    backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
    backgroundSize: '20px 20px'
  };

  return (
    <CardMedia
      component="img"
      height={height}
      image={imageSrc}
      alt={item?.name || 'Marketplace Item'}
      sx={{ ...defaultStyles, ...sx }}
      onError={handleImageError}
    />
  );
};

export default ItemImage;
