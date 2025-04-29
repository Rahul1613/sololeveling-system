import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, 
  FormControl, InputLabel, Select, MenuItem, Grid, 
  CircularProgress, Alert, Divider, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, AccessTime } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import mockQuestService from '../api/mockQuestService';
import HolographicCard from '../components/HolographicUI/HolographicCard';

const CustomQuests = () => {
  const { token } = useSelector(state => state.auth);
  const [myQuests, setMyQuests] = useState([]);
  const [publicQuests, setPublicQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    requirements: '',
    timeLimit: 24,
    requiresProof: false,
    proofType: 'none',
    verificationMethod: 'none',
    category: 'other',
    rewards: {
      experience: 100,
      currency: 25,
      statPoints: 0
    }
  });
  
  useEffect(() => {
    fetchMyQuests();
    fetchPublicQuests();
  }, [token]); // Add token as dependency since it's used in the fetch functions
  
  const fetchMyQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the mock service instead of the API endpoint
      const customQuests = await mockQuestService.getCustomQuests();
      setMyQuests(customQuests);
    } catch (err) {
      setError('Failed to fetch your custom quests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPublicQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the mock service instead of the API endpoint
      const publicQuestsData = await mockQuestService.getPublicCustomQuests();
      setPublicQuests(publicQuestsData);
    } catch (err) {
      setError('Failed to fetch public custom quests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('rewards.')) {
      const rewardField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rewards: {
          ...prev.rewards,
          [rewardField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let newQuest;
      
      if (editingQuest) {
        // Update existing quest - in a real app this would call an API
        // For the mock implementation, we'll just update the local state
        newQuest = {
          ...editingQuest,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        
        setSuccess('Quest updated successfully');
        setMyQuests(prev => prev.map(q => 
          q._id === editingQuest._id ? newQuest : q
        ));
      } else {
        // Create new quest using the mock service
        newQuest = await mockQuestService.createCustomQuest(formData);
        
        setSuccess('Quest created successfully');
        setMyQuests(prev => [...prev, newQuest]);
      }
      
      // Reset form and close dialog
      resetForm();
      setOpenDialog(false);
      
    } catch (err) {
      setError(err.message || 'Failed to save quest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (quest) => {
    setEditingQuest(quest);
    
    // Populate form with quest data
    setFormData({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      requirements: quest.requirements,
      timeLimit: quest.timeLimit,
      requiresProof: quest.requiresProof,
      proofType: quest.proofType || 'none',
      verificationMethod: quest.verificationMethod || 'none',
      category: quest.category || 'other',
      rewards: {
        experience: quest.rewards.experience,
        currency: quest.rewards.currency,
        statPoints: quest.rewards.statPoints
      }
    });
    
    setOpenDialog(true);
  };
  
  const handleDelete = async (questId) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API endpoint
      // For the mock implementation, we'll just update the local state
      setMyQuests(prev => prev.filter(q => q._id !== questId));
      setSuccess('Quest deleted successfully');
      
    } catch (err) {
      setError('Failed to delete quest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      requirements: '',
      timeLimit: 24,
      requiresProof: false,
      proofType: 'none',
      verificationMethod: 'none',
      category: 'other',
      rewards: {
        experience: 100,
        currency: 25,
        statPoints: 0
      }
    });
    
    setEditingQuest(null);
  };
  
  const handleDialogClose = () => {
    resetForm();
    setOpenDialog(false);
  };
  
  const acceptQuest = async (questId) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API endpoint
      // For the mock implementation, we'll just show a success message
      
      // Find the quest in the public quests
      const quest = publicQuests.find(q => q._id === questId);
      
      if (quest) {
        // Add it to active quests (this would be handled by the backend in a real app)
        await mockQuestService.acceptQuest(questId);
        
        setSuccess(`You have accepted the quest: ${quest.title}`);
      } else {
        throw new Error('Quest not found');
      }
      
    } catch (err) {
      setError('Failed to accept quest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderQuestCard = (quest, isOwner = false) => {
    const getDifficultyColor = (difficulty) => {
      switch(difficulty?.toLowerCase()) {
        case 'easy': return '#4CAF50';
        case 'medium': return '#FF9800';
        case 'hard': return '#F44336';
        case 'very-hard': return '#9C27B0';
        default: return '#757575';
      }
    };
    
    const getCategoryIcon = (category) => {
      switch(category?.toLowerCase()) {
        case 'fitness': return '💪';
        case 'study': return '📚';
        case 'wellness': return '🧘';
        case 'creative': return '🎨';
        default: return '🎯';
      }
    };
    
    return (
      <HolographicCard className="quest-card" sx={{ mb: 3 }}>
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h5" className="quest-title">
              {quest.title}
            </Typography>
            
            <Box>
              <Chip 
                label={quest.difficulty?.toUpperCase() || 'MEDIUM'}
                size="small"
                sx={{ 
                  mr: 1, 
                  backgroundColor: getDifficultyColor(quest.difficulty),
                  color: 'white',
                  fontWeight: 'bold'
                }}
                className="reward-chip"
              />
              
              <Chip 
                label={`${getCategoryIcon(quest.category)} ${(quest.category || 'other').toUpperCase()}`}
                size="small"
                sx={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', color: 'white' }}
                className="reward-chip"
              />
            </Box>
          </Box>
          
          <Typography variant="body1" className="quest-description" mb={2}>
            {quest.description}
          </Typography>
          
          <Box className="quest-info" mb={1}>
            <AccessTime className="quest-info-icon" />
            <Typography variant="body2">
              Time Limit: {quest.timeLimit} hours
            </Typography>
          </Box>
          
          {quest.requiresProof && (
            <Box className="quest-info" mb={1}>
              <CheckCircle className="quest-info-icon" />
              <Typography variant="body2">
                Requires {quest.proofType || 'verification'}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box className="quest-rewards">
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Rewards:
            </Typography>
            
            <Box display="flex" flexWrap="wrap">
              <Chip 
                label={`${quest.rewards?.experience || 0} XP`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                className="reward-chip"
              />
              
              <Chip 
                label={`${quest.rewards?.currency || 0} Gold`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                className="reward-chip"
              />
              
              {quest.rewards?.statPoints > 0 && (
                <Chip 
                  label={`${quest.rewards.statPoints} Stat Points`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                  className="reward-chip"
                />
              )}
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={3}>
            {isOwner ? (
              <>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => handleEdit(quest)}
                >
                  Edit
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDelete(quest._id)}
                >
                  Delete
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => acceptQuest(quest._id)}
              >
                Accept Quest
              </Button>
            )}
          </Box>
        </Box>
      </HolographicCard>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box className="container-section">
        {/* Page Title */}
        <Box className="flex-between" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" className="page-title" sx={{ mb: 0 }}>
            Custom Quests
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Quest
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {/* My Custom Quests Section */}
        <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)', mb: 4 }}>
          <Typography variant="h5" className="section-title">
            My Custom Quests
          </Typography>
          
          {myQuests.length > 0 ? (
            myQuests.map(quest => renderQuestCard(quest, true))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(10, 10, 15, 0.5)', borderRadius: 2, mt: 2 }}>
              <Typography variant="body1" color="#e0e0e0">
                You haven't created any custom quests yet.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ mt: 2 }}
              >
                Create Your First Quest
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Public Custom Quests Section */}
        <Box className="container-section" sx={{ p: 3, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
          <Typography variant="h5" className="section-title">
            Public Custom Quests
          </Typography>
          
          {publicQuests.length > 0 ? (
            publicQuests.map(quest => renderQuestCard(quest, false))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(10, 10, 15, 0.5)', borderRadius: 2, mt: 2 }}>
              <Typography variant="body1" color="#e0e0e0">
                No public custom quests available at the moment.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Create/Edit Quest Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 135, 245, 0.8)',
            boxShadow: '0 0 20px rgba(66, 135, 245, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(66, 135, 245, 0.3)' }}>
          {editingQuest ? 'Edit Custom Quest' : 'Create Custom Quest'}
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Box component="form" noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Quest Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    label="Difficulty"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                    <MenuItem value="very-hard">Very Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="fitness">Fitness</MenuItem>
                    <MenuItem value="study">Study</MenuItem>
                    <MenuItem value="wellness">Wellness</MenuItem>
                    <MenuItem value="creative">Creative</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Describe what needs to be done to complete this quest"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2">Rewards</Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Experience Reward"
                  name="rewards.experience"
                  type="number"
                  value={formData.rewards.experience}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Currency Reward"
                  name="rewards.currency"
                  type="number"
                  value={formData.rewards.currency}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Stat Points Reward"
                  name="rewards.statPoints"
                  type="number"
                  value={formData.rewards.statPoints}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Limit (hours)"
                  name="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1, max: 168 } }}
                  helperText="Time to complete the quest (1-168 hours)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Requires Proof</InputLabel>
                  <Select
                    name="requiresProof"
                    value={formData.requiresProof}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      requiresProof: e.target.value === 'true'
                    }))}
                    label="Requires Proof"
                  >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {formData.requiresProof && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Proof Type</InputLabel>
                      <Select
                        name="proofType"
                        value={formData.proofType}
                        onChange={handleChange}
                        label="Proof Type"
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                        <MenuItem value="gps">GPS</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Verification Method</InputLabel>
                      <Select
                        name="verificationMethod"
                        value={formData.verificationMethod}
                        onChange={handleChange}
                        label="Verification Method"
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="manual">Manual</MenuItem>
                        <MenuItem value="ai">AI</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid rgba(66, 135, 245, 0.3)', px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingQuest ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomQuests;
