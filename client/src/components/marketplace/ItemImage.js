import React, { useState, useEffect, useRef } from 'react';
import { CardMedia, Box } from '@mui/material';
import { getItemImagePath, handleImageError } from '../../utils/imageUtils';

/**
 * ItemImage component for displaying marketplace item images with fallback handling
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - The item object containing name, id, category, etc.
 * @param {number} props.height - The height of the image (default: 140)
 * @param {Object} props.sx - Additional styles to apply to the CardMedia component
 * @returns {JSX.Element} - The ItemImage component
 */
const ItemImage = ({ item, height = 140, sx = {} }) => {
  const [imagePath, setImagePath] = useState(getItemImagePath(item));
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);
  
  // Handle ResizeObserver cleanup to prevent the loop error
  useEffect(() => {
    // Disconnect any ResizeObservers when component unmounts
    return () => {
      if (window.ResizeObserver) {
        // Find all ResizeObservers and disconnect them
        const resizeObservers = window.__RESIZE_OBSERVERS__ || [];
        resizeObservers.forEach(observer => {
          try {
            observer.disconnect();
          } catch (e) {
            console.warn('Error disconnecting ResizeObserver:', e);
          }
        });
      }
    };
  }, []);

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <Box sx={{ position: 'relative', height, overflow: 'hidden', ...sx }}>
      <CardMedia
        ref={imageRef}
        component="img"
        height={height}
        image={imagePath}
        alt={item.name || 'Item'}
        sx={{
          objectFit: 'contain',
          p: 1,
          background: 'rgba(0, 0, 0, 0.3)',
          backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
          backgroundSize: '20px 20px',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onError={(e) => handleImageError(e, item, setImagePath)}
        onLoad={handleLoad}
      />
      {!loaded && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#5FD1F9'
          }}
        >
          Loading...
        </Box>
      )}
    </Box>
  );
};

export default ItemImage;
