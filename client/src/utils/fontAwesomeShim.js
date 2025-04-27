/**
 * Font Awesome Shim
 * 
 * This file provides a compatibility layer for Font Awesome
 * It intercepts imports and redirects them to our custom IconProvider
 */

// Export the FontAwesomeIcon component from our custom provider
export { FontAwesomeIcon } from '../components/icons/IconProvider';

// Create dummy exports for all Font Awesome icons
// This prevents import errors when components try to import specific icons
const createDummyIcon = (name) => ({ 
  iconName: name,
  prefix: 'fas',
  icon: [512, 512, [], name, "M0 0h512v512H0z"]
});

// Common icons used in the application
export const faArrowUp = createDummyIcon('arrow-up');
export const faArrowLeft = createDummyIcon('arrow-left');
export const faCheck = createDummyIcon('check');
export const faTimes = createDummyIcon('times');
export const faExclamationTriangle = createDummyIcon('exclamation-triangle');
export const faVideo = createDummyIcon('video');
export const faCamera = createDummyIcon('camera');
export const faLocationArrow = createDummyIcon('location-arrow');
export const faSkull = createDummyIcon('skull');
export const faMedal = createDummyIcon('medal');
export const faTrophy = createDummyIcon('trophy');
export const faScroll = createDummyIcon('scroll');
export const faCoins = createDummyIcon('coins');
export const faStar = createDummyIcon('star');
export const faShoppingCart = createDummyIcon('shopping-cart');
export const faInfoCircle = createDummyIcon('info-circle');
export const faLevelUp = createDummyIcon('level-up');
export const faPlus = createDummyIcon('plus');
export const faShieldAlt = createDummyIcon('shield-alt');
export const faFlask = createDummyIcon('flask');
export const faTrash = createDummyIcon('trash');
export const faHandHolding = createDummyIcon('hand-holding');
export const faTshirt = createDummyIcon('tshirt');
export const faDumbbell = createDummyIcon('dumbbell');
export const faGoogle = createDummyIcon('google');
export const faFacebookF = createDummyIcon('facebook-f');
export const faUser = createDummyIcon('user');
export const faUsers = createDummyIcon('users');
export const faLock = createDummyIcon('lock');
export const faUnlock = createDummyIcon('unlock');
export const faEdit = createDummyIcon('edit');
export const faSave = createDummyIcon('save');
export const faCancel = createDummyIcon('cancel');
export const faSearch = createDummyIcon('search');
export const faFilter = createDummyIcon('filter');
export const faSort = createDummyIcon('sort');
export const faEye = createDummyIcon('visibility');
export const faEyeSlash = createDummyIcon('visibility-off');
export const faList = createDummyIcon('list');
export const faCalendar = createDummyIcon('event');
export const faClock = createDummyIcon('time');
export const faHourglass = createDummyIcon('hourglass-empty');
export const faBell = createDummyIcon('notification');
export const faBellSlash = createDummyIcon('notification-off');
export const faVolumeUp = createDummyIcon('volume-up');
export const faVolumeOff = createDummyIcon('volume-off');
export const faMicrophone = createDummyIcon('mic');
export const faMicrophoneSlash = createDummyIcon('mic-off');

// Export a default object to satisfy module imports
export default {
  FontAwesomeIcon,
  faArrowUp,
  faArrowLeft,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faVideo,
  faCamera,
  faLocationArrow,
  faSkull,
  faMedal,
  faTrophy,
  faScroll,
  faCoins,
  faStar,
  faShoppingCart,
  faInfoCircle,
  faLevelUp,
  faPlus,
  faShieldAlt,
  faFlask,
  faTrash,
  faHandHolding,
  faTshirt,
  faDumbbell,
  faGoogle,
  faFacebookF
};
