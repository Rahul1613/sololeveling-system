import React, { useState, useEffect, useCallback } from 'react';
import mockService from '../../api/mockService';

const VerificationDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-900/70 text-green-200 border border-green-500/50">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/70 text-red-200 border border-red-500/50">
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/70 text-yellow-200 border border-yellow-500/50">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-900/70 text-gray-200 border border-gray-500/50">
            {status}
          </span>
        );
    }
  };

  // Fetch verifications
  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use mock service to get verifications
      const data = await mockService.verification.getUserVerifications();
      setVerifications(data);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Failed to load verifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load verifications on component mount
  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // View verification details
  const viewVerificationDetails = (verification) => {
    setSelectedVerification(verification);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVerification(null);
  };

  // Render AI confidence level
  const renderConfidenceLevel = (confidence) => {
    const percent = (confidence * 100).toFixed(1);
    let colorClass = 'bg-red-500';
    
    if (confidence >= 0.9) {
      colorClass = 'bg-green-500';
    } else if (confidence >= 0.7) {
      colorClass = 'bg-green-400';
    } else if (confidence >= 0.5) {
      colorClass = 'bg-yellow-400';
    } else if (confidence >= 0.3) {
      colorClass = 'bg-orange-400';
    }
    
    return (
      <div className="w-full mt-1">
        <div className="flex justify-between text-xs mb-1">
          <span>Confidence</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`${colorClass} h-2 rounded-full`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Verification History</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      ) : verifications.length === 0 ? (
        <div className="bg-gray-800 bg-opacity-70 rounded-xl border border-indigo-500/30 p-8 text-center">
          <p className="text-gray-300 mb-4">You haven't submitted any verifications yet.</p>
          <p className="text-gray-400 text-sm">Complete quests and submit proof to see your verification history here.</p>
        </div>
      ) : (
        <div className="bg-gray-800 bg-opacity-70 rounded-xl border border-indigo-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quest
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {verifications.map((verification) => (
                  <tr key={verification._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{verification.questTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 capitalize">{verification.submissionType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(verification.submittedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(verification.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {verification.aiVerificationResult ? (
                        <div className="w-32">
                          {renderConfidenceLevel(verification.aiVerificationResult.confidence)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => viewVerificationDetails(verification)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Verification Details Modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white mb-4">Verification Details</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white"
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
                      <p className="text-lg font-semibold text-white">{selectedVerification.questTitle}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Submission Type</h4>
                      <p className="text-base text-white capitalize">{selectedVerification.submissionType}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Submitted At</h4>
                      <p className="text-base text-white">{formatDate(selectedVerification.submittedAt)}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                      <div className="mt-1">{getStatusBadge(selectedVerification.verificationStatus)}</div>
                    </div>
                    
                    {selectedVerification.aiVerificationResult && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">AI Verification</h4>
                        <div className="bg-gray-900 rounded-lg p-3 text-sm">
                          <div className="mb-2">
                            {renderConfidenceLevel(selectedVerification.aiVerificationResult.confidence)}
                          </div>
                          
                          {selectedVerification.aiVerificationResult.detectedObjects?.length > 0 && (
                            <div className="mb-2">
                              <span className="text-gray-400">Detected Objects:</span>{' '}
                              <span className="text-white capitalize">{selectedVerification.aiVerificationResult.detectedObjects.join(', ')}</span>
                            </div>
                          )}
                          
                          {selectedVerification.aiVerificationResult.detectedActivities?.length > 0 && (
                            <div className="mb-2">
                              <span className="text-gray-400">Detected Activities:</span>{' '}
                              <span className="text-white capitalize">{selectedVerification.aiVerificationResult.detectedActivities.join(', ')}</span>
                            </div>
                          )}
                          
                          {selectedVerification.aiVerificationResult.feedback && (
                            <div>
                              <span className="text-gray-400">AI Feedback:</span>{' '}
                              <span className="text-white">{selectedVerification.aiVerificationResult.feedback}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedVerification.manualVerification && selectedVerification.manualVerification.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Admin Notes</h4>
                        <p className="text-base text-white bg-gray-900 rounded-lg p-3">
                          {selectedVerification.manualVerification.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {selectedVerification.mediaUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Submitted Media</h4>
                        {selectedVerification.submissionType === 'video' ? (
                          <video 
                            src={selectedVerification.mediaUrl} 
                            controls 
                            className="w-full rounded-lg bg-black"
                          />
                        ) : selectedVerification.submissionType === 'image' ? (
                          <img 
                            src={selectedVerification.mediaUrl} 
                            alt="Verification" 
                            className="w-full rounded-lg"
                          />
                        ) : null}
                      </div>
                    )}
                    
                    {selectedVerification.gpsData && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">GPS Location</h4>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
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

export default VerificationDashboard;
