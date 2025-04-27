import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  AppBar,
  Drawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dashboard as DashboardIcon,
  Assignment as QuestIcon,
  Inventory as InventoryIcon,
  People as ShadowsIcon,
  Store as MarketplaceIcon,
  Person as ProfileIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  AutoFixHigh as SkillsIcon,
  EmojiEvents as TitlesIcon,
  VideoLibrary as VerificationIcon
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';
import { clearAllNotifications } from '../redux/slices/notificationSlice';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Quests', icon: <QuestIcon />, path: '/quests' },
  { label: 'Active Quests', icon: <QuestIcon color="primary" />, path: '/active-quests' },
  { label: 'Custom Quests', icon: <QuestIcon color="secondary" />, path: '/custom-quests' },
  { label: 'Shadow Army', icon: <ShadowsIcon />, path: '/shadows' },
  { label: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { label: 'Marketplace', icon: <MarketplaceIcon />, path: '/marketplace' },
  { label: 'Skills', icon: <SkillsIcon />, path: '/skills' },
  { label: 'Titles', icon: <TitlesIcon />, path: '/titles' },
  { label: 'Verification', icon: <VerificationIcon />, path: '/verification' },
  { label: 'Profile', icon: <ProfileIcon />, path: '/profile' },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notifications } = useSelector(state => state.notifications);
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const currentNavIndex = navItems.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Box sx={{ minHeight: '100vh', background: 'inherit' }}>
      {/* Top AppBar */}
      <AppBar position="static" sx={{ background: 'rgba(20,40,60,0.95)', boxShadow: '0 0 12px #00eaff88' }}>
        <Toolbar>
          {isDesktop ? (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setRightDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Orbitron', letterSpacing: 2, color: '#00eaff' }}>
            SOLO LEVELING SYSTEM
          </Typography>
          {isDesktop && (
            <>
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                <Avatar alt={user?.username} src={user?.profilePicture} sx={{ border: '2px solid #4eafe9' }} />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>
      {/* Drawer for desktop navigation */}
      {isDesktop && (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{
            width: 280,
            background: 'rgba(40,60,85,0.82)',
            height: '100%',
            color: '#f7fbff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 32px #00eaff44',
            borderRight: '1.5px solid #00eaff33',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon sx={{ color: '#00eaff' }} />
              </IconButton>
              <img src={require('../logo.svg').default} alt="Solo Leveling Logo" style={{ height: 48, filter: 'drop-shadow(0 0 8px #00eaff)' }} />
              <Box sx={{ width: 40 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', px: 2, py: 2, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Box key={item.label} sx={{
                  display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', width: '100%', borderRadius: 1, px: 1, py: 1,
                  '&:hover': { background: 'rgba(0,234,255,0.18)' },
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  color: location.pathname === item.path ? '#00eaff' : '#f7fbff',
                  fontSize: 19, letterSpacing: 1.2, textShadow: '0 1px 8px #001a2e',
                }}
                  onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
                  {item.icon} <span style={{ marginLeft: 14 }}>{item.label}</span>
                </Box>
              ))}
              <Divider sx={{ my: 2, width: '100%', background: '#00eaff33' }} />
              <Box sx={{
                display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%', borderRadius: 1, px: 1, py: 1,
                '&:hover': { background: 'rgba(255,82,82,0.13)' },
                color: '#ff5252', fontWeight: 'bold', fontSize: 19, letterSpacing: 1.2, textShadow: '0 1px 8px #001a2e',
              }}
                onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </Box>
            </Box>
          </Box>
        </Drawer>
      )}
      {/* Drawer for mobile navigation */}
      {!isDesktop && (
        <Drawer anchor="left" open={rightDrawerOpen} onClose={() => setRightDrawerOpen(false)}>
          <Box sx={{
            width: 260,
            background: 'rgba(40,60,85,0.82)',
            height: '100%',
            color: '#f7fbff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 32px #00eaff44',
            borderRight: '1.5px solid #00eaff33',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
              <IconButton onClick={() => setRightDrawerOpen(false)}>
                <CloseIcon sx={{ color: '#00eaff' }} />
              </IconButton>
              <img src={require('../logo.svg').default} alt="Solo Leveling Logo" style={{ height: 40, filter: 'drop-shadow(0 0 8px #00eaff)' }} />
              <Box sx={{ width: 40 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', px: 2, py: 2, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Box key={item.label} sx={{
                  display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', width: '100%', borderRadius: 1, px: 1, py: 1,
                  '&:hover': { background: 'rgba(0,234,255,0.18)' },
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  color: location.pathname === item.path ? '#00eaff' : '#f7fbff',
                  fontSize: 19, letterSpacing: 1.2, textShadow: '0 1px 8px #001a2e',
                }}
                  onClick={() => { navigate(item.path); setRightDrawerOpen(false); }}>
                  {item.icon} <span style={{ marginLeft: 14 }}>{item.label}</span>
                </Box>
              ))}
              <Divider sx={{ my: 2, width: '100%', background: '#00eaff33' }} />
              <Box sx={{
                display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%', borderRadius: 1, px: 1, py: 1,
                '&:hover': { background: 'rgba(255,82,82,0.13)' },
                color: '#ff5252', fontWeight: 'bold', fontSize: 19, letterSpacing: 1.2, textShadow: '0 1px 8px #001a2e',
              }}
                onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </Box>
            </Box>
          </Box>
        </Drawer>
      )}
      {/* Main Content */}
      <Box sx={{ pt: isDesktop ? 3 : 1, pb: isDesktop ? 3 : 7, maxWidth: isDesktop ? 900 : '100vw', mx: 'auto', minHeight: '80vh' }}>
        {children}
      </Box>
      {/* Bottom Navigation for mobile */}
      {!isDesktop && (
        <BottomNavigation
          showLabels
          value={currentNavIndex}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100vw',
            background: 'rgba(20,40,60,0.95)',
            boxShadow: '0 0 12px #00eaff88',
            zIndex: 1201,
          }}
          onChange={(_, newValue) => {
            navigate(navItems[newValue].path);
          }}
        >
          {navItems.slice(0, 6).map((item, i) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}
      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ProfileIcon fontSize="small" /> Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" /> Logout
        </MenuItem>
      </Menu>
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={isNotificationMenuOpen}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 320,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
          Notifications
        </Typography>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem key={notification.id} onClick={handleNotificationMenuClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {notifications.length > 5 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="primary">
              {notifications.length - 5} more notifications
            </Typography>
          </Box>
        )}
        {notifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                dispatch(clearAllNotifications());
                handleNotificationMenuClose();
              }}
            >
              Clear all notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default Layout;
