import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';

const VerificationReviewPanel = () => {
  const { token, user } = useSelector(state => state.auth);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  const fetchPendingVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/verification/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPendingVerifications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending verifications:', err);
      setError('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingVerifications();
    }
  }, [isAdmin, fetchPendingVerifications]);

  const handleVerify = async (isApproved) => {
    if (!selectedVerification) return;

    try {
      setReviewLoading(true);
      setReviewError(null);
      setReviewSuccess(false);

      await axios.post(
        `${API_URL}/verification/manual/${selectedVerification._id}`,
        {
          isVerified: isApproved,
          notes: reviewNotes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviewSuccess(true);
      
      // Remove the verified submission from the list
      setPendingVerifications(pendingVerifications.filter(
        v => v._id !== selectedVerification._id
      ));
      
      // Close the modal after a short delay
      setTimeout(() => {
        setSelectedVerification(null);
        setReviewNotes('');
        setReviewSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error reviewing verification:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit verification review');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredVerifications = filterType === 'all' 
    ? pendingVerifications 
    : pendingVerifications.filter(v => v.submissionType === filterType);

  if (!isAdmin) {
    return (
      <div className="bg-gray-900 bg-opacity-70 rounded-xl border border-indigo-500/30 p-6">
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-400">Access Restricted</h3>
          <p className="text-gray-500 mt-1">You need admin privileges to access this area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-70 rounded-xl border border-indigo-500/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Verification Review Panel</h2>
        <button
          onClick={fetchPendingVerifications}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm flex items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filterType === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center ${
              filterType === 'video' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Videos
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center ${
              filterType === 'image' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Images
          </button>
          <button
            onClick={() => setFilterType('gps')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center ${
              filterType === 'gps' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            GPS
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 mb-4">
          {error}
        </div>
      ) : filteredVerifications.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-400">No pending verifications</h3>
          <p className="text-gray-500 mt-1">All submissions have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVerifications.map((verification) => (
            <div 
              key={verification._id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedVerification(verification)}
            >
              <div className="relative">
                {verification.submissionType === 'video' && (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {verification.submissionType === 'image' && verification.mediaUrl && (
                  <div className="aspect-video bg-gray-900">
                    <img 
                      src={`${API_URL}${verification.mediaUrl}`} 
                      alt="Verification" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {verification.submissionType === 'gps' && (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/70 text-yellow-400 border border-yellow-500/30">
                    Pending
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white truncate">{verification.quest?.title || 'Unknown Quest'}</h3>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-400">
                    {verification.user?.username || 'Unknown User'}
                  </span>
                  <span className="text-gray-400">
                    {formatDate(verification.submittedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-xl border border-indigo-500/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Review Verification</h3>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setReviewNotes('');
                    setReviewError(null);
                    setReviewSuccess(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Quest</h4>
                    <p className="text-lg font-medium text-white">{selectedVerification.quest?.title || 'Unknown Quest'}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">User</h4>
                    <p className="text-base text-white">{selectedVerification.user?.username || 'Unknown User'}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Submission Type</h4>
                    <p className="text-base text-white capitalize">{selectedVerification.submissionType}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Submitted At</h4>
                    <p className="text-base text-white">{formatDate(selectedVerification.submittedAt)}</p>
                  </div>

                  {selectedVerification.gpsData && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">GPS Location</h4>
                      <div className="bg-gray-900 rounded-lg p-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-400">Latitude:</span>
                            <p className="text-white">{selectedVerification.gpsData.latitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Longitude:</span>
                            <p className="text-white">{selectedVerification.gpsData.longitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Accuracy:</span>
                            <p className="text-white">{selectedVerification.gpsData.accuracy.toFixed(2)} meters</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Timestamp:</span>
                            <p className="text-white">{new Date(selectedVerification.gpsData.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Review Notes</h4>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this verification (optional)"
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 transition-colors"
                      rows={4}
                    ></textarea>
                  </div>

                  {reviewError && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200 text-sm">
                      Verification review submitted successfully!
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerify(true)}
                      disabled={reviewLoading || reviewSuccess}
                      className={`flex-1 py-2 rounded-lg text-white flex items-center justify-center transition-colors ${
                        reviewLoading || reviewSuccess 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {reviewLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleVerify(false)}
                      disabled={reviewLoading || reviewSuccess}
                      className={`flex-1 py-2 rounded-lg text-white flex items-center justify-center transition-colors ${
                        reviewLoading || reviewSuccess 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {reviewLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  {selectedVerification.mediaUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Submitted Media</h4>
                      {selectedVerification.submissionType === 'video' ? (
                        <video 
                          src={`${API_URL}${selectedVerification.mediaUrl}`} 
                          controls 
                          className="w-full rounded-lg bg-black"
                        />
                      ) : selectedVerification.submissionType === 'image' ? (
                        <img 
                          src={`${API_URL}${selectedVerification.mediaUrl}`} 
                          alt="Verification" 
                          className="w-full rounded-lg"
                        />
                      ) : null}
                    </div>
                  )}

                  {/* AI Verification Placeholder */}
                  <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-indigo-500/30">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                      </svg>
                      AI Verification Assistant
                    </h4>
                    <div className="text-gray-400 text-sm">
                      <p className="mb-2">AI verification integration is ready for implementation.</p>
                      <p>This area will display AI-powered analysis of the verification submission, including:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Object detection results</li>
                        <li>Activity recognition</li>
                        <li>Pose estimation</li>
                        <li>Fraud detection</li>
                        <li>Automated verification recommendation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationReviewPanel;
