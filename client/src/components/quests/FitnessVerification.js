import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Form, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faCamera, faLocationArrow, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './FitnessVerification.css';

const FitnessVerification = ({ quest, onVerificationSubmitted }) => {
  const { token } = useSelector(state => state.auth);
  const [submissionType, setSubmissionType] = useState(quest.proofType || 'video');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gpsData, setGpsData] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (submissionType === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    if (submissionType === 'image' && !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (max 50MB for video, 10MB for image)
    const maxSize = submissionType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${submissionType === 'video' ? '50MB' : '10MB'}`);
      return;
    }

    setMediaFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsData({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        });
        setGpsLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate submission
      if (submissionType === 'gps' && !gpsData) {
        throw new Error('Please get your current location first');
      }

      if ((submissionType === 'video' || submissionType === 'image') && !mediaFile) {
        throw new Error(`Please select a ${submissionType} file`);
      }

      // Prepare submission data
      let mediaData = null;
      if (mediaFile) {
        mediaData = await fileToBase64(mediaFile);
      }

      // Submit verification
      const response = await axios.post(
        '/api/verification/submit',
        {
          questId: quest._id,
          submissionType,
          mediaData,
          gpsData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess(true);
      setVerificationStatus('pending');

      // If AI verification is enabled, poll for status
      if (quest.verificationMethod === 'ai') {
        pollVerificationStatus(response.data.submissionId);
      }

      // Notify parent component
      if (onVerificationSubmitted) {
        onVerificationSubmitted(response.data.submissionId);
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  // Poll for verification status
  const pollVerificationStatus = async (submissionId) => {
    try {
      const checkStatus = async () => {
        const response = await axios.get(`/api/verification/status/${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status !== 'pending') {
          setVerificationStatus(response.data.status);
          return true;
        }
        return false;
      };

      // Poll every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(async () => {
        attempts++;
        const isDone = await checkStatus();
        
        if (isDone || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);
    } catch (error) {
      console.error('Error polling verification status:', error);
    }
  };

  // Render verification form based on submission type
  const renderVerificationForm = () => {
    if (success) {
      return (
        <div className="verification-success">
          <div className="verification-icon">
            {verificationStatus === 'verified' ? (
              <FontAwesomeIcon icon={faCheck} className="success-icon" />
            ) : verificationStatus === 'rejected' ? (
              <FontAwesomeIcon icon={faTimes} className="rejected-icon" />
            ) : (
              <Spinner animation="border" variant="primary" />
            )}
          </div>
          
          <h4>
            {verificationStatus === 'verified' ? 'Verification Successful!' : 
             verificationStatus === 'rejected' ? 'Verification Failed' : 
             'Verification Submitted'}
          </h4>
          
          <p>
            {verificationStatus === 'verified' ? 'Your quest has been completed. Rewards have been added to your account.' : 
             verificationStatus === 'rejected' ? 'Your verification was not successful. Please try again with clearer proof.' : 
             'Your submission is being processed. Please wait...'}
          </p>
          
          {verificationStatus !== 'verified' && (
            <Button 
              variant="primary" 
              className="solo-btn mt-3" 
              onClick={() => {
                setSuccess(false);
                setMediaFile(null);
                setMediaPreview(null);
                setGpsData(null);
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      );
    }

    return (
      <Form onSubmit={handleSubmit}>
        {/* Submission Type Selection */}
        {quest.proofType === 'none' && (
          <Form.Group className="mb-3">
            <Form.Label>Verification Method</Form.Label>
            <div className="submission-type-selector">
              <div 
                className={`submission-type-option ${submissionType === 'video' ? 'active' : ''}`}
                onClick={() => setSubmissionType('video')}
              >
                <FontAwesomeIcon icon={faVideo} />
                <span>Video</span>
              </div>
              <div 
                className={`submission-type-option ${submissionType === 'image' ? 'active' : ''}`}
                onClick={() => setSubmissionType('image')}
              >
                <FontAwesomeIcon icon={faCamera} />
                <span>Image</span>
              </div>
              <div 
                className={`submission-type-option ${submissionType === 'gps' ? 'active' : ''}`}
                onClick={() => setSubmissionType('gps')}
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                <span>GPS</span>
              </div>
            </div>
          </Form.Group>
        )}

        {/* Video/Image Upload */}
        {(submissionType === 'video' || submissionType === 'image') && (
          <Form.Group className="mb-3">
            <Form.Label>{submissionType === 'video' ? 'Upload Video Proof' : 'Upload Image Proof'}</Form.Label>
            <div className="media-upload-container">
              {mediaPreview ? (
                <div className="media-preview">
                  {submissionType === 'video' ? (
                    <video src={mediaPreview} controls />
                  ) : (
                    <img src={mediaPreview} alt="Preview" />
                  )}
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="remove-media-btn"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div 
                  className="upload-placeholder"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FontAwesomeIcon 
                    icon={submissionType === 'video' ? faVideo : faCamera} 
                    className="upload-icon"
                  />
                  <p>Click to {submissionType === 'video' ? 'record or upload video' : 'take or upload photo'}</p>
                  <small>
                    {submissionType === 'video' 
                      ? 'Max size: 50MB. Formats: MP4, MOV, WEBM' 
                      : 'Max size: 10MB. Formats: JPG, PNG, WEBP'}
                  </small>
                </div>
              )}
              <Form.Control
                type="file"
                accept={submissionType === 'video' ? 'video/*' : 'image/*'}
                className="d-none"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </Form.Group>
        )}

        {/* GPS Location */}
        {submissionType === 'gps' && (
          <Form.Group className="mb-3">
            <Form.Label>GPS Location</Form.Label>
            <div className="gps-container">
              {gpsData ? (
                <div className="gps-data">
                  <p><strong>Latitude:</strong> {gpsData.latitude.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {gpsData.longitude.toFixed(6)}</p>
                  <p><strong>Accuracy:</strong> {gpsData.accuracy.toFixed(2)} meters</p>
                  <p><strong>Timestamp:</strong> {gpsData.timestamp.toLocaleString()}</p>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={gpsLoading}
                  >
                    Refresh Location
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  className="get-location-btn" 
                  onClick={getCurrentLocation}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLocationArrow} className="me-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
              )}
            </div>
          </Form.Group>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="mt-3">
            <ProgressBar 
              now={uploadProgress} 
              label={`${uploadProgress}%`} 
              variant="info" 
              animated 
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="d-grid gap-2 mt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="solo-btn submit-verification-btn" 
            disabled={loading || (
              (submissionType === 'gps' && !gpsData) || 
              ((submissionType === 'video' || submissionType === 'image') && !mediaFile)
            )}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Submitting...</span>
              </>
            ) : (
              'Submit Verification'
            )}
          </Button>
        </div>
      </Form>
    );
  };

  return (
    <Card className="fitness-verification-card">
      <Card.Header>
        <h4>
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          Verify Quest Completion
        </h4>
      </Card.Header>
      <Card.Body>
        <div className="quest-info mb-4">
          <h5>{quest.title}</h5>
          <p className="quest-description">{quest.description}</p>
          
          {quest.fitnessDetails && quest.fitnessDetails.exerciseType !== 'none' && (
            <div className="fitness-details">
              <div className="fitness-detail">
                <span className="detail-label">Exercise Type:</span>
                <span className="detail-value">{quest.fitnessDetails.exerciseType}</span>
              </div>
              
              {quest.fitnessDetails.targetMuscleGroups && quest.fitnessDetails.targetMuscleGroups.length > 0 && (
                <div className="fitness-detail">
                  <span className="detail-label">Target Muscles:</span>
                  <span className="detail-value">
                    {quest.fitnessDetails.targetMuscleGroups
                      .filter(group => group !== 'none')
                      .join(', ')}
                  </span>
                </div>
              )}
              
              {quest.fitnessDetails.duration > 0 && (
                <div className="fitness-detail">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{quest.fitnessDetails.duration} minutes</span>
                </div>
              )}
              
              {quest.fitnessDetails.intensity !== 'none' && (
                <div className="fitness-detail">
                  <span className="detail-label">Intensity:</span>
                  <span className="detail-value">{quest.fitnessDetails.intensity}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {renderVerificationForm()}
      </Card.Body>
    </Card>
  );
};

export default FitnessVerification;
