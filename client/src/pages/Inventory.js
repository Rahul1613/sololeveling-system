import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid, Avatar, useMediaQuery } from '@mui/material';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import { getInventory, equipItem, unequipItem, consumeItem, discardItem } from '../redux/slices/inventorySlice';
import { sellItem } from '../redux/slices/marketplaceSlice';
import { addNotification } from '../redux/slices/notificationSlice';

const Inventory = () => {
  const dispatch = useDispatch();
  const { inventory, items, isLoading, isError, message } = useSelector((state) => state.inventory);
  const isDesktop = useMediaQuery('(min-width:900px)');

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
    <Box sx={{ mt: isDesktop ? 4 : 2, mb: isDesktop ? 4 : 2 }}>
      <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 26 : 22, mb: 2, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
          INVENTORY
        </Typography>
        <Grid container spacing={isDesktop ? 3 : 2}>
          {isLoading && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              Loading...
            </Typography>
          )}
          {isError && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              {message}
            </Typography>
          )}
          {items.length === 0 && !isLoading && !isError && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              No items in your inventory.
            </Typography>
          )}
          {items.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <SystemPanel style={{ p: isDesktop ? 3 : 2, minHeight: 120 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar src={item.icon} sx={{ width: isDesktop ? 64 : 48, height: isDesktop ? 64 : 48, mb: 1, boxShadow: '0 0 8px #00eaff99' }} />
                  <Typography sx={{ color: '#eaf6ff', fontWeight: 700, fontSize: isDesktop ? 18 : 15 }}>{item.name}</Typography>
                  <Typography sx={{ color: '#4eafe9', fontSize: isDesktop ? 15 : 13 }}>{item.description}</Typography>
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleUse(item._id)}>Use</SystemButton>
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleEquip(item._id)}>Equip</SystemButton>
                  {inventory?.equipped && Object.values(inventory.equipped).some(e => e.item && e.item._id === item._id) && (
                    <SystemButton sx={{ mt: 1 }} onClick={() => handleUnequip(item._id)}>Unequip</SystemButton>
                  )}
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleDiscard(item._id)}>Discard</SystemButton>
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleSell(item._id)}>Sell</SystemButton>
                </Box>
              </SystemPanel>
            </Grid>
          ))}
        </Grid>
      </SystemPanel>
      <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 26 : 22, mb: 2, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
          EQUIPPED ITEMS
        </Typography>
        <Grid container spacing={isDesktop ? 3 : 2}>
          {Object.values(inventory?.equipped || {}).map(equippedItem => (
            <Grid item xs={12} sm={6} md={4} key={equippedItem.item._id}>
              <SystemPanel style={{ p: isDesktop ? 3 : 2, minHeight: 120 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar src={equippedItem.item.icon} sx={{ width: isDesktop ? 64 : 48, height: isDesktop ? 64 : 48, mb: 1, boxShadow: '0 0 8px #00eaff99' }} />
                  <Typography sx={{ color: '#eaf6ff', fontWeight: 700, fontSize: isDesktop ? 18 : 15 }}>{equippedItem.item.name}</Typography>
                  <Typography sx={{ color: '#4eafe9', fontSize: isDesktop ? 15 : 13 }}>{equippedItem.item.description}</Typography>
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleUnequip(equippedItem.item._id)}>Unequip</SystemButton>
                </Box>
              </SystemPanel>
            </Grid>
          ))}
        </Grid>
      </SystemPanel>
    </Box>
  );
};

export default Inventory;
