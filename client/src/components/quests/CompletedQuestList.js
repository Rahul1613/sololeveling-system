import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Styled components
const CompletedQuestCard = styled(Card)(({ theme, questType }) => {
  const typeColors = {
    'daily': 'rgba(76, 175, 80, 0.3)',
    'emergency': 'rgba(244, 67, 54, 0.3)',
    'punishment': 'rgba(156, 39, 176, 0.3)',
    'custom': 'rgba(33, 150, 243, 0.3)'
  };
  
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${typeColors[questType] || 'rgba(255, 255, 255, 0.1)'}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    opacity: 0.85,
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
      opacity: 1
    }
  };
});

const QuestTitle = styled(Typography)(({ theme, questType }) => {
  const typeColors = {
    'daily': '#4CAF50',
    'emergency': '#F44336',
    'punishment': '#9C27B0',
    'custom': '#2196F3'
  };
  
  return {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    color: typeColors[questType] || theme.palette.primary.main
  };
});

const QuestDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary
}));

const RewardChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold'
}));

const CompletionBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(76, 175, 80, 0.9)',
  color: 'white',
  borderRadius: '50%',
  width: 30,
  height: 30,
  zIndex: 1
}));

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: 'rgba(30, 30, 30, 0.7)',
  color: theme.palette.common.white,
  fontSize: 14,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  '&:hover': {
    backgroundColor: 'rgba(70, 70, 70, 0.7) !important',
  },
  '& td, & th': {
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
}));

const CompletedQuestList = ({ quests = [] }) => {
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Handle card expansion
  const handleExpandClick = (questId) => {
    setExpanded(prev => ({ ...prev, [questId]: !prev[questId] }));
  };

  // Format quest type for display
  const formatQuestType = (type) => {
    if (!type) return 'Unknown';
    
    const typeColors = {
      'daily': '#4CAF50',
      'emergency': '#F44336',
      'punishment': '#9C27B0',
      'custom': '#2196F3'
    };
    
    const typeText = type.charAt(0).toUpperCase() + type.slice(1);
    
    return (
      <Chip 
        label={typeText} 
        size="small" 
        sx={{ 
          backgroundColor: typeColors[type] || '#757575',
          color: 'white',
          fontWeight: 'bold'
        }} 
      />
    );
  };

  // Format difficulty for display
  const formatDifficulty = (difficulty) => {
    if (!difficulty) return 'Unknown';
    
    const difficultyColors = {
      'easy': '#4CAF50',
      'medium': '#FF9800',
      'hard': '#F44336',
      'very-hard': '#9C27B0'
    };
    
    const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    return (
      <Chip 
        label={difficultyText} 
        size="small" 
        sx={{ 
          backgroundColor: difficultyColors[difficulty] || '#757575',
          color: 'white',
          fontWeight: 'bold'
        }} 
      />
    );
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'table' : 'grid');
  };

  // Calculate total rewards
  const calculateTotalRewards = () => {
    if (!quests || quests.length === 0) return { xp: 0, currency: 0, statPoints: 0 };
    
    return quests.reduce((total, quest) => {
      return {
        xp: total.xp + (quest.rewards?.experience || 0),
        currency: total.currency + (quest.rewards?.currency || 0),
        statPoints: total.statPoints + (quest.rewards?.statPoints || 0)
      };
    }, { xp: 0, currency: 0, statPoints: 0 });
  };

  const totalRewards = calculateTotalRewards();

  // Render grid view
  const renderGridView = () => (
    <Grid container spacing={3}>
      {quests.map((quest) => (
        <Grid item xs={12} sm={6} md={4} key={quest._id}>
          <Box sx={{ position: 'relative' }}>
            <CompletionBadge>
              <CheckCircleIcon fontSize="small" />
            </CompletionBadge>
            <CompletedQuestCard questType={quest.type}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <QuestTitle variant="h6" questType={quest.type}>
                    {quest.title}
                  </QuestTitle>
                  {formatQuestType(quest.type)}
                </Box>
                
                <QuestDescription variant="body2">
                  {quest.description}
                </QuestDescription>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Completed: {new Date(quest.completedAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Rewards Earned:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <RewardChip
                    size="small"
                    icon={<StarIcon />}
                    label={`${quest.rewards.experience} XP`}
                    color="primary"
                    variant="outlined"
                  />
                  <RewardChip
                    size="small"
                    icon={<MonetizationOnIcon />}
                    label={`${quest.rewards.currency} Gold`}
                    color="secondary"
                    variant="outlined"
                  />
                  {quest.rewards.statPoints > 0 && (
                    <RewardChip
                      size="small"
                      icon={<FitnessCenterIcon />}
                      label={`${quest.rewards.statPoints} Stat Points`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <ExpandMore
                  expand={expanded[quest._id] || false}
                  onClick={() => handleExpandClick(quest._id)}
                  aria-expanded={expanded[quest._id] || false}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              
              <Collapse in={expanded[quest._id] || false} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Quest Details:
                  </Typography>
                  <Typography paragraph variant="body2">
                    Difficulty: {quest.difficulty ? quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1) : 'Unknown'}
                  </Typography>
                  <Typography paragraph variant="body2">
                    Time Spent: {quest.timeEstimate || 'Unknown'}
                  </Typography>
                  {quest.verification && (
                    <>
                      <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Verification:
                      </Typography>
                      <Typography paragraph variant="body2">
                        {quest.verification.description || 'No verification details available.'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Collapse>
            </CompletedQuestCard>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  // Render table view
  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)' }}>
      <Table sx={{ minWidth: 700 }} aria-label="completed quests table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Title</StyledTableCell>
            <StyledTableCell>Type</StyledTableCell>
            <StyledTableCell>Difficulty</StyledTableCell>
            <StyledTableCell>Completed On</StyledTableCell>
            <StyledTableCell>XP</StyledTableCell>
            <StyledTableCell>Gold</StyledTableCell>
            <StyledTableCell>Stat Points</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quests
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((quest) => (
              <StyledTableRow key={quest._id}>
                <StyledTableCell component="th" scope="row">
                  {quest.title}
                </StyledTableCell>
                <StyledTableCell>{formatQuestType(quest.type)}</StyledTableCell>
                <StyledTableCell>{formatDifficulty(quest.difficulty)}</StyledTableCell>
                <StyledTableCell>{new Date(quest.completedAt).toLocaleDateString()}</StyledTableCell>
                <StyledTableCell>{quest.rewards.experience}</StyledTableCell>
                <StyledTableCell>{quest.rewards.currency}</StyledTableCell>
                <StyledTableCell>{quest.rewards.statPoints || 0}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={quests.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ color: 'white' }}
      />
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ color: '#FFC107', mr: 1 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Completed Quests
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            icon={<StarIcon />}
            label={`Total XP: ${totalRewards.xp}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<MonetizationOnIcon />}
            label={`Total Gold: ${totalRewards.currency}`}
            color="secondary"
            variant="outlined"
          />
          {totalRewards.statPoints > 0 && (
            <Chip
              icon={<FitnessCenterIcon />}
              label={`Total Stat Points: ${totalRewards.statPoints}`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip
          label={viewMode === 'grid' ? 'Switch to Table View' : 'Switch to Grid View'}
          onClick={toggleViewMode}
          color="primary"
          variant="outlined"
          clickable
        />
      </Box>

      {quests && quests.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderTableView()
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            You haven't completed any quests yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete quests to earn rewards and see them listed here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CompletedQuestList;
