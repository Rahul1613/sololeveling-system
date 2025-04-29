import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid, Avatar, useMediaQuery, Tabs, Tab, Divider, Tooltip, Badge, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import { getInventory, equipItem, unequipItem, consumeItem, discardItem } from '../redux/slices/inventorySlice';
import { sellItem } from '../redux/slices/marketplaceSlice';
import { addNotification } from '../redux/slices/notificationSlice';
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faSortAmountDown, faInfoCircle, faTrash, faDollarSign, faHandHolding, faShieldAlt, faFlask, faGem, faChevronRight, faChevronLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Styled components for inventory
const InventoryContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(10, 12, 18, 0.9)',
  borderRadius: '8px',
  padding: theme.spacing(3),
  boxShadow: '0 0 20px rgba(0, 234, 255, 0.15)',
  border: '1px solid rgba(0, 234, 255, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, rgba(0,234,255,0) 0%, rgba(0,234,255,0.8) 50%, rgba(0,234,255,0) 100%)',
    boxShadow: '0 0 10px rgba(0, 234, 255, 0.5)',
  }
}));

const ItemCard = styled(Paper)(({ theme, rarity = 'common' }) => {
  const rarityColors = {
    common: '#b8c5d6',
    uncommon: '#4eca5f',
    rare: '#4e9dff',
    epic: '#a64eff',
    legendary: '#ffaa00',
    mythic: '#ff5e5e'
  };
  
  return {
    background: 'rgba(15, 20, 30, 0.85)',
    border: `1px solid ${rarityColors[rarity] || rarityColors.common}`,
    borderRadius: '6px',
    padding: theme.spacing(2),
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 0 8px ${rarityColors[rarity]}40`,
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 0 15px ${rarityColors[rarity]}70`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(135deg, ${rarityColors[rarity]}20 0%, transparent 50%, ${rarityColors[rarity]}10 100%)`,
      pointerEvents: 'none'
    }
  };
});

const CategoryTab = styled(Tab)(({ theme }) => ({
  color: '#b8eaff',
  fontFamily: 'Orbitron',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '1px',
  minWidth: '120px',
  '&.Mui-selected': {
    color: '#00eaff',
    fontWeight: 700,
  }
}));

const ItemAvatar = styled(Avatar)(({ theme, rarity = 'common' }) => {
  const rarityColors = {
    common: '#b8c5d6',
    uncommon: '#4eca5f',
    rare: '#4e9dff',
    epic: '#a64eff',
    legendary: '#ffaa00',
    mythic: '#ff5e5e'
  };
  
  return {
    width: 64,
    height: 64,
    margin: '0 auto 12px',
    border: `2px solid ${rarityColors[rarity]}`,
    boxShadow: `0 0 10px ${rarityColors[rarity]}80`,
    background: `radial-gradient(circle, rgba(30,40,60,1) 0%, rgba(15,20,30,1) 100%)`
  };
});

const ItemName = styled(Typography)(({ theme, rarity = 'common' }) => {
  const rarityColors = {
    common: '#b8c5d6',
    uncommon: '#4eca5f',
    rare: '#4e9dff',
    epic: '#a64eff',
    legendary: '#ffaa00',
    mythic: '#ff5e5e'
  };
  
  return {
    color: rarityColors[rarity],
    fontWeight: 700,
    fontSize: '16px',
    textAlign: 'center',
    textShadow: `0 0 5px ${rarityColors[rarity]}50`,
    marginBottom: '4px',
  };
});

const ActionButton = styled(IconButton)(({ theme, color = '#4e9dff' }) => ({
  margin: '4px',
  color: color,
  background: 'rgba(10, 15, 25, 0.6)',
  border: `1px solid ${color}40`,
  '&:hover': {
    background: `${color}20`,
  },
  width: '32px',
  height: '32px',
}));

const Inventory = () => {
  const dispatch = useDispatch();
  const { inventory, items, isLoading, isError, message } = useSelector((state) => state.inventory);
  const isDesktop = useMediaQuery('(min-width:900px)');
  
  // New state for enhanced UI
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('rarity');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmItemId, setConfirmItemId] = useState(null);
  
  useEffect(() => {
    dispatch(getInventory());
  }, [dispatch]);

  const handleEquip = (itemId) => {
    dispatch(equipItem(itemId));
  };
  const handleUnequip = (itemId) => {
    dispatch(unequipItem(itemId));
  };
  const handleUse = (itemId) => {
    dispatch(consumeItem(itemId));
  };

  const handleDiscard = (itemId) => {
    dispatch(discardItem(itemId));
  };

  // Handle selling an item
  const handleSell = async (itemId, quantity = 1) => {
    try {
      await dispatch(sellItem({ itemId, quantity })).unwrap();
      dispatch(getInventory());
      dispatch(addNotification({
        type: 'success',
        title: 'Item Sold',
        message: 'Item sold to the marketplace.',
        style: 'success',
        soundEffect: 'item_sold.mp3'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Sell Failed',
        message: error.message || 'Failed to sell item.',
        style: 'error',
        soundEffect: 'error.mp3'
      }));
    }
  };

  return (
    <InventoryContainer sx={{ mt: isDesktop ? 4 : 2, mb: isDesktop ? 4 : 2 }}>
      <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 28 : 24, mb: 3, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc', textAlign: 'center' }}>
        INVENTORY SYSTEM
      </Typography>
      
      {/* Category Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ 
          mb: 3, 
          '& .MuiTabs-indicator': { 
            backgroundColor: '#00eaff',
            boxShadow: '0 0 8px #00eaff',
            height: 3
          },
          borderBottom: '1px solid rgba(0, 234, 255, 0.2)'
        }}
        centered
      >
        <CategoryTab label="ALL ITEMS" />
        <CategoryTab label="EQUIPMENT" />
        <CategoryTab label="CONSUMABLES" />
        <CategoryTab label="MATERIALS" />
        <CategoryTab label="QUEST ITEMS" />
      </Tabs>
      
      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: 500 }}>
          <TextField
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <FontAwesomeIcon icon={faSearch} style={{ marginRight: 8, color: '#4e9dff' }} />,
              sx: {
                color: '#b8eaff',
                backgroundColor: 'rgba(15, 25, 40, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00eaff'
                }
              }
            }}
            size="small"
            fullWidth
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="rarity-filter-label" sx={{ color: '#b8eaff' }}>Rarity</InputLabel>
            <Select
              labelId="rarity-filter-label"
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              label="Rarity"
              sx={{
                color: '#b8eaff',
                backgroundColor: 'rgba(15, 25, 40, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00eaff'
                }
              }}
            >
              <MenuItem value="all">All Rarities</MenuItem>
              <MenuItem value="common">Common</MenuItem>
              <MenuItem value="uncommon">Uncommon</MenuItem>
              <MenuItem value="rare">Rare</MenuItem>
              <MenuItem value="epic">Epic</MenuItem>
              <MenuItem value="legendary">Legendary</MenuItem>
              <MenuItem value="mythic">Mythic</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-by-label" sx={{ color: '#b8eaff' }}>Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              sx={{
                color: '#b8eaff',
                backgroundColor: 'rgba(15, 25, 40, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 234, 255, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00eaff'
                }
              }}
            >
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="rarity">Rarity (Highest)</MenuItem>
              <MenuItem value="rarity-asc">Rarity (Lowest)</MenuItem>
              <MenuItem value="level">Level (Highest)</MenuItem>
              <MenuItem value="level-asc">Level (Lowest)</MenuItem>
              <MenuItem value="recent">Recently Acquired</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Items Grid */}
      <Box sx={{ mb: 4 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography sx={{ color: '#b8eaff', fontSize: 18, mr: 2 }}>Loading inventory...</Typography>
          </Box>
        )}
        
        {isError && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column' }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ff5e5e', fontSize: 32, marginBottom: 16 }} />
            <Typography sx={{ color: '#ff5e5e', fontSize: 18, mb: 1 }}>Error Loading Inventory</Typography>
            <Typography sx={{ color: '#b8eaff' }}>{message}</Typography>
          </Box>
        )}
        
        {!isLoading && !isError && items.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column', border: '2px dashed rgba(0, 234, 255, 0.3)', borderRadius: 2, p: 3 }}>
            <Typography sx={{ color: '#b8eaff', fontSize: 18, mb: 2 }}>Your inventory is empty</Typography>
            <Typography sx={{ color: '#4e9dff', textAlign: 'center' }}>Complete quests and defeat monsters to collect items that will appear here.</Typography>
          </Box>
        )}
        
        {!isLoading && !isError && items.length > 0 && (
          <Grid container spacing={3}>
            {items.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <ItemCard rarity={item.rarity || 'common'}>
                  <Box sx={{ position: 'relative' }}>
                    {/* Item Quantity Badge */}
                    {item.quantity > 1 && (
                      <Badge 
                        badgeContent={item.quantity} 
                        color="primary"
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0,
                          '& .MuiBadge-badge': {
                            backgroundColor: '#00eaff',
                            color: '#0a1018',
                            fontWeight: 'bold',
                            boxShadow: '0 0 5px rgba(0, 234, 255, 0.7)'
                          }
                        }}
                      />
                    )}
                    
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <ItemAvatar src={item.icon} rarity={item.rarity || 'common'} />
                      <ItemName rarity={item.rarity || 'common'}>{item.name}</ItemName>
                      
                      {/* Item Type & Level */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                        <Typography sx={{ color: '#4e9dff', fontSize: 12 }}>{item.type || 'Item'}</Typography>
                        {item.level && <Typography sx={{ color: '#4eafe9', fontSize: 12 }}>Level {item.level}</Typography>}
                      </Box>
                      
                      <Typography sx={{ color: '#b8eaff', fontSize: 13, mb: 2, textAlign: 'center', height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </Typography>
                      
                      {/* Item Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Tooltip title="View Details">
                          <ActionButton color="#00eaff" onClick={() => {
                            setSelectedItem(item);
                            setShowItemDetails(true);
                          }}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                          </ActionButton>
                        </Tooltip>
                        
                        {item.type === 'consumable' && (
                          <Tooltip title="Use Item">
                            <ActionButton color="#4eca5f" onClick={() => handleUse(item._id)}>
                              <FontAwesomeIcon icon={faFlask} />
                            </ActionButton>
                          </Tooltip>
                        )}
                        
                        {(item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && (
                          <Tooltip title="Equip Item">
                            <ActionButton color="#4e9dff" onClick={() => handleEquip(item._id)}>
                              <FontAwesomeIcon icon={faShieldAlt} />
                            </ActionButton>
                          </Tooltip>
                        )}
                        
                        {inventory?.equipped && Object.values(inventory.equipped).some(e => e.item && e.item._id === item._id) && (
                          <Tooltip title="Unequip Item">
                            <ActionButton color="#ff5e5e" onClick={() => handleUnequip(item._id)}>
                              <FontAwesomeIcon icon={faHandHolding} />
                            </ActionButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Sell Item">
                          <ActionButton color="#ffaa00" onClick={() => {
                            setConfirmAction('sell');
                            setConfirmItemId(item._id);
                            setShowConfirmDialog(true);
                          }}>
                            <FontAwesomeIcon icon={faDollarSign} />
                          </ActionButton>
                        </Tooltip>
                        
                        <Tooltip title="Discard Item">
                          <ActionButton color="#ff5e5e" onClick={() => {
                            setConfirmAction('discard');
                            setConfirmItemId(item._id);
                            setShowConfirmDialog(true);
                          }}>
                            <FontAwesomeIcon icon={faTrash} />
                          </ActionButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Pagination Controls */}
      {!isLoading && !isError && items.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
          <IconButton 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            sx={{ color: currentPage === 1 ? 'rgba(184, 234, 255, 0.3)' : '#b8eaff' }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </IconButton>
          
          <Typography sx={{ color: '#b8eaff', fontFamily: 'Orbitron' }}>
            Page {currentPage} of {Math.ceil(items.length / itemsPerPage)}
          </Typography>
          
          <IconButton 
            disabled={currentPage >= Math.ceil(items.length / itemsPerPage)}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(items.length / itemsPerPage)))}
            sx={{ color: currentPage >= Math.ceil(items.length / itemsPerPage) ? 'rgba(184, 234, 255, 0.3)' : '#b8eaff' }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </IconButton>
        </Box>
      )}
      
      {/* Item Details Dialog */}
      <Dialog 
        open={showItemDetails} 
        onClose={() => setShowItemDetails(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 15, 25, 0.95)',
            border: '1px solid rgba(0, 234, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 234, 255, 0.2)',
            borderRadius: 2,
            maxWidth: 500
          }
        }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ 
              color: '#00eaff', 
              fontFamily: 'Orbitron', 
              borderBottom: '1px solid rgba(0, 234, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <ItemAvatar src={selectedItem.icon} rarity={selectedItem.rarity || 'common'} sx={{ width: 40, height: 40, margin: 0 }} />
              {selectedItem.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: '#4e9dff', fontWeight: 'bold', mb: 1 }}>Type: {selectedItem.type || 'Item'}</Typography>
                {selectedItem.level && <Typography sx={{ color: '#4e9dff', mb: 1 }}>Level: {selectedItem.level}</Typography>}
                <Typography sx={{ color: '#b8eaff', mb: 2 }}>{selectedItem.description}</Typography>
                
                {/* Item Stats */}
                {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#00eaff', fontWeight: 'bold', mb: 1 }}>Stats:</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(selectedItem.stats).map(([stat, value]) => (
                        <Grid item xs={6} key={stat}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#b8eaff' }}>{stat}:</Typography>
                            <Typography sx={{ color: value > 0 ? '#4eca5f' : '#ff5e5e' }}>{value > 0 ? `+${value}` : value}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {/* Item Effects */}
                {selectedItem.effects && selectedItem.effects.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#00eaff', fontWeight: 'bold', mb: 1 }}>Effects:</Typography>
                    {selectedItem.effects.map((effect, index) => (
                      <Typography key={index} sx={{ color: '#b8eaff', fontSize: 14, mb: 0.5 }}>
                        • {effect}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {/* Item Value */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(0, 234, 255, 0.2)' }}>
                  <Typography sx={{ color: '#ffaa00' }}>Value: {selectedItem.value || 0} coins</Typography>
                  <Typography sx={{ color: '#4e9dff' }}>Weight: {selectedItem.weight || 1} units</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(0, 234, 255, 0.2)', p: 2 }}>
              <SystemButton onClick={() => setShowItemDetails(false)}>Close</SystemButton>
              {(selectedItem.type === 'weapon' || selectedItem.type === 'armor' || selectedItem.type === 'accessory') && (
                <SystemButton onClick={() => {
                  handleEquip(selectedItem._id);
                  setShowItemDetails(false);
                }}>Equip</SystemButton>
              )}
              {selectedItem.type === 'consumable' && (
                <SystemButton onClick={() => {
                  handleUse(selectedItem._id);
                  setShowItemDetails(false);
                }}>Use</SystemButton>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Confirm Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 15, 25, 0.95)',
            border: '1px solid rgba(0, 234, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 234, 255, 0.2)',
            borderRadius: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ color: '#00eaff', fontFamily: 'Orbitron' }}>
          Confirm {confirmAction === 'sell' ? 'Sell' : 'Discard'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#b8eaff', mt: 1 }}>
            Are you sure you want to {confirmAction === 'sell' ? 'sell' : 'discard'} this item?
            {confirmAction === 'sell' && ' You will receive coins based on its value.'}
            {confirmAction === 'discard' && ' This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <SystemButton onClick={() => setShowConfirmDialog(false)}>Cancel</SystemButton>
          <SystemButton 
            onClick={() => {
              if (confirmAction === 'sell') {
                handleSell(confirmItemId);
              } else if (confirmAction === 'discard') {
                handleDiscard(confirmItemId);
              }
              setShowConfirmDialog(false);
            }}
          >
            Confirm
          </SystemButton>
        </DialogActions>
      </Dialog>
    </InventoryContainer>
  );
};

export default Inventory;
