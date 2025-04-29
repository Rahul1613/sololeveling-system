import React, { useEffect, useState, useCallback } from 'react';
import ItemImage from '../components/marketplace/ItemImage';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  CircularProgress,
  Alert,
  Paper,
  Button,
  useMediaQuery,
  Tabs,
  Tab,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  getMarketplaceItems, 
  getFeaturedItems, 
  getRecommendedItems, 
  reset 
} from '../redux/slices/marketplaceSlice';
import { getCurrentUser } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/notificationSlice';
import databaseService from '../api/databaseService';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SortIcon from '@mui/icons-material/Sort';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Styled components
const MarketplaceContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  maxWidth: '100%',
}));

const MarketplaceHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '3px',
    background: 'linear-gradient(90deg, rgba(95, 209, 249, 0.1), rgba(95, 209, 249, 0.8), rgba(95, 209, 249, 0.1))',
    borderRadius: '3px',
  }
}));

const MarketplaceTitle = styled(Typography)(({ theme }) => ({
  color: '#5FD1F9',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  marginBottom: theme.spacing(1),
  textShadow: '0 0 10px rgba(95, 209, 249, 0.5)',
  fontFamily: '"Rajdhani", sans-serif',
  position: 'relative',
  display: 'inline-block',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    width: '30px',
    height: '2px',
    background: 'rgba(95, 209, 249, 0.5)',
  },
  '&::before': {
    left: '-40px',
  },
  '&::after': {
    right: '-40px',
  }
}));

const MarketplaceSubtitle = styled(Typography)(({ theme }) => ({
  color: '#eaf6ff',
  marginBottom: theme.spacing(2),
  opacity: 0.8,
  fontFamily: '"Rajdhani", sans-serif',
}));

const ItemsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  background: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top right, rgba(95, 209, 249, 0.1), transparent 70%)',
    pointerEvents: 'none',
  }
}));

const NoItemsMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: '#eaf6ff',
  padding: theme.spacing(4),
  opacity: 0.7,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)',
  border: '1px solid rgba(66, 135, 245, 0.5)',
  boxShadow: '0 0 10px rgba(66, 135, 245, 0.5)',
  color: '#ffffff',
  fontFamily: '"Rajdhani", sans-serif',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '8px 16px',
  '&:hover': {
    background: 'rgba(20, 20, 20, 0.9)',
    boxShadow: '0 0 15px rgba(66, 135, 245, 0.8)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
  margin: theme.spacing(1),
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
  border: '1px solid rgba(95, 209, 249, 0.3)',
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#5FD1F9',
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    color: '#eaf6ff',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiOutlinedInput-root': {
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
}));

const CategoryTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: '#5FD1F9',
    height: '3px',
    borderRadius: '3px',
  },
  '& .MuiTab-root': {
    color: '#eaf6ff',
    opacity: 0.7,
    fontFamily: '"Rajdhani", sans-serif',
    fontWeight: 'bold',
    letterSpacing: '1px',
    '&.Mui-selected': {
      color: '#5FD1F9',
      opacity: 1,
    },
  },
}));

const ItemCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(95, 209, 249, 0.3)',
  boxShadow: '0 0 10px rgba(95, 209, 249, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 20px rgba(95, 209, 249, 0.3)',
    '& .item-overlay': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, transparent, rgba(95, 209, 249, 0.5), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const ItemOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

const RarityChip = styled(Chip)(({ rarity, theme }) => ({
  backgroundColor: 
    rarity === 'legendary' ? 'rgba(255, 215, 0, 0.2)' : 
    rarity === 'epic' ? 'rgba(163, 53, 238, 0.2)' : 
    rarity === 'rare' ? 'rgba(0, 112, 221, 0.2)' : 
    rarity === 'uncommon' ? 'rgba(30, 255, 0, 0.2)' : 
    'rgba(190, 190, 190, 0.2)',
  color: 
    rarity === 'legendary' ? '#FFD700' : 
    rarity === 'epic' ? '#A335EE' : 
    rarity === 'rare' ? '#0070DD' : 
    rarity === 'uncommon' ? '#1EFF00' : 
    '#BEBEBE',
  border: 
    rarity === 'legendary' ? '1px solid rgba(255, 215, 0, 0.5)' : 
    rarity === 'epic' ? '1px solid rgba(163, 53, 238, 0.5)' : 
    rarity === 'rare' ? '1px solid rgba(0, 112, 221, 0.5)' : 
    rarity === 'uncommon' ? '1px solid rgba(30, 255, 0, 0.5)' : 
    '1px solid rgba(190, 190, 190, 0.5)',
  fontWeight: 'bold',
  fontSize: '0.7rem',
  height: '24px',
}));

const CartBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#5FD1F9',
    color: '#000',
    fontWeight: 'bold',
    boxShadow: '0 0 5px rgba(95, 209, 249, 0.5)',
  },
}));

/**
 * Enhanced Marketplace component with improved UI and features
 */
const Marketplace = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { 
    items, 
    featuredItems, 
    recommendedItems, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.marketplace);

  const isDesktop = useMediaQuery('(min-width:900px)');
  
  // Component state
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState(0);
  const [cart, setCart] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellItemName, setSellItemName] = useState('');
  const [sellItemDescription, setSellItemDescription] = useState('');
  const [sellItemPrice, setSellItemPrice] = useState(100);
  const [sellItemCategory, setSellItemCategory] = useState('weapons');
  const [sellItemRarity, setSellItemRarity] = useState('common');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // Category options
  const categories = ['All Items', 'Weapons', 'Armor', 'Potions', 'Accessories', 'Special'];
  
  // Rarity options
  const rarityOptions = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  
  // Sort options
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rarity', label: 'Rarity' },
  ];
  
  // Handle category tab change
  const handleCategoryChange = (event, newValue) => {
    setCategoryTab(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle sort menu
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };
  
  const handleSortChange = (option) => {
    setSortOption(option);
    handleSortMenuClose();
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };
  
  // Handle rarity filter change
  const handleRarityToggle = (rarity) => {
    setSelectedRarities(prev => {
      if (prev.includes(rarity)) {
        return prev.filter(r => r !== rarity);
      } else {
        return [...prev, rarity];
      }
    });
  };
  
  // Handle cart drawer
  const handleCartOpen = () => {
    setCartDrawerOpen(true);
  };
  
  const handleCartClose = () => {
    setCartDrawerOpen(false);
  };
  
  // Handle adding item to cart
  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      // Update quantity if item already in cart
      const updatedCart = cart.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      );
      setCart(updatedCart);
      databaseService.saveToStorage('cart', updatedCart);
    } else {
      // Add new item to cart
      const updatedCart = [...cart, { ...item, quantity: 1 }];
      setCart(updatedCart);
      databaseService.saveToStorage('cart', updatedCart);
    }
    
    dispatch(addNotification({
      message: `${item.name} added to cart`,
      type: 'success'
    }));
  };
  
  // Handle removing item from cart
  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item._id !== itemId);
    setCart(updatedCart);
    databaseService.saveToStorage('cart', updatedCart);
  };
  
  // Handle item details
  const handleItemDetails = (item) => {
    setSelectedItem(item);
    setItemDetailsOpen(true);
  };
  
  const handleCloseItemDetails = () => {
    setItemDetailsOpen(false);
  };
  
  // Handle sell item dialog
  const handleOpenSellDialog = () => {
    setSellDialogOpen(true);
  };
  
  const handleCloseSellDialog = () => {
    setSellDialogOpen(false);
    // Reset form fields
    setSellItemName('');
    setSellItemDescription('');
    setSellItemPrice(100);
    setSellItemCategory('weapons');
    setSellItemRarity('common');
  };
  
  // Handle sell item submission
  const handleSellItem = () => {
    // Create a new item object
    const newItem = {
      _id: `user-item-${Date.now()}`,
      name: sellItemName,
      description: sellItemDescription,
      price: sellItemPrice,
      category: sellItemCategory,
      rarity: sellItemRarity,
      seller: user?.username || 'Anonymous',
      sellerId: user?._id || 'unknown',
      listed: new Date().toISOString(),
      // Use a default image path that matches the item name
      image: `/images/items/${sellItemCategory === 'weapons' ? 'Steel Sword' : 
              sellItemCategory === 'armor' ? 'Leather Armor' : 
              sellItemCategory === 'potions' ? 'Health Potion' : 
              sellItemCategory === 'accessories' ? 'Shadow Essence' : 'default'}.jpg`
    };
    
    // In a real app, this would be an API call to add the item to the marketplace
    // For now, we'll just add it to the local items array
    const updatedItems = [newItem, ...items];
    
    // Update the Redux store (this is a mock implementation)
    // In a real app, you would dispatch an action to add the item to the marketplace
    dispatch({
      type: 'marketplace/addItem',
      payload: newItem
    });
    
    // Show success notification
    dispatch(addNotification({
      message: `${sellItemName} has been listed for sale`,
      type: 'success'
    }));
    
    // Close the dialog
    handleCloseSellDialog();
  };
  
  // Handle purchase dialog
  const handleOpenPurchaseDialog = (item) => {
    setSelectedItem(item);
    setPurchaseDialogOpen(true);
  };
  
  const handleClosePurchaseDialog = () => {
    setPurchaseDialogOpen(false);
    setPurchaseSuccess(false);
  };
  
  // Handle purchase confirmation
  const handlePurchaseConfirm = () => {
    // In a real app, this would be an API call to purchase the item
    // For now, we'll just simulate a successful purchase
    
    // Show success notification
    dispatch(addNotification({
      message: `You have successfully purchased ${selectedItem.name}`,
      type: 'success'
    }));
    
    // Set purchase success
    setPurchaseSuccess(true);
    
    // Remove item from cart if it's there
    const updatedCart = cart.filter(item => item._id !== selectedItem._id);
    setCart(updatedCart);
    databaseService.saveToStorage('cart', updatedCart);
  };

  // Filter and sort items based on user selections
  const filterAndSortItems = useCallback(() => {
    if (!items || items.length === 0) return [];
    
    // Start with all items or category-filtered items
    let result = [...items];
    
    // Apply category filter
    if (categoryTab > 0 && categories[categoryTab]) {
      const category = categories[categoryTab].toLowerCase();
      // Add default categories to items that don't have one
      result = result.filter(item => {
        const itemCategory = (item.category || 'miscellaneous').toLowerCase();
        return itemCategory === category;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply rarity filter
    if (selectedRarities.length > 0) {
      result = result.filter(item => 
        item.rarity && selectedRarities.includes(item.rarity.toLowerCase())
      );
    }
    
    // Apply price range filter
    result = result.filter(item => 
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rarity':
        const rarityOrder = {
          'common': 1,
          'uncommon': 2,
          'rare': 3,
          'epic': 4,
          'legendary': 5
        };
        result.sort((a, b) => {
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        });
        break;
      default:
        // Default sorting (by id or as they come from API)
        break;
    }
    
    return result;
  }, [items, categoryTab, categories, searchQuery, selectedRarities, priceRange, sortOption]);
  
  // Update filtered items when filters or items change
  useEffect(() => {
    if (items && items.length > 0) {
      const filtered = filterAndSortItems();
      setFilteredItems(filtered);
    }
  }, [items, filterAndSortItems]);

  // Load data in a controlled, sequential manner
  useEffect(() => {
    // Add a flag to prevent duplicate loading
    if (isDataLoaded) return;
    
    let isMounted = true;
    let timeoutIds = [];

    const loadData = async () => {
      try {
        // Load marketplace items
        const id1 = setTimeout(async () => {
          if (isMounted) {
            try {
              await dispatch(getMarketplaceItems()).unwrap();
              console.log("Marketplace items loaded");
            } catch (err) {
              console.error("Error loading marketplace items:", err);
              if (isMounted) setError("Failed to load marketplace items");
            }
          }
        }, 100);
        timeoutIds.push(id1);

        // Load featured items after a delay
        const id2 = setTimeout(async () => {
          if (isMounted) {
            try {
              await dispatch(getFeaturedItems()).unwrap();
              console.log("Featured items loaded");
            } catch (err) {
              console.error("Error loading featured items:", err);
            }
          }
        }, 1000);
        timeoutIds.push(id2);

        // Load recommended items after another delay
        const id3 = setTimeout(async () => {
          if (isMounted) {
            try {
              await dispatch(getRecommendedItems()).unwrap();
              console.log("Recommended items loaded");
            } catch (err) {
              console.error("Error loading recommended items:", err);
            }
          }
        }, 2000);
        timeoutIds.push(id3);

        // Load user data and cart after another delay
        const id4 = setTimeout(async () => {
          if (isMounted) {
            try {
              await dispatch(getCurrentUser()).unwrap();
              console.log("User data loaded");
              
              // Load cart from storage
              const savedCart = databaseService.loadFromStorage('cart', []);
              if (savedCart && savedCart.length > 0) {
                setCart(savedCart);
              }
              
              setIsDataLoaded(true);
            } catch (err) {
              console.error("Error loading user data:", err);
            }
          }
        }, 3000);
        timeoutIds.push(id4);
      } catch (error) {
        console.error("Error in loadData:", error);
        if (isMounted) setError("Failed to load marketplace data");
      }
    };

    loadData();

    // Cleanup function to prevent memory leaks and cancel pending operations
    return () => {
      isMounted = false;
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [dispatch, isDataLoaded]); // Add isDataLoaded to dependency array

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
  
  // Render loading state
  if (isLoading && !isDataLoaded) {
    return (
      <MarketplaceContainer>
        <MarketplaceHeader>
          <MarketplaceTitle variant={isDesktop ? "h3" : "h4"}>
            Marketplace
          </MarketplaceTitle>
          <MarketplaceSubtitle variant="subtitle1">
            Loading marketplace data...
          </MarketplaceSubtitle>
        </MarketplaceHeader>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#5FD1F9', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#eaf6ff', opacity: 0.8, fontStyle: 'italic' }}>
            Connecting to the System...
          </Typography>
        </Box>
      </MarketplaceContainer>
    );
  }

  // Render error state
  if (isError || error) {
    return (
      <MarketplaceContainer>
        <MarketplaceHeader>
          <MarketplaceTitle variant={isDesktop ? "h3" : "h4"}>
            Marketplace
          </MarketplaceTitle>
          <MarketplaceSubtitle variant="subtitle1">
            System Connection Error
          </MarketplaceSubtitle>
        </MarketplaceHeader>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            backgroundColor: 'rgba(211, 47, 47, 0.1)', 
            color: '#ff5252',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at top right, rgba(211, 47, 47, 0.2), transparent 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          {message || error || "Failed to load marketplace data. Please check your connection to the System."}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StyledButton 
            onClick={() => window.location.reload()}
            variant="contained"
            startIcon={<SyncIcon />}
          >
            Reconnect to System
          </StyledButton>
        </Box>
      </MarketplaceContainer>
    );
  }
  
  // Render cart drawer
  const renderCartDrawer = () => (
    <Drawer
      anchor="right"
      open={cartDrawerOpen}
      onClose={handleCartClose}
      PaperProps={{
        sx: {
          width: isDesktop ? 400 : '100%',
          maxWidth: '100%',
          background: 'rgba(10, 25, 41, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(95, 209, 249, 0.3)',
          boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.5)',
          p: 2,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
          Your Cart
        </Typography>
        <IconButton onClick={handleCartClose} sx={{ color: '#eaf6ff' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2, borderColor: 'rgba(95, 209, 249, 0.3)' }} />
      
      {cart.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <Typography variant="body1" sx={{ color: '#eaf6ff', opacity: 0.7, mb: 2, textAlign: 'center' }}>
            Your cart is empty
          </Typography>
          <StyledButton onClick={handleCartClose}>
            Continue Shopping
          </StyledButton>
        </Box>
      ) : (
        <>
          <List sx={{ mb: 2 }}>
            {cart.map((item) => (
              <ListItem 
                key={item._id} 
                sx={{ 
                  mb: 1, 
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 1,
                  border: '1px solid rgba(95, 209, 249, 0.2)'
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveFromCart(item._id)}
                    sx={{ color: '#ff5252' }}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ color: '#5FD1F9' }}>
                      {item.name} {item.quantity > 1 && `(${item.quantity})`}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#FFD700' }}>
                      {item.price} G {item.quantity > 1 && `× ${item.quantity} = ${item.price * item.quantity} G`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ mb: 2, borderColor: 'rgba(95, 209, 249, 0.3)' }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#eaf6ff' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {cartTotal} G
              </Typography>
            </Box>
            
            <StyledButton 
              fullWidth 
              sx={{ 
                mb: 1,
                background: 'rgba(95, 209, 249, 0.2)',
                '&:hover': {
                  background: 'rgba(95, 209, 249, 0.3)',
                }
              }}
            >
              Checkout
            </StyledButton>
            
            <StyledButton 
              fullWidth 
              onClick={handleCartClose}
              sx={{ 
                background: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              Continue Shopping
            </StyledButton>
          </Box>
        </>
      )}
    </Drawer>
  );

  // Render item details dialog
  const renderItemDetailsDialog = () => (
    <Dialog 
      open={itemDetailsOpen} 
      onClose={handleCloseItemDetails}
      PaperProps={{
        sx: {
          background: 'rgba(10, 25, 41, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(95, 209, 249, 0.3)',
          boxShadow: '0 0 25px rgba(95, 209, 249, 0.3)',
          maxWidth: '600px',
          width: '100%',
        }
      }}
    >
      {selectedItem && (
        <>
          <DialogTitle sx={{ color: '#5FD1F9', borderBottom: '1px solid rgba(95, 209, 249, 0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {selectedItem.name}
              </Typography>
              <IconButton onClick={handleCloseItemDetails} sx={{ color: '#eaf6ff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: 3, mb: 2 }}>
              <Box sx={{ flex: '0 0 40%', position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={selectedItem.image || `/images/items/${selectedItem.id || 'default'}.png`}
                  alt={selectedItem.name}
                  sx={{ 
                    height: 200, 
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid rgba(95, 209, 249, 0.3)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                    backgroundSize: '20px 20px'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
                  }}
                />
                <RarityChip 
                  label={selectedItem.rarity} 
                  rarity={selectedItem.rarity}
                  size="small"
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <Typography variant="body1" sx={{ color: '#eaf6ff', mb: 2 }}>
                  {selectedItem.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7 }}>
                      Category
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#5FD1F9' }}>
                      {selectedItem.category || 'Miscellaneous'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7 }}>
                      Level Required
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#5FD1F9' }}>
                      {selectedItem.levelRequired || 1}
                    </Typography>
                  </Grid>
                  {selectedItem.stats && Object.entries(selectedItem.stats).map(([key, value]) => (
                    <Grid item xs={6} key={key}>
                      <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>
                      <Typography variant="body1" sx={{ color: value > 0 ? '#4caf50' : '#f44336' }}>
                        {value > 0 ? `+${value}` : value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {selectedItem.price} G
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <StyledButton
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => {
                          handleAddToCart(selectedItem);
                          handleCloseItemDetails();
                        }}
                        sx={{ mr: 1 }}
                      >
                        Add to Cart
                      </StyledButton>
                      <StyledButton
                        onClick={() => {
                          handleCloseItemDetails();
                          handleOpenPurchaseDialog(selectedItem);
                        }}
                        sx={{ 
                          background: 'rgba(95, 209, 249, 0.2)',
                          '&:hover': {
                            background: 'rgba(95, 209, 249, 0.3)',
                          }
                        }}
                      >
                        Buy Now
                      </StyledButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  // Render marketplace with enhanced UI
  return (
    <MarketplaceContainer>
      <MarketplaceHeader>
        <MarketplaceTitle variant={isDesktop ? "h3" : "h4"}>
          Marketplace
        </MarketplaceTitle>
        <MarketplaceSubtitle variant="subtitle1">
          Discover and acquire powerful items for your journey
        </MarketplaceSubtitle>
      </MarketplaceHeader>

      {/* Top Action Bar */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isDesktop ? 'row' : 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        gap: 2
      }}>
        {/* Sell Item Button */}
        <StyledButton 
          onClick={handleOpenSellDialog}
          startIcon={<AttachMoneyIcon />}
          sx={{ 
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
            color: '#ffffff',
            '&:hover': {
              background: 'rgba(76, 175, 80, 0.3)',
              boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)',
            },
            [theme.breakpoints.down('sm')]: {
              width: '100%',
              mb: 2
            },
          }}
        >
          Sell an Item
        </StyledButton>
        
        {/* Search and Filter Bar */}
        <Box sx={{ 
          display: 'flex', 
          flex: 1,
          flexDirection: isDesktop ? 'row' : 'column', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2,
          width: '100%'
        }}>
          <SearchBar>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search items…"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            variant="outlined"
          />
        </SearchBar>
        
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Filter Items">
            <IconButton 
              onClick={handleFilterMenuOpen}
              sx={{ 
                color: selectedRarities.length > 0 ? '#5FD1F9' : '#eaf6ff',
                border: '1px solid rgba(95, 209, 249, 0.3)',
                '&:hover': { backgroundColor: 'rgba(95, 209, 249, 0.1)' }
              }}
            >
              <Badge badgeContent={selectedRarities.length} color="primary" invisible={selectedRarities.length === 0}>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(10, 25, 41, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(95, 209, 249, 0.3)',
                boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
                p: 2,
                minWidth: 250,
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#5FD1F9', mb: 1, px: 2 }}>
              Filter by Rarity
            </Typography>
            {rarityOptions.map((rarity) => (
              <MenuItem 
                key={rarity} 
                onClick={() => handleRarityToggle(rarity)}
                sx={{ 
                  color: '#eaf6ff',
                  backgroundColor: selectedRarities.includes(rarity) ? 'rgba(95, 209, 249, 0.1)' : 'transparent',
                }}
              >
                <Chip 
                  label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  rarity={rarity}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {selectedRarities.includes(rarity) ? <StarIcon fontSize="small" sx={{ color: '#5FD1F9' }} /> : <StarBorderIcon fontSize="small" />}
              </MenuItem>
            ))}
            
            <Divider sx={{ my: 2, borderColor: 'rgba(95, 209, 249, 0.3)' }} />
            
            <Typography variant="subtitle1" sx={{ color: '#5FD1F9', mb: 1, px: 2 }}>
              Price Range
            </Typography>
            <Box sx={{ px: 2, width: '100%' }}>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                sx={{ 
                  color: '#5FD1F9',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(95, 209, 249, 0.16)',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#eaf6ff' }}>
                <Typography variant="caption">{priceRange[0]} G</Typography>
                <Typography variant="caption">{priceRange[1]} G</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <StyledButton 
                size="small" 
                onClick={() => {
                  setSelectedRarities([]);
                  setPriceRange([0, 10000]);
                }}
                sx={{ mr: 1 }}
              >
                Reset
              </StyledButton>
              <StyledButton 
                size="small" 
                onClick={handleFilterMenuClose}
              >
                Apply
              </StyledButton>
            </Box>
          </Menu>
          
          <Tooltip title="Sort Items">
            <IconButton 
              onClick={handleSortMenuOpen}
              sx={{ 
                color: sortOption !== 'default' ? '#5FD1F9' : '#eaf6ff',
                border: '1px solid rgba(95, 209, 249, 0.3)',
                '&:hover': { backgroundColor: 'rgba(95, 209, 249, 0.1)' }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={handleSortMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(10, 25, 41, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(95, 209, 249, 0.3)',
                boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
              }
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                onClick={() => handleSortChange(option.value)}
                sx={{ 
                  color: '#eaf6ff',
                  backgroundColor: sortOption === option.value ? 'rgba(95, 209, 249, 0.1)' : 'transparent',
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
          
          <Tooltip title="Shopping Cart">
            <IconButton 
              onClick={handleCartOpen}
              sx={{ 
                color: cart.length > 0 ? '#5FD1F9' : '#eaf6ff',
                border: '1px solid rgba(95, 209, 249, 0.3)',
                '&:hover': { backgroundColor: 'rgba(95, 209, 249, 0.1)' }
              }}
            >
              <CartBadge badgeContent={cart.length} color="primary" invisible={cart.length === 0}>
                <ShoppingCartIcon />
              </CartBadge>
            </IconButton>
          </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Category Tabs */}
      <CategoryTabs 
        value={categoryTab} 
        onChange={handleCategoryChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 4 }}
      >
        {categories.map((category, index) => (
          <Tab key={index} label={category} />
        ))}
      </CategoryTabs>

      {/* Featured Items Section */}
      {categoryTab === 0 && featuredItems && featuredItems.length > 0 && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(10, 25, 41, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(95, 209, 249, 0.3)',
            boxShadow: '0 0 15px rgba(95, 209, 249, 0.2)',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#5FD1F9', 
              mb: 2, 
              textAlign: 'center',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <StarIcon sx={{ color: '#FFD700' }} />
            Featured Items
            <StarIcon sx={{ color: '#FFD700' }} />
          </Typography>
          
          <Grid container spacing={3}>
            {featuredItems.slice(0, 4).map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={item._id || index}>
                <ItemCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image || `/images/items/${item.id || 'default'}.png`}
                    alt={item.name}
                    sx={{ 
                      objectFit: 'contain', 
                      p: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }}
                    onError={(e) => {
                      // Use a data URI for a default item image to prevent blinking
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <RarityChip label={item.rarity} rarity={item.rarity} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                      {item.price} G
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#5FD1F9', mr: 1 }}
                        onClick={() => handleItemDetails(item)}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#5FD1F9' }}
                        onClick={() => handleAddToCart(item)}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                  <ItemOverlay className="item-overlay">
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <StyledButton 
                        variant="contained" 
                        startIcon={<InfoOutlinedIcon />}
                        onClick={() => handleItemDetails(item)}
                      >
                        Details
                      </StyledButton>
                      <StyledButton 
                        variant="contained" 
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </StyledButton>
                    </Box>
                  </ItemOverlay>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* All Items Section */}
      <ItemsContainer>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#5FD1F9', 
            mb: 3, 
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {categoryTab === 0 ? 'All Items' : categories[categoryTab]}
        </Typography>
        
        {filteredItems && filteredItems.length > 0 ? (
          <Grid container spacing={3}>
            {filteredItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={item._id || index}>
                <ItemCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image || `/images/items/${item.id || 'default'}.png`}
                    alt={item.name}
                    sx={{ 
                      objectFit: 'contain', 
                      p: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }}
                    onError={(e) => {
                      // Use a data URI for a default item image to prevent blinking
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <RarityChip label={item.rarity} rarity={item.rarity} size="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#eaf6ff', mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: '#FFD700' }} />
                      {item.price} G
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#5FD1F9', mr: 1 }}
                        onClick={() => handleItemDetails(item)}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#5FD1F9' }}
                        onClick={() => handleAddToCart(item)}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                  <ItemOverlay className="item-overlay">
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <StyledButton 
                        variant="contained" 
                        startIcon={<InfoOutlinedIcon />}
                        onClick={() => handleItemDetails(item)}
                      >
                        Details
                      </StyledButton>
                      <StyledButton 
                        variant="contained" 
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </StyledButton>
                    </Box>
                  </ItemOverlay>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoItemsMessage>
            {searchQuery ? 
              `No items found matching "${searchQuery}"` : 
              categoryTab > 0 ? 
                `No ${categories[categoryTab].toLowerCase()} items available` : 
                'No items available'
            }
          </NoItemsMessage>
        )}
      </ItemsContainer>
      
      {/* Render Cart Drawer */}
      {renderCartDrawer()}
      
      {/* Render Item Details Dialog */}
      {renderItemDetailsDialog()}
      
      {/* Sell Item Dialog */}
      <Dialog
        open={sellDialogOpen}
        onClose={handleCloseSellDialog}
        PaperProps={{
          sx: {
            background: 'rgba(10, 25, 41, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(95, 209, 249, 0.3)',
            boxShadow: '0 0 25px rgba(95, 209, 249, 0.3)',
            maxWidth: '600px',
            width: '100%',
          }
        }}
      >
        <DialogTitle sx={{ color: '#5FD1F9', borderBottom: '1px solid rgba(95, 209, 249, 0.3)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Sell an Item
            </Typography>
            <IconButton onClick={handleCloseSellDialog} sx={{ color: '#eaf6ff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Item Name"
              value={sellItemName}
              onChange={(e) => setSellItemName(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{ sx: { color: '#5FD1F9' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5FD1F9',
                  },
                  color: '#eaf6ff',
                },
              }}
            />
            
            <TextField
              label="Description"
              value={sellItemDescription}
              onChange={(e) => setSellItemDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              InputLabelProps={{ sx: { color: '#5FD1F9' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5FD1F9',
                  },
                  color: '#eaf6ff',
                },
              }}
            />
            
            <TextField
              label="Price (Gold)"
              type="number"
              value={sellItemPrice}
              onChange={(e) => setSellItemPrice(Number(e.target.value))}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ color: '#FFD700' }}>G</InputAdornment>,
              }}
              InputLabelProps={{ sx: { color: '#5FD1F9' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(95, 209, 249, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5FD1F9',
                  },
                  color: '#eaf6ff',
                },
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#5FD1F9', mb: 1 }}>
                  Category
                </Typography>
                <TextField
                  select
                  value={sellItemCategory}
                  onChange={(e) => setSellItemCategory(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(95, 209, 249, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(95, 209, 249, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#5FD1F9',
                      },
                      color: '#eaf6ff',
                    },
                  }}
                >
                  {categories.slice(1).map((category, index) => (
                    <MenuItem key={index} value={category.toLowerCase()}>{category}</MenuItem>
                  ))}
                </TextField>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#5FD1F9', mb: 1 }}>
                  Rarity
                </Typography>
                <TextField
                  select
                  value={sellItemRarity}
                  onChange={(e) => setSellItemRarity(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(95, 209, 249, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(95, 209, 249, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#5FD1F9',
                      },
                      color: '#eaf6ff',
                    },
                  }}
                >
                  {rarityOptions.map((rarity) => (
                    <MenuItem key={rarity} value={rarity}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RarityChip label={rarity} rarity={rarity} size="small" sx={{ mr: 1 }} />
                        <Typography>
                          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <StyledButton onClick={handleCloseSellDialog}>
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={handleSellItem}
            disabled={!sellItemName || !sellItemDescription || sellItemPrice <= 0}
            sx={{ 
              background: 'rgba(95, 209, 249, 0.2)',
              '&:hover': {
                background: 'rgba(95, 209, 249, 0.3)',
              },
              '&.Mui-disabled': {
                background: 'rgba(95, 209, 249, 0.05)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            List for Sale
          </StyledButton>
        </DialogActions>
      </Dialog>
      
      {/* Purchase Confirmation Dialog */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={handleClosePurchaseDialog}
        PaperProps={{
          sx: {
            background: 'rgba(10, 25, 41, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(95, 209, 249, 0.3)',
            boxShadow: '0 0 25px rgba(95, 209, 249, 0.3)',
            maxWidth: '500px',
            width: '100%',
          }
        }}
      >
        {!purchaseSuccess ? (
          <>
            <DialogTitle sx={{ color: '#5FD1F9', borderBottom: '1px solid rgba(95, 209, 249, 0.3)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Confirm Purchase
                </Typography>
                <IconButton onClick={handleClosePurchaseDialog} sx={{ color: '#eaf6ff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {selectedItem && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ color: '#eaf6ff', textAlign: 'center' }}>
                    Are you sure you want to purchase:
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    border: '1px solid rgba(95, 209, 249, 0.3)',
                    borderRadius: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                    width: '100%'
                  }}>
                    <CardMedia
                      component="img"
                      image={selectedItem.image || `/images/items/${selectedItem.id || 'default'}.png`}
                      alt={selectedItem.name}
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        objectFit: 'contain',
                        borderRadius: 1,
                        background: 'rgba(0, 0, 0, 0.3)',
                        backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                        backgroundSize: '20px 20px'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMTFBMkYiLz48cGF0aCBkPSJNODUgNTVIMTE1VjE0NUg4NVY1NVoiIGZpbGw9IiM1RkQxRjkiLz48cGF0aCBkPSJNNTUgODVIMTQ1VjExNUg1NVY4NVoiIGZpbGw9IiM1RkQxRjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IiM1RkQxRjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#5FD1F9' }}>
                        {selectedItem.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7 }}>
                          {selectedItem.category || 'Miscellaneous'}
                        </Typography>
                        <RarityChip label={selectedItem.rarity} rarity={selectedItem.rarity} size="small" />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    p: 2, 
                    border: '1px solid rgba(95, 209, 249, 0.3)',
                    borderRadius: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                  }}>
                    <Typography variant="body1" sx={{ color: '#eaf6ff' }}>
                      Price:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {selectedItem.price} G
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7, textAlign: 'center', mt: 1 }}>
                    This item will be added to your inventory immediately after purchase.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <StyledButton onClick={handleClosePurchaseDialog}>
                Cancel
              </StyledButton>
              <StyledButton 
                onClick={handlePurchaseConfirm}
                sx={{ 
                  background: 'rgba(95, 209, 249, 0.2)',
                  '&:hover': {
                    background: 'rgba(95, 209, 249, 0.3)',
                  }
                }}
              >
                Confirm Purchase
              </StyledButton>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ color: '#5FD1F9', borderBottom: '1px solid rgba(95, 209, 249, 0.3)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Purchase Complete
                </Typography>
                <IconButton onClick={handleClosePurchaseDialog} sx={{ color: '#eaf6ff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: 'rgba(76, 175, 80, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid rgba(76, 175, 80, 0.5)',
                  mb: 2
                }}>
                  <Typography variant="h3" sx={{ color: '#4caf50' }}>✓</Typography>
                </Box>
                
                <Typography variant="h6" sx={{ color: '#5FD1F9', textAlign: 'center' }}>
                  Purchase Successful!
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#eaf6ff', textAlign: 'center' }}>
                  You have successfully purchased {selectedItem?.name}.
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#eaf6ff', opacity: 0.7, textAlign: 'center' }}>
                  The item has been added to your inventory.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <StyledButton 
                onClick={handleClosePurchaseDialog}
                sx={{ 
                  background: 'rgba(95, 209, 249, 0.2)',
                  '&:hover': {
                    background: 'rgba(95, 209, 249, 0.3)',
                  }
                }}
                fullWidth
              >
                Continue Shopping
              </StyledButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MarketplaceContainer>
  );
};

export default Marketplace;
