import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, 
  FormControl, InputLabel, Select, MenuItem, Grid, 
  CircularProgress, Alert, Divider, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, AccessTime } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import mockQuestService from '../api/mockQuestService';
import HolographicCard from '../components/HolographicUI/HolographicCard';
import Layout from '../components/Layout';

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
    setFormData({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      requirements: quest.requirements,
      timeLimit: quest.timeLimit,
      requiresProof: quest.requiresProof,
      proofType: quest.proofType,
      verificationMethod: quest.verificationMethod,
      category: quest.category,
      rewards: {
        experience: quest.rewards.experience,
        currency: quest.rewards.currency,
        statPoints: quest.rewards.statPoints
      }
    });
    setOpenDialog(true);
  };
  
  const handleDelete = async (questId) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API endpoint
      // For the mock implementation, we'll just update the local state
      // No need to call a service since we're just removing from local state
      
      setSuccess('Quest deleted successfully');
      setMyQuests(prev => prev.filter(q => q._id !== questId));
    } catch (err) {
      setError(err.message || 'Failed to delete quest');
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
    setOpenDialog(false);
    resetForm();
  };
  
  const acceptQuest = async (questId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Accepting quest with ID:', questId);
      
      // Use the mock service instead of the API endpoint
      const response = await mockQuestService.acceptQuest(questId);
      
      console.log('Accept quest response:', response);
      
      if (response.success) {
        setSuccess('Quest accepted successfully! Check your active quests to start working on it.');
        // Refresh the public quests list to show the quest as accepted
        fetchPublicQuests();
      }
    } catch (err) {
      console.error('Error accepting quest:', err);
      setError(err.message || 'Failed to accept quest');
    } finally {
      setLoading(false);
    }
  };
  
  const renderQuestCard = (quest, isOwner = false) => {
    return (
      <HolographicCard key={quest._id} className="mb-4">
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" fontWeight="bold" color="primary">
              {quest.title}
            </Typography>
            
            <Box>
              <Chip 
                label={(quest.difficulty || 'unknown').toUpperCase()} 
                color={
                  quest.difficulty === 'easy' ? 'success' :
                  quest.difficulty === 'medium' ? 'info' :
                  quest.difficulty === 'hard' ? 'warning' : 'error'
                }
                size="small"
                sx={{ mr: 1 }}
              />
              
              <Chip 
                label={(quest.category || 'other').toUpperCase()}
                color="secondary"
                size="small"
              />
            </Box>
          </Box>
          
          <Typography variant="body1" color="text.secondary" mb={2}>
            {quest.description || 'No description provided'}
          </Typography>
          
          <Typography variant="body2" fontWeight="bold" color="text.primary" mb={1}>
            Requirements:
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {quest.requirements || 'No specific requirements'}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                Rewards:
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <Typography variant="body2" color="text.secondary">
                  XP: {quest.rewards?.experience || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currency: {quest.rewards?.currency || 0}
                </Typography>
                {(quest.rewards?.statPoints || 0) > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Stat Points: {quest.rewards?.statPoints || 0}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center">
              <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {quest.timeLimit || 24} hours
              </Typography>
            </Box>
          </Box>
          
          {quest.requiresProof && (
            <Box mb={2}>
              <Chip 
                icon={<CheckCircle fontSize="small" />}
                label={`Requires ${quest.proofType || 'verification'} proof`}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {isOwner ? (
              <Box>
                <IconButton 
                  color="primary" 
                  onClick={() => handleEdit(quest)}
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(quest._id)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created by: {quest.createdBy?.username || 'Unknown'}
                </Typography>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={() => acceptQuest(quest._id)}
            >
              Accept Quest
            </Button>
          </Box>
        </Box>
      </HolographicCard>
    );
  };
  
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Custom Quests
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create New Quest
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        <Box mb={6}>
          <Typography variant="h5" component="h2" fontWeight="bold" color="primary" mb={3}>
            My Custom Quests
          </Typography>
          
          {loading && myQuests.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : myQuests.length > 0 ? (
            <Grid container spacing={3}>
              {myQuests.map(quest => (
                <Grid item xs={12} md={6} key={quest._id}>
                  {renderQuestCard(quest, true)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                You haven't created any custom quests yet. Click the "Create New Quest" button to get started.
              </Typography>
            </Paper>
          )}
        </Box>
        
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold" color="primary" mb={3}>
            Public Custom Quests
          </Typography>
          
          {loading && publicQuests.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : publicQuests.length > 0 ? (
            <Grid container spacing={3}>
              {publicQuests.map(quest => (
                <Grid item xs={12} md={6} key={quest._id}>
                  {renderQuestCard(quest)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No public custom quests available at the moment.
              </Typography>
            </Paper>
          )}
        </Box>
        
        {/* Create/Edit Quest Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingQuest ? 'Edit Custom Quest' : 'Create New Custom Quest'}
          </DialogTitle>
          
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quest Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                  />
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
                    required
                    helperText="Describe what needs to be done to complete this quest"
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
                      <MenuItem value="extreme">Extreme</MenuItem>
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
                      <MenuItem value="learning">Learning</MenuItem>
                      <MenuItem value="productivity">Productivity</MenuItem>
                      <MenuItem value="social">Social</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
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
          
          <DialogActions>
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
    </Layout>
  );
};

export default CustomQuests;
