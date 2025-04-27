import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import mockService from '../../api/mockService';
import mockQuestService from '../../api/mockQuestService';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  LinearProgress,
  Paper,
  IconButton
} from '@mui/material';
import { 
  Videocam, 
  Stop, 
  Upload, 
  Delete, 
  CheckCircle 
} from '@mui/icons-material';

const VideoVerification = ({ quest, onVerificationSubmitted, className }) => {
  const { token, user } = useSelector(state => state.auth);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Start camera for recording
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Create media recorder
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      setMediaRecorder(recorder);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please make sure you have granted permission to use the camera and microphone.');
    }
  };

  // Start recording
  const startRecording = () => {
    if (mediaRecorder) {
      setRecordedChunks([]);
      mediaRecorder.start(1000); // Collect data every second
      setRecording(true);
    } else {
      setError('Camera not initialized. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Create video file from chunks
      setTimeout(() => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        const file = new File([blob], `verification-${Date.now()}.webm`, { type: 'video/webm' });
        
        setVideoFile(file);
        setVideoPreview(videoUrl);
      }, 500);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // Clear selected video
  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setRecordedChunks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit verification
  const submitVerification = async () => {
    if (!videoFile) {
      setError('Please record or upload a video for verification');
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Prepare verification data
      const verificationData = {
        questId: quest._id,
        userId: user.id,
        fileType: videoFile.type,
        fileName: videoFile.name,
        fileSize: videoFile.size
      };
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Submit verification using mockQuestService
      const response = await mockQuestService.submitVerification(quest._id, verificationData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        setSuccess(true);
        setVerificationId(response.verificationId);
        setVerificationStatus('pending');
        
        // Start polling for verification status
        const interval = setInterval(async () => {
          try {
            const statusResponse = await mockQuestService.checkVerificationStatus(response.verificationId);
            
            if (statusResponse.status !== 'pending') {
              clearInterval(interval);
              setVerificationStatus(statusResponse.status);
              
              // Notify parent component
              if (onVerificationSubmitted) {
                onVerificationSubmitted(statusResponse);
              }
            }
          } catch (err) {
            console.error('Error checking verification status:', err);
          }
        }, 3000); // Check every 3 seconds
        
        setPollingInterval(interval);
      }
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError(err.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={className}>
      {/* Video Preview */}
      {videoPreview ? (
        <Box mb={3} position="relative">
          <video 
            src={videoPreview} 
            controls 
            style={{ width: '100%', borderRadius: '8px' }}
          />
          <IconButton 
            color="error" 
            onClick={clearVideo}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <Delete />
          </IconButton>
        </Box>
      ) : (
        <Box 
          mb={3} 
          height="300px" 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          border="1px dashed #ccc"
          borderRadius="8px"
          bgcolor="rgba(0,0,0,0.05)"
        >
          {recording ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <Typography color="text.secondary">
              No video selected. Record or upload a video for verification.
            </Typography>
          )}
        </Box>
      )}
      
      {/* Recording Controls */}
      {!videoPreview && !recording && (
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Videocam />}
            onClick={() => {
              startCamera().then(() => startRecording());
            }}
            disabled={loading}
          >
            Record Video
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            Upload Video
          </Button>
          
          <input 
            type="file" 
            accept="video/*" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </Box>
      )}
      
      {/* Stop Recording Button */}
      {recording && (
        <Box display="flex" justifyContent="center" mb={3}>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Stop />}
            onClick={stopRecording}
          >
            Stop Recording
          </Button>
        </Box>
      )}
      
      {/* Submit Button */}
      {videoPreview && !success && (
        <Box display="flex" justifyContent="center" mb={3}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CheckCircle />}
            onClick={submitVerification}
            disabled={loading}
          >
            Submit for Verification
          </Button>
        </Box>
      )}
      
      {/* Loading/Progress Indicator */}
      {loading && (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Uploading video... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Success Message */}
      {success && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CheckCircle sx={{ mr: 1 }} />
            <Typography variant="h6">Verification Submitted</Typography>
          </Box>
          
          <Typography variant="body1" mb={2}>
            Your verification has been submitted and is being processed.
          </Typography>
          
          <Typography variant="body2" fontWeight="bold">
            Status: {verificationStatus === 'pending' ? 'Pending Review' : 
                    verificationStatus === 'approved' ? 'Approved' : 'Rejected'}
          </Typography>
          
          {verificationStatus === 'pending' && (
            <Box display="flex" alignItems="center" mt={2}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">
                Processing verification...
              </Typography>
            </Box>
          )}
          
          {verificationStatus === 'approved' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Verification approved! Quest completed successfully.
            </Alert>
          )}
          
          {verificationStatus === 'rejected' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Verification rejected. Please try again.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default VideoVerification;
