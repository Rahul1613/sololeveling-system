/**
 * Icon Components
 * 
 * This file provides a central location for all icon components used in the application.
 * It replaces Font Awesome with Material-UI icons.
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
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';
import ScienceIcon from '@mui/icons-material/Science';
import DeleteIcon from '@mui/icons-material/Delete';
import PanToolIcon from '@mui/icons-material/PanTool';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

// Icon mapping
const iconMap = {
  'arrow-up': ArrowUpwardIcon,
  'arrow-left': ArrowBackIcon,
  'check': CheckIcon,
  'times': CloseIcon,
  'exclamation-triangle': WarningIcon,
  'video': VideocamIcon,
  'camera': CameraAltIcon,
  'location-arrow': LocationOnIcon,
  'skull': SentimentVeryDissatisfiedIcon,
  'medal': EmojiEventsIcon,
  'trophy': EmojiEventsIcon,
  'scroll': DescriptionIcon,
  'coins': AttachMoneyIcon,
  'star': StarIcon,
  'shopping-cart': ShoppingCartIcon,
  'info-circle': InfoIcon,
  'level-up': TrendingUpIcon,
  'plus': AddIcon,
  'shield-alt': ShieldIcon,
  'flask': ScienceIcon,
  'trash': DeleteIcon,
  'hand-holding': PanToolIcon,
  'tshirt': CheckroomIcon,
  'dumbbell': FitnessCenterIcon,
  'google': GoogleIcon,
  'facebook-f': FacebookIcon,
};

/**
 * FontAwesomeIcon replacement component
 * This component mimics the FontAwesomeIcon API but uses Material-UI icons
 */
export const FontAwesomeIcon = ({ icon, ...props }) => {
  // Extract icon name from various formats
  let iconName = '';
  
  if (typeof icon === 'string') {
    iconName = icon;
  } else if (icon && icon.iconName) {
    iconName = icon.iconName;
  } else if (Array.isArray(icon) && icon.length > 1) {
    iconName = icon[1];
  }
  
  // Get the corresponding Material-UI icon
  const IconComponent = iconMap[iconName] || InfoIcon;
  
  return <IconComponent {...props} />;
};

// Export individual icons for direct use
export {
  ArrowUpwardIcon as ArrowUpIcon,
  ArrowBackIcon as ArrowLeftIcon,
  CheckIcon,
  CloseIcon as TimesIcon,
  WarningIcon as ExclamationTriangleIcon,
  VideocamIcon as VideoIcon,
  CameraAltIcon as CameraIcon,
  LocationOnIcon as LocationArrowIcon,
  SentimentVeryDissatisfiedIcon as SkullIcon,
  EmojiEventsIcon as MedalIcon,
  EmojiEventsIcon as TrophyIcon,
  DescriptionIcon as ScrollIcon,
  AttachMoneyIcon as CoinsIcon,
  StarIcon,
  ShoppingCartIcon,
  InfoIcon as InfoCircleIcon,
  TrendingUpIcon as LevelUpIcon,
  AddIcon as PlusIcon,
  ShieldIcon as ShieldAltIcon,
  ScienceIcon as FlaskIcon,
  DeleteIcon as TrashIcon,
  PanToolIcon as HandHoldingIcon,
  CheckroomIcon as TshirtIcon,
  FitnessCenterIcon as DumbbellIcon,
  GoogleIcon,
  FacebookIcon as FacebookFIcon,
};

// Export mock Font Awesome icon objects
export const faArrowUp = { iconName: 'arrow-up' };
export const faArrowLeft = { iconName: 'arrow-left' };
export const faCheck = { iconName: 'check' };
export const faTimes = { iconName: 'times' };
export const faExclamationTriangle = { iconName: 'exclamation-triangle' };
export const faVideo = { iconName: 'video' };
export const faCamera = { iconName: 'camera' };
export const faLocationArrow = { iconName: 'location-arrow' };
export const faSkull = { iconName: 'skull' };
export const faMedal = { iconName: 'medal' };
export const faTrophy = { iconName: 'trophy' };
export const faScroll = { iconName: 'scroll' };
export const faCoins = { iconName: 'coins' };
export const faStar = { iconName: 'star' };
export const faShoppingCart = { iconName: 'shopping-cart' };
export const faInfoCircle = { iconName: 'info-circle' };
export const faLevelUp = { iconName: 'level-up' };
export const faPlus = { iconName: 'plus' };
export const faShieldAlt = { iconName: 'shield-alt' };
export const faFlask = { iconName: 'flask' };
export const faTrash = { iconName: 'trash' };
export const faHandHolding = { iconName: 'hand-holding' };
export const faTshirt = { iconName: 'tshirt' };
export const faDumbbell = { iconName: 'dumbbell' };
export const faGoogle = { iconName: 'google' };
export const faFacebookF = { iconName: 'facebook-f' };
