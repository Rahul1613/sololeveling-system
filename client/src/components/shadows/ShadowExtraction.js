import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slider,
  Tooltip,
  Alert,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  FlashOn as FlashIcon,
  FlashOff as FlashOffIcon,
  Cameraswitch as CameraSwitchIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Whatshot as PowerIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../../redux/slices/notificationSlice';
import { getShadows, extractShadow, updateShadow } from '../../redux/slices/shadowSlice';
import SummoningAnimation from './SummoningAnimation';

// Styled components
const ExtractionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(10, 10, 15, 0.8)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(66, 135, 245, 0.3)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden',
  position: 'relative',
  maxWidth: '100%',
}));

const CameraContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '4/3',
  maxHeight: '300px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
  border: '1px solid rgba(66, 135, 245, 0.5)',
  boxShadow: 'inset 0 0 10px rgba(66, 135, 245, 0.3)',
  marginBottom: theme.spacing(2),
}));

const VideoElement = styled('video')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const CanvasElement = styled('canvas')(({ theme }) => ({
  display: 'none',
}));

const CameraControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  zIndex: 10,
}));

const CaptureButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '2px solid rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const ExtractionOverlay = styled(Box)(({ theme, active }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: active ? 'rgba(66, 135, 245, 0.2)' : 'transparent',
  pointerEvents: 'none',
  zIndex: 5,
  transition: 'background-color 0.3s ease',
  border: active ? '2px solid rgba(66, 135, 245, 0.8)' : 'none',
  boxShadow: active ? 'inset 0 0 20px rgba(66, 135, 245, 0.5)' : 'none',
}));

const ScanLine = styled(Box)(({ theme, active }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px',
  backgroundColor: 'rgba(66, 135, 245, 0.8)',
  boxShadow: '0 0 10px rgba(66, 135, 245, 0.8)',
  opacity: active ? 1 : 0,
  transform: active ? 'translateY(0)' : 'translateY(-100%)',
  animation: active ? 'scanAnimation 2s linear infinite' : 'none',
  '@keyframes scanAnimation': {
    '0%': {
      top: '0%',
    },
    '100%': {
      top: '100%',
    },
  },
}));

const ScanAnimation = styled(Box)(({ theme, active }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'transparent',
  opacity: active ? 1 : 0,
  transition: 'opacity 0.3s ease',
  zIndex: 10,
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(66, 135, 245, 0.2), transparent 10%, transparent 90%, rgba(66, 135, 245, 0.2))',
    animation: active ? 'scanMove 2s infinite ease-in-out' : 'none',
  },
  '@keyframes scanMove': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-100%)'
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(100%)'
    }
  }
}));

const ExtractionSuccess = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 15,
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const PowerLevelChip = styled(Chip)(({ theme, level }) => {
  const getColor = () => {
    if (level >= 80) return '#F44336'; // Red for high power
    if (level >= 60) return '#FF9800'; // Orange for medium-high power
    if (level >= 40) return '#FFEB3B'; // Yellow for medium power
    if (level >= 20) return '#4CAF50'; // Green for medium-low power
    return '#2196F3'; // Blue for low power
  };

  return {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: getColor(),
    border: `1px solid ${getColor()}`,
    fontWeight: 'bold',
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 10,
    '& .MuiChip-icon': {
      color: getColor(),
    },
  };
});

