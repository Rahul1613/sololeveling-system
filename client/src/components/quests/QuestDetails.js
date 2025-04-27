import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  LinearProgress, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  AccessTime, 
  EmojiEvents, 
  CheckCircle, 
  Cancel, 
  Upload
} from '@mui/icons-material';
import mockQuestService from '../../api/mockQuestService';
import VideoVerification from '../verification/VideoVerification';

const QuestDetails = ({ quest, onComplete, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [progress, setProgress] = useState(quest?.progress || 0);
  const [showVerification, setShowVerification] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Format difficulty for display
  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'info';
      case 'hard': return 'warning';
      case 'very-hard': return 'error';
      default: return 'default';
    }
  };
  
  // Format category for display
  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'fitness': return '💪';
      case 'study': return '📚';
      case 'wellness': return '🧘';
      case 'creative': return '🎨';
      default: return '🎯';
    }
  };
  
  // Handle progress update
  const handleProgressUpdate = async (newProgress) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update progress through mock service
      const response = await mockQuestService.updateQuestProgress(quest._id, newProgress);
      
      if (response.success) {
        setProgress(newProgress);
        setSuccess('Progress updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to update progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quest completion
  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Complete quest through mock service
      const response = await mockQuestService.completeQuest(quest._id, completionNotes);
      
      if (response.success) {
        setSuccess('Quest completed successfully! Rewards have been added to your account.');
        
        // Notify parent component
        if (onComplete) {
          onComplete(response);
        }
        
        // Close completion dialog
        setShowCompletionDialog(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete quest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle verification submission
  const handleVerificationSubmitted = (result) => {
    setShowVerification(false);
    
    if (result.success) {
      setSuccess('Verification submitted successfully! Waiting for approval.');
      
      // If verification was approved immediately
      if (result.questCompleted) {
        // Notify parent component
        if (onComplete) {
          onComplete(result);
        }
      }
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
      {/* Quest Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          {quest?.title || 'Quest Details'}
        </Typography>
        
        <Box>
          <Chip 
            label={(quest?.difficulty || 'unknown').toUpperCase()} 
            color={getDifficultyColor(quest?.difficulty)}
            size="small"
            sx={{ mr: 1 }}
          />
          
          <Chip 
            label={`${getCategoryIcon(quest?.category)} ${(quest?.category || 'other').toUpperCase()}`}
            color="secondary"
            size="small"
          />
        </Box>
      </Box>
      
      {/* Description */}
      <Typography variant="body1" color="text.secondary" mb={3}>
        {quest?.description || 'No description provided'}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Requirements */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" mb={1}>
          Requirements:
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {quest?.requirements || 'No specific requirements'}
        </Typography>
      </Box>
      
      {/* Time Limit */}
      <Box display="flex" alignItems="center" mb={3}>
        <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body1" color="text.secondary">
          Time Limit: {quest?.timeLimit || 24} hours
        </Typography>
      </Box>
      
      {/* Rewards */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" mb={1}>
          <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle', color: 'gold' }} />
          Rewards:
        </Typography>
        <Box display="flex" gap={3} mt={1}>
          <Typography variant="body1" color="text.secondary">
            XP: {quest?.rewards?.experience || 0}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Currency: {quest?.rewards?.currency || 0}
          </Typography>
          {(quest?.rewards?.statPoints || 0) > 0 && (
            <Typography variant="body1" color="text.secondary">
              Stat Points: {quest?.rewards?.statPoints || 0}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Progress */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body1" fontWeight="bold">
            Progress: {progress}%
          </Typography>
          
          <Box>
            <Button 
              size="small" 
              onClick={() => handleProgressUpdate(25)}
              disabled={loading || progress >= 25}
              sx={{ minWidth: '40px' }}
            >
              25%
            </Button>
            <Button 
              size="small" 
              onClick={() => handleProgressUpdate(50)}
              disabled={loading || progress >= 50}
              sx={{ minWidth: '40px' }}
            >
              50%
            </Button>
            <Button 
              size="small" 
              onClick={() => handleProgressUpdate(75)}
              disabled={loading || progress >= 75}
              sx={{ minWidth: '40px' }}
            >
              75%
            </Button>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      {/* Verification Requirements */}
      {quest?.requiresProof && (
        <Box mb={3} p={2} bgcolor="rgba(0,0,0,0.05)" borderRadius={2}>
          <Typography variant="body1" fontWeight="bold" color="text.primary" mb={1}>
            Verification Required:
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This quest requires {quest.proofType || 'verification'} proof for completion.
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<Upload />}
            onClick={() => setShowVerification(true)}
            disabled={loading}
          >
            Submit Verification
          </Button>
        </Box>
      )}
      
      {/* Error and Success Messages */}
      {error && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={2}>
          <Typography color="error.dark">{error}</Typography>
        </Box>
      )}
      
      {success && (
        <Box mb={3} p={2} bgcolor="success.light" borderRadius={2}>
          <Typography color="success.dark">{success}</Typography>
        </Box>
      )}
      
      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Close
        </Button>
        
        <Box>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<Cancel />}
            sx={{ mr: 2 }}
            disabled={loading}
            onClick={() => {/* Implement abandon quest */}}
          >
            Abandon Quest
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircle />}
            disabled={loading || progress < 100}
            onClick={() => setShowCompletionDialog(true)}
          >
            Complete Quest
          </Button>
        </Box>
      </Box>
      
      {/* Verification Dialog */}
      {showVerification && quest && (
        <Dialog 
          open={showVerification} 
          onClose={() => setShowVerification(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Submit Verification</DialogTitle>
          <DialogContent>
            <VideoVerification 
              quest={quest} 
              onVerificationSubmitted={handleVerificationSubmitted}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Completion Dialog */}
      <Dialog 
        open={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Quest</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={3}>
            Are you sure you want to mark this quest as complete?
          </Typography>
          
          <TextField
            label="Completion Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about how you completed this quest..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompletionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleComplete}
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Complete Quest
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestDetails;
