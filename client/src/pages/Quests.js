import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  getQuests, 
  getActiveQuests, 
  getCompletedQuests,
  getDailyQuests,
  getEmergencyQuests,
  getPunishmentQuests
} from '../redux/slices/questSlice';
import DailyQuestList from '../components/quests/DailyQuestList';
import EmergencyQuestList from '../components/quests/EmergencyQuestList';
import PunishmentQuestList from '../components/quests/PunishmentQuestList';
import ActiveQuestList from '../components/quests/ActiveQuestList';
import CompletedQuestList from '../components/quests/CompletedQuestList';
import CreateCustomQuest from '../components/quests/CreateCustomQuest';

// Styled components
const QuestContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const QuestHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(28,28,28,0.7) 100%)',
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(5px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  color: theme.palette.common.white,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  minWidth: 100,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quest-tabpanel-${index}`}
      aria-labelledby={`quest-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Quests = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  const { 
    quests, 
    activeQuests, 
    completedQuests,
    dailyQuests,
    emergencyQuests,
    punishmentQuests,
    isLoading, 
    error 
  } = useSelector((state) => state.quests);

  useEffect(() => {
    // Load all quest data when component mounts
    const loadQuestData = async () => {
      try {
        await dispatch(getQuests()).unwrap();
        await dispatch(getActiveQuests()).unwrap();
        await dispatch(getCompletedQuests()).unwrap();
        await dispatch(getDailyQuests()).unwrap();
        await dispatch(getEmergencyQuests()).unwrap();
        await dispatch(getPunishmentQuests()).unwrap();
      } catch (error) {
        setNotification({
          open: true,
          message: `Error loading quests: ${error.message}`,
          severity: 'error'
        });
      }
    };

    loadQuestData();
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <QuestContainer maxWidth="lg">
      <QuestHeader>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Quest Board
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ maxWidth: 600 }}>
          Complete quests to earn experience, currency, and stat points. The more challenging the quest, the greater the rewards.
        </Typography>
      </QuestHeader>

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          color: 'white'
        }}
      >
        <StyledTabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          centered
        >
          <StyledTab label="Daily Quests" />
          <StyledTab label="Emergency Quests" />
          <StyledTab label="Punishment Quests" />
          <StyledTab label="Active Quests" />
          <StyledTab label="Completed Quests" />
          <StyledTab label="Create Custom Quest" />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          <DailyQuestList quests={dailyQuests} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <EmergencyQuestList quests={emergencyQuests} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PunishmentQuestList quests={punishmentQuests} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ActiveQuestList quests={activeQuests} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <CompletedQuestList quests={completedQuests} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <CreateCustomQuest />
        </TabPanel>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </QuestContainer>
  );
};

export default Quests;