const ShadowExtraction = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { shadows, lastExtracted } = useSelector((state) => state.shadows);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [frontCamera, setFrontCamera] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [detectedPower, setDetectedPower] = useState(0);
  const [extractionPower, setExtractionPower] = useState(50);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [extractedShadow, setExtractedShadow] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Scanning and extraction state
  const [scanning, setScanning] = useState(false);
  const [showExtractionSuccess, setShowExtractionSuccess] = useState(false);

  // Shadow naming and typing state
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [shadowName, setShadowName] = useState('');
  const [shadowType, setShadowType] = useState('soldier');
  const [extractedShadows, setExtractedShadows] = useState([]);
  const [editingShadow, setEditingShadow] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load user's shadows on component mount
  useEffect(() => {
    dispatch(getShadows());
  }, [dispatch]);

  // Update extracted shadows when redux state changes
  useEffect(() => {
    if (shadows && shadows.length > 0) {
      // Filter to only show extracted shadows (not summoned ones)
      const extracted = shadows.filter(shadow => shadow.source === 'extraction');
      setExtractedShadows(extracted);
    }
  }, [shadows]);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }

      // Simulate power detection
      simulatePowerDetection();

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setDetectedPower(0);
  };

  // Switch camera
  const switchCamera = () => {
    setFrontCamera(!frontCamera);
    if (cameraActive) {
      startCamera();
    }
  };

  // Toggle flash
  const toggleFlash = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            track.applyConstraints({
              advanced: [{ torch: !flashActive }]
            });
            setFlashActive(!flashActive);
          } else {
            // Flash not supported
            dispatch(addNotification({
              type: 'warning',
              title: 'Flash Not Available',
              message: 'Flash is not supported on this device.',
              style: 'warning'
            }));
          }
        } catch (err) {
          console.error('Error toggling flash:', err);
        }
      }
    }
  };

  // Simulate power detection
  const simulatePowerDetection = () => {
    // Simulate detecting power levels in the camera view
    const powerDetectionInterval = setInterval(() => {
      if (cameraActive) {
        // Random fluctuation to simulate detection
        const basePower = Math.floor(Math.random() * 60) + 10; // Base power between 10-70
        const fluctuation = Math.floor(Math.random() * 10) - 5; // Fluctuation between -5 and 5
        setDetectedPower(Math.max(0, Math.min(100, basePower + fluctuation)));
      } else {
        clearInterval(powerDetectionInterval);
      }
    }, 1000);

    return () => clearInterval(powerDetectionInterval);
  };

  // Capture image and extract shadow
  const captureAndExtract = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    setExtracting(true);
    setScanning(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data (not actually used in this mock implementation)
      // const imageData = canvas.toDataURL('image/jpeg');

      // Simulate shadow extraction process
      setTimeout(() => {
        // Check if user level is sufficient for extraction
        const userLevel = user?.level || 1;
        const requiredLevel = Math.floor(detectedPower / 10);

        if (userLevel < requiredLevel) {
          setExtracting(false);
          setScanning(false);
          setConfirmDialog(true);
          return;
        }

        // Show scanning animation for a bit longer
        setTimeout(() => {
          setScanning(false);
          setShowExtractionSuccess(true);
          
          // After showing success message, proceed with extraction
          setTimeout(() => {
            setShowExtractionSuccess(false);
            processExtraction();
          }, 2000);
        }, 2000);
      }, 1500);

    } catch (err) {
      console.error('Error capturing image:', err);
      setExtracting(false);
      setScanning(false);
      setError('Error processing image. Please try again.');
    }
  };

  // Process the extraction after confirmation or if level is sufficient
  const processExtraction = () => {
    try {
      // Generate shadow based on detected power and extraction power setting
      const effectivePower = Math.min(detectedPower, (user?.level || 1) * 10) * (extractionPower / 100);
      const shadowTypes = ['soldier', 'mage', 'assassin', 'tank', 'healer'];
      const randomType = shadowTypes[Math.floor(Math.random() * shadowTypes.length)];

      // Generate a name based on the type
      const prefixes = {
        'soldier': ['Brave', 'Valiant', 'Mighty', 'Iron', 'Steel'],
        'mage': ['Arcane', 'Mystic', 'Astral', 'Eldritch', 'Ethereal'],
        'assassin': ['Silent', 'Shadow', 'Dark', 'Night', 'Deadly'],
        'tank': ['Stone', 'Mountain', 'Shield', 'Bulwark', 'Fortress'],
        'healer': ['Light', 'Divine', 'Holy', 'Life', 'Spirit']
      };

      const suffixes = {
        'soldier': ['Warrior', 'Knight', 'Guard', 'Blade', 'Defender'],
        'mage': ['Caster', 'Wizard', 'Sage', 'Sorcerer', 'Mage'],
        'assassin': ['Stalker', 'Blade', 'Assassin', 'Phantom', 'Shade'],
        'tank': ['Wall', 'Protector', 'Guardian', 'Sentinel', 'Bastion'],
        'healer': ['Priest', 'Cleric', 'Mender', 'Healer', 'Saint']
      };

      // Check if the type exists in prefixes and suffixes
      if (!prefixes[randomType] || !suffixes[randomType]) {
        console.error('Invalid shadow type:', randomType);
        throw new Error('Invalid shadow type');
      }

      const prefix = prefixes[randomType][Math.floor(Math.random() * prefixes[randomType].length)];
      const suffix = suffixes[randomType][Math.floor(Math.random() * suffixes[randomType].length)];
      const generatedName = `${prefix} ${suffix}`;

      // Create shadow object
      const shadow = {
        _id: `shadow_${Date.now()}`,
        name: generatedName,
        type: randomType,
        level: Math.max(1, Math.floor(effectivePower / 10)),
        power: Math.floor(effectivePower),
        rank: effectivePower > 80 ? 'A' : effectivePower > 60 ? 'B' : effectivePower > 40 ? 'C' : effectivePower > 20 ? 'D' : 'E',
        stats: {
          strength: Math.floor(Math.random() * 10) + Math.floor(effectivePower / 10),
          intelligence: Math.floor(Math.random() * 10) + Math.floor(effectivePower / 10),
          agility: Math.floor(Math.random() * 10) + Math.floor(effectivePower / 10),
          endurance: Math.floor(Math.random() * 10) + Math.floor(effectivePower / 10),
        },
        source: 'extraction',
        abilities: [],
        createdAt: new Date().toISOString()
      };

      // Set extracted shadow and show animation
      setExtractedShadow(shadow);
      setShowAnimation(true);
      setExtracting(false);
      stopCamera();
      
      // Set default values for naming dialog
      setShadowName(generatedName);
      setShadowType(randomType);
      
      // Show naming dialog after animation
      setTimeout(() => {
        setShowNamingDialog(true);
      }, 1000);

      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Extracted',
        message: `You have successfully extracted a ${shadow.rank}-rank shadow!`,
        style: 'success',
        soundEffect: 'shadow_extract.mp3'
      }));
    } catch (error) {
      console.error('Error processing extraction:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Extraction Failed',
        message: 'Failed to extract shadow. Please try again.',
        style: 'error'
      }));
      setExtracting(false);
      setScanning(false);
      setShowExtractionSuccess(false);
    }
  };

  // Get current user ID from localStorage or session
  const getCurrentUserId = () => {
    try {
      // Try to get user from localStorage or sessionStorage
      const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
      return user && user._id ? user._id : 'guest';
    } catch (error) {
      console.error('Error getting current user:', error);
      return 'guest';
    }
  };

  // Handle saving the shadow with custom name and type
  const handleSaveShadow = async () => {
    try {
      if (!extractedShadow) {
        console.error('No extracted shadow found');
        dispatch(addNotification({
          type: 'error',
          title: 'Extraction Failed',
          message: 'Extraction target not found. Please try again.',
          style: 'error'
        }));
        return;
      }
      
      // Get current user ID
      const userId = getCurrentUserId();
      console.log(`Saving shadow for user: ${userId}`);
      
      // Update the shadow with user-defined name and type
      const updatedShadow = {
        ...extractedShadow,
        name: shadowName || extractedShadow.name, // Use default if empty
        type: shadowType || extractedShadow.type, // Use default if empty
        extractedAt: new Date().toISOString(), // Add extraction timestamp
        userId: userId // Add user ID to the shadow data
      };
      
      console.log('Saving shadow:', updatedShadow);
      
      // Create user-specific storage keys
      const shadowsKey = `${userId}_shadows`;
      
      // Save to redux store and ensure persistence
      try {
        // Use unwrap to properly handle the promise and catch any errors
        await dispatch(extractShadow(updatedShadow)).unwrap();
        
        // After successful dispatch, manually save to user-specific localStorage as a backup
        const currentShadows = JSON.parse(localStorage.getItem(shadowsKey) || '[]');
        currentShadows.push(updatedShadow);
        localStorage.setItem(shadowsKey, JSON.stringify(currentShadows));
        
        // Also save to sessionStorage for redundancy
        sessionStorage.setItem(shadowsKey, JSON.stringify(currentShadows));
        
        console.log(`Shadow saved successfully to storage for user ${userId}:`, updatedShadow);
      } catch (saveError) {
        console.error('Error dispatching shadow extraction:', saveError);
        // Even if the dispatch fails, try to save to user-specific localStorage
        const currentShadows = JSON.parse(localStorage.getItem(shadowsKey) || '[]');
        currentShadows.push(updatedShadow);
        localStorage.setItem(shadowsKey, JSON.stringify(currentShadows));
        sessionStorage.setItem(shadowsKey, JSON.stringify(currentShadows));
        console.log(`Shadow saved to storage for user ${userId} despite dispatch error`);
      }
      
      // Close dialog
      setShowNamingDialog(false);
      
      // Add to local state immediately for UI feedback
      setExtractedShadows([updatedShadow, ...extractedShadows]);
      
      // Reset extracted shadow after saving
      setExtractedShadow(null);
      
      // Refresh shadows from redux to ensure UI is up to date
      dispatch(getShadows());
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Shadow Added to Army',
        message: `${updatedShadow.name} has joined your shadow army!`,
        style: 'success'
      }));
    } catch (error) {
      console.error('Error saving shadow:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save shadow. Please try again.',
        style: 'error'
      }));
    }
  };

  // Handle editing an existing shadow
  const handleEditShadow = (shadow) => {
    setEditingShadow(shadow);
    setShadowName(shadow.name);
    setShadowType(shadow.type);
    setShowNamingDialog(true);
  };

  // Handle saving edited shadow
  const handleSaveEdit = () => {
    if (!editingShadow) return;
    
    // Update the shadow with new name and type
    const updatedShadow = {
      ...editingShadow,
      name: shadowName,
      type: shadowType
    };
    
    // Update in redux/database
    dispatch(updateShadow({ shadowId: editingShadow._id, shadowData: updatedShadow }));
    
    // Close dialog
    setShowNamingDialog(false);
    setEditingShadow(null);
    
    // Update local state for immediate UI feedback
    setExtractedShadows(extractedShadows.map(s => 
      s._id === updatedShadow._id ? updatedShadow : s
    ));
  };

  // Handle level warning confirmation
  const handleConfirmExtraction = () => {
    setConfirmDialog(false);
    processExtraction();
  };

  // Handle animation close
  const handleAnimationClose = () => {
    setShowAnimation(false);
    // Reset camera for next extraction
    startCamera();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <ExtractionContainer>
      <Typography variant="h5" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold', textAlign: 'center' }}>
        Shadow Extraction
      </Typography>

      <Typography variant="body2" paragraph sx={{ textAlign: 'center', mb: 3 }}>
        Point your camera at a target to analyze and extract their shadow. Higher level hunters can extract more powerful shadows.
      </Typography>

      <CameraContainer>
        <VideoElement ref={videoRef} autoPlay playsInline muted />
        <CanvasElement ref={canvasRef} />

        <ExtractionOverlay active={cameraActive} />
        <ScanLine active={scanning} />
        <ScanAnimation active={scanning} />

        {detectedPower > 0 && (
          <PowerLevelChip
            icon={<PowerIcon />}
            label={`Power: ${detectedPower}`}
            level={detectedPower}
          />
        )}

        {showExtractionSuccess && (
          <ExtractionSuccess>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 2 }}>
              Extraction Successful!
            </Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 2 }}>
              Your shadow is being processed...
            </Typography>
          </ExtractionSuccess>
        )}

        <CameraControls>
          {cameraActive ? (
            <>
              <ControlButton onClick={toggleFlash} color="primary">
                {flashActive ? <FlashOffIcon /> : <FlashIcon />}
              </ControlButton>

              <CaptureButton
                onClick={captureAndExtract}
                color="primary"
                disabled={extracting}
                size="large"
              >
                {extracting ? <CircularProgress size={24} /> : <PhotoCameraIcon fontSize="large" />}
              </CaptureButton>

              <ControlButton onClick={switchCamera} color="primary">
                <CameraSwitchIcon />
              </ControlButton>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={startCamera}
              sx={{ backgroundColor: 'rgba(66, 135, 245, 0.8)' }}
            >
              Start Camera
            </Button>
          )}
        </CameraControls>
      </CameraContainer>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Extraction Power: {extractionPower}%
        </Typography>
        <Slider
          value={extractionPower}
          onChange={(e, newValue) => setExtractionPower(newValue)}
          aria-labelledby="extraction-power-slider"
          valueLabelDisplay="auto"
          min={10}
          max={100}
          sx={{
            color: '#4287f5',
            '& .MuiSlider-thumb': {
              boxShadow: '0 0 10px rgba(66, 135, 245, 0.7)'
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Higher extraction power yields stronger shadows but requires more energy.
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Your Level: {user?.level || 1} | Max Extractable Power: {(user?.level || 1) * 10}
        </Typography>
      </Box>

      {/* Extracted Shadows Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold', borderBottom: '1px solid rgba(66, 135, 245, 0.3)', pb: 1 }}>
          Your Extracted Shadows
        </Typography>
        
        {extractedShadows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, border: '1px dashed rgba(66, 135, 245, 0.3)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No shadows extracted yet. Use the camera above to extract your first shadow.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {extractedShadows.map((shadow) => (
              <Grid item xs={12} sm={6} md={4} key={shadow._id}>
                <Card sx={{
                  backgroundColor: 'rgba(15, 20, 30, 0.85)',
                  border: '1px solid rgba(66, 135, 245, 0.3)',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.7)'
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#4287f5', fontWeight: 'bold' }}>
                        {shadow.name}
                      </Typography>
                      <Chip 
                        label={shadow.rank} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 
                            shadow.rank === 'S' ? 'rgba(255, 94, 0, 0.2)' :
                            shadow.rank === 'A' ? 'rgba(255, 0, 0, 0.2)' :
                            shadow.rank === 'B' ? 'rgba(163, 53, 238, 0.2)' :
                            shadow.rank === 'C' ? 'rgba(0, 112, 221, 0.2)' :
                            shadow.rank === 'D' ? 'rgba(30, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                          color: 
                            shadow.rank === 'S' ? '#ff5e00' :
                            shadow.rank === 'A' ? '#ff0000' :
                            shadow.rank === 'B' ? '#a335ee' :
                            shadow.rank === 'C' ? '#0070dd' :
                            shadow.rank === 'D' ? '#1eff00' : '#ffffff',
                          border: `1px solid ${
                            shadow.rank === 'S' ? '#ff5e00' :
                            shadow.rank === 'A' ? '#ff0000' :
                            shadow.rank === 'B' ? '#a335ee' :
                            shadow.rank === 'C' ? '#0070dd' :
                            shadow.rank === 'D' ? '#1eff00' : '#ffffff'}`
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#b8eaff', mr: 1 }}>
                        Type: {shadow.type.charAt(0).toUpperCase() + shadow.type.slice(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b8eaff' }}>
                        Level: {shadow.level}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {Object.entries(shadow.stats).map(([stat, value]) => (
                        <Chip 
                          key={stat}
                          label={`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(66, 135, 245, 0.1)',
                            color: '#b8eaff',
                            border: '1px solid rgba(66, 135, 245, 0.3)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 1, pt: 0, justifyContent: 'flex-end' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditShadow(shadow)}
                      sx={{ color: '#4287f5' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        aria-labelledby="extraction-confirm-title"
      >
        <DialogTitle id="extraction-confirm-title" sx={{ color: '#ff9800' }}>
          Warning: High Power Level Detected
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            The detected power level ({detectedPower}) is too high for your current level ({user?.level || 1}).
          </Typography>
          <Typography variant="body1" paragraph>
            Attempting to extract this shadow may result in a weaker shadow than expected or potential failure.
          </Typography>
          <Typography variant="body1">
            Do you wish to proceed with extraction anyway?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmExtraction} color="warning" variant="contained">
            Extract Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Naming Dialog */}
      <Dialog
        open={showNamingDialog}
        onClose={() => setShowNamingDialog(false)}
        aria-labelledby="naming-dialog-title"
      >
        <DialogTitle id="naming-dialog-title">
          Name Your Shadow
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Shadow Name"
            value={shadowName}
            onChange={(e) => setShadowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl>
            <InputLabel id="shadow-type-label">Shadow Type</InputLabel>
            <Select
              labelId="shadow-type-label"
              value={shadowType}
              label="Shadow Type"
              onChange={(e) => setShadowType(e.target.value)}
            >
              <MenuItem value="soldier">Soldier</MenuItem>
              <MenuItem value="mage">Mage</MenuItem>
              <MenuItem value="assassin">Assassin</MenuItem>
              <MenuItem value="tank">Tank</MenuItem>
              <MenuItem value="healer">Healer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNamingDialog(false)} color="primary">
            Cancel
          </Button>
          {editingShadow ? (
            <Button onClick={handleSaveEdit} color="primary" variant="contained">
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleSaveShadow} color="primary" variant="contained">
              Save Shadow
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Summoning Animation */}
      {extractedShadow && (
        <SummoningAnimation
          open={showAnimation}
          onClose={handleAnimationClose}
          shadowType={extractedShadow.type}
          shadowName={extractedShadow.name}
          summonType="extraction"
        />
      )}
    </ExtractionContainer>
  );
};

export default ShadowExtraction;
