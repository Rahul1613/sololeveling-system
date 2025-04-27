/**
 * Icon Mapper Utility
 * Maps Font Awesome icon names to Material-UI icons
 * This helps migrate from Font Awesome to Material-UI icons
 */

import React from 'react';

// Material-UI Icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SkullIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // Closest to skull
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Medal/trophy
import DescriptionIcon from '@mui/icons-material/Description'; // Scroll
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Coins
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Level up
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';
import ScienceIcon from '@mui/icons-material/Science'; // Flask
import DeleteIcon from '@mui/icons-material/Delete'; // Trash
import PanToolIcon from '@mui/icons-material/PanTool'; // Hand
import CheckroomIcon from '@mui/icons-material/Checkroom'; // T-shirt
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Dumbbell
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

/**
 * Map Font Awesome icon names to Material-UI components
 * @param {string} iconName - Font Awesome icon name (without the 'fa' prefix)
 * @param {Object} props - Additional props to pass to the icon component
 * @returns {React.ReactElement} Material-UI icon component
 */
export const getMuiIcon = (iconName, props = {}) => {
  const iconMap = {
    // Arrows
    'arrow-up': ArrowUpwardIcon,
    'arrow-left': ArrowBackIcon,
    
    // Status icons
    'check': CheckIcon,
    'times': CloseIcon,
    'exclamation-triangle': WarningIcon,
    
    // Media icons
    'video': VideocamIcon,
    'camera': CameraAltIcon,
    'location-arrow': LocationOnIcon,
    
    // Game-related icons
    'skull': SkullIcon,
    'medal': EmojiEventsIcon,
    'trophy': EmojiEventsIcon,
    'scroll': DescriptionIcon,
    'coins': AttachMoneyIcon,
    'star': StarIcon,
    
    // Shopping icons
    'shopping-cart': ShoppingCartIcon,
    'info-circle': InfoIcon,
    
    // Level and stats icons
    'level-up': TrendingUpIcon,
    'plus': AddIcon,
    'shield-alt': ShieldIcon,
    'flask': ScienceIcon,
    'trash': DeleteIcon,
    'hand-holding': PanToolIcon,
    'tshirt': CheckroomIcon,
    'dumbbell': FitnessCenterIcon,
    
    // Social icons
    'google': GoogleIcon,
    'facebook-f': FacebookIcon,
  };
  
  const IconComponent = iconMap[iconName] || InfoIcon; // Default to InfoIcon if not found
  
  return <IconComponent {...props} />;
};

/**
 * Replacement for FontAwesomeIcon component
 * @param {Object} props - Props that would be passed to FontAwesomeIcon
 * @returns {React.ReactElement} Material-UI icon component
 */
export const IconComponent = ({ icon, ...props }) => {
  // Extract icon name from Font Awesome format
  let iconName = '';
  
  if (typeof icon === 'string') {
    iconName = icon;
  } else if (icon && icon.iconName) {
    iconName = icon.iconName;
  } else if (Array.isArray(icon) && icon.length > 1) {
    iconName = icon[1];
  }
  
  return getMuiIcon(iconName, props);
};

export default {
  getMuiIcon,
  IconComponent
};
