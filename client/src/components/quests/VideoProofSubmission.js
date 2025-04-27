import React, { useState } from 'react';
import { Card, Typography, Box } from '@mui/material';
import VideoVerification from '../verification/VideoVerification';

const VideoProofSubmission = ({ quest, onVerificationSubmitted }) => {
  const [submissionId, setSubmissionId] = useState(null);

  const handleVerificationSubmitted = (id) => {
    setSubmissionId(id);
    if (onVerificationSubmitted) {
      onVerificationSubmitted(id);
    }
  };

  return (
    <Card sx={{ 
      p: 3, 
      mb: 3,
      background: 'rgba(16, 20, 30, 0.7)',
      backgroundImage: 'linear-gradient(135deg, rgba(20, 30, 50, 0.7) 0%, rgba(5, 10, 20, 0.7) 100%)',
      border: '1px solid rgba(100, 120, 255, 0.2)',
      boxShadow: '0 0 20px rgba(80, 100, 255, 0.1)',
      borderRadius: 3,
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #7B68EE, #3498db)',
        zIndex: 1
      }
    }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Submit Video Proof
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Record or upload a video showing you completing this quest to earn rewards.
        </Typography>
      </Box>

      <VideoVerification 
        quest={quest} 
        onVerificationSubmitted={handleVerificationSubmitted} 
        className="mb-4"
      />
    </Card>
  );
};

export default VideoProofSubmission;
