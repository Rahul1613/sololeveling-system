/**
 * Utility functions for handling images in the Solo Leveling application
 */

/**
 * Get the appropriate image path for an item based on its properties
 * Tries to use the item's name or falls back to category-based defaults
 * 
 * @param {Object} item - The marketplace item
 * @returns {string} - The image path
 */
export const getItemImagePath = (item) => {
  if (!item) return null;
  
  // If the item already has an image path, use it
  if (item.image) return item.image;
  
  // Try to use the item name
  if (item.name) {
    return `/images/items/${item.name}.png`;
  }
  
  // Fall back to category-based defaults
  const categoryDefaults = {
    'weapons': 'Steel Sword.jpg',
    'armor': 'Leather Armor.jpg',
    'potions': 'Health Potion.jpg',
    'accessories': 'Shadow Essence.jpeg',
    'special': 'Teleportation Scroll.jpeg'
  };
  
  const defaultImage = categoryDefaults[item.category?.toLowerCase()] || 'default.png';
  return `/images/items/${defaultImage}`;
};

/**
 * Handle image loading errors by trying different file extensions
 * and falling back to category defaults if needed
 * 
 * @param {Event} event - The error event
 * @param {Object} item - The marketplace item
 * @param {Function} setImagePath - Optional state setter function to update the image path
 */
export const handleImageError = (event, item, setImagePath = null) => {
  const imgElement = event.target;
  const imgName = item.name;
  
  // Try different file extensions
  const extensions = ['.jpg', '.jpeg', '.gif'];
  let extensionIndex = 0;
  
  const tryNextExtension = () => {
    if (extensionIndex < extensions.length) {
      const newPath = `/images/items/${imgName}${extensions[extensionIndex]}`;
      if (setImagePath) {
        setImagePath(newPath);
      } else {
        imgElement.src = newPath;
      }
      extensionIndex++;
    } else {
      // If all extensions fail, use a fallback based on category
      const fallbackImage = 
        item.category === 'weapons' ? 'Steel Sword.jpg' :
        item.category === 'armor' ? 'Leather Armor.jpg' :
        item.category === 'potions' ? 'Health Potion.jpg' :
        item.category === 'accessories' ? 'Shadow Essence.jpeg' :
        'Teleportation Scroll.jpeg';
      
      const fallbackPath = `/images/items/${fallbackImage}`;
      if (setImagePath) {
        setImagePath(fallbackPath);
        // If even the fallback fails, use a data URI
        imgElement.onerror = () => {
          setImagePath('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==');
        };
      } else {
        imgElement.src = fallbackPath;
        // If even the fallback fails, use a data URI
        imgElement.onerror = () => {
          imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
        };
      }
    }
  };
  
  if (setImagePath) {
    // When using state setter, we need to rely on the onError event of the image
    return tryNextExtension();
  } else {
    // Legacy mode for direct DOM manipulation
    imgElement.onerror = tryNextExtension;
    tryNextExtension();
  }
};
