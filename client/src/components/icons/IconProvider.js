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
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // Skull
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import CelebrationIcon from '@mui/icons-material/Celebration';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InventoryIcon from '@mui/icons-material/Inventory';
import BackpackIcon from '@mui/icons-material/Backpack';
import DiamondIcon from '@mui/icons-material/Diamond';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import SellIcon from '@mui/icons-material/Sell';
import PaidIcon from '@mui/icons-material/Paid';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

/**
 * Icon mapping object
 * Maps Font Awesome icon names to Material-UI components
 */
const iconMap = {
  // Arrows and navigation
  'arrow-up': ArrowUpwardIcon,
  'arrow-left': ArrowBackIcon,
  'expand-more': ExpandMoreIcon,
  'expand-less': ExpandLessIcon,
  
  // Status icons
  'check': CheckIcon,
  'times': CloseIcon,
  'exclamation-triangle': WarningIcon,
  'warning': WarningIcon,
  'error': ErrorOutlineIcon,
  'danger': DangerousIcon,
  'report-problem': ReportProblemIcon,
  
  // Media icons
  'video': VideocamIcon,
  'camera': CameraAltIcon,
  'location-arrow': LocationOnIcon,
  'mic': MicIcon,
  'mic-off': MicOffIcon,
  'volume-up': VolumeUpIcon,
  'volume-off': VolumeOffIcon,
  
  // Game-related icons
  'skull': SentimentVeryDissatisfiedIcon,
  'medal': EmojiEventsIcon,
  'trophy': EmojiEventsIcon,
  'scroll': DescriptionIcon,
  'coins': AttachMoneyIcon,
  'star': StarIcon,
  'celebration': CelebrationIcon,
  'military-tech': MilitaryTechIcon,
  'premium': WorkspacePremiumIcon,
  'fire': LocalFireDepartmentIcon,
  'bolt': BoltIcon,
  'flash': FlashOnIcon,
  'run': DirectionsRunIcon,
  'fight': SportsKabaddiIcon,
  'game': SportsEsportsIcon,
  'score': SportsScoreIcon,
  
  // Shopping and inventory icons
  'shopping-cart': ShoppingCartIcon,
  'info-circle': InfoIcon,
  'store': StorefrontIcon,
  'mall': LocalMallIcon,
  'sell': SellIcon,
  'paid': PaidIcon,
  'money': MonetizationOnIcon,
  'currency': CurrencyExchangeIcon,
  'inventory': InventoryIcon,
  'backpack': BackpackIcon,
  'diamond': DiamondIcon,
  
  // Level and stats icons
  'level-up': TrendingUpIcon,
  'level-down': TrendingDownIcon,
  'plus': AddIcon,
  'shield-alt': ShieldIcon,
  'shield': ShieldIcon,
  'flask': ScienceIcon,
  'trash': DeleteIcon,
  'hand-holding': PanToolIcon,
  'tshirt': CheckroomIcon,
  'dumbbell': FitnessCenterIcon,
  'chart': BarChartIcon,
  'graph': ShowChartIcon,
  'auto-graph': AutoGraphIcon,
  
  // User and account icons
  'user': PersonIcon,
  'users': GroupIcon,
  'account': AccountCircleIcon,
  'verified': VerifiedIcon,
  'verified-user': VerifiedUserIcon,
  'security': SecurityIcon,
  'lock': LockIcon,
  'unlock': LockOpenIcon,
  'encryption': EnhancedEncryptionIcon,
  'no-encryption': NoEncryptionIcon,
  
  // UI and navigation icons
  'menu': MenuIcon,
  'home': HomeIcon,
  'settings': SettingsIcon,
  'logout': LogoutIcon,
  'play': PlayArrowIcon,
  'pause': PauseIcon,
  'stop': StopIcon,
  'refresh': RefreshIcon,
  'more': MoreVertIcon,
  'edit': EditIcon,
  'save': SaveIcon,
  'cancel': CancelIcon,
  'search': SearchIcon,
  'filter': FilterListIcon,
  'sort': SortIcon,
  'visibility': VisibilityIcon,
  'visibility-off': VisibilityOffIcon,
  'list': FormatListBulletedIcon,
  'assignment': AssignmentIcon,
  'event': EventIcon,
  'time': AccessTimeIcon,
  'timer': TimerIcon,
  'hourglass-empty': HourglassEmptyIcon,
  'hourglass-full': HourglassFullIcon,
  
  // Notification icons
  'notification': NotificationsIcon,
  'notification-active': NotificationsActiveIcon,
  'notification-off': NotificationsOffIcon,
  'announcement': AnnouncementIcon,
  'campaign': CampaignIcon,
  'new-release': NewReleasesIcon,
  
  // Social and brand icons
  'google': GoogleIcon,
  'facebook': FacebookIcon,
  'facebook-f': FacebookIcon,
  
  // Misc icons
  'psychology': PsychologyIcon,
  'person': EmojiPeopleIcon,
  'good': GppGoodIcon,
  'bad': GppBadIcon,
};

/**
 * Get a Material-UI icon component by name
 * @param {string} name - Icon name
 * @param {object} props - Props to pass to the icon component
 * @returns {React.ReactElement} Material-UI icon component
 */
export const getIcon = (name, props = {}) => {
  // Handle Font Awesome icon format (e.g., "fa-user" or ["fas", "user"])
  let iconName = name;
  
  if (typeof name === 'string') {
    // Remove "fa-" prefix if present
    iconName = name.replace(/^fa-/, '');
  } else if (Array.isArray(name) && name.length > 1) {
    // Handle array format ["fas", "user"]
    iconName = name[1];
  } else if (name && typeof name === 'object' && name.iconName) {
    // Handle object format {prefix: "fas", iconName: "user"}
    iconName = name.iconName;
  }
  
  // Get the icon component
  const IconComponent = iconMap[iconName] || InfoIcon;
  
  // Return the icon component with props
  return <IconComponent {...props} />;
};

/**
 * FontAwesome compatibility component
 * Drop-in replacement for FontAwesomeIcon
 */
export const FontAwesomeIcon = ({ icon, ...props }) => {
  return getIcon(icon, props);
};

export default {
  getIcon,
  FontAwesomeIcon
};
