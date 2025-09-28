import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, User, RefreshCw } from 'lucide-react';
import adminApi from '@/config/adminApi';

const RemoveReasonModal = ({ isOpen, onClose, jobId }) => {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchReasons();
    }
  }, [isOpen, jobId]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert jobId to base64 format as shown in the API
      const jobIdBase64 = btoa(jobId);
      
      const response = await adminApi.get(`/FeRemoveReasonList/${jobIdBase64}`);
      setReasons(response.data.reasonlist || []);
    } catch (err) {
      setError('Failed to load removal reasons. Please try again.');
      console.error('Error fetching removal reasons:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Removal Reasons</h3>
              <span className="text-sm text-gray-500">Job ID: {jobId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchReasons}
                disabled={loading}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading removal reasons...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-300" />
                <div className="text-red-600 mb-3">{error}</div>
                <button
                  onClick={fetchReasons}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : reasons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Removal Reasons Found</h4>
                <p>This job has no removal reasons recorded.</p>
                <button
                  onClick={fetchReasons}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reasons.map((reason, index) => (
                  <div
                    key={reason.far_id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Freelancer Rejection
                          </h4>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Job: {reason.cuj_job_title || `Job ID: ${reason.far_cuj_id}`}</div>
                            <div>Freelancer: {reason.name || reason.email || `User ID: ${reason.far_fe_u_id}`}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Rejection ID: {reason.far_id}
                        </div>
                      </div>
                    </div>
                    
                    {reason.far_reason && (
                      <div className="mb-3 pl-11">
                        <div className="text-xs font-medium text-gray-600 mb-1">Rejection Reason:</div>
                        <p className="text-gray-700 text-sm leading-relaxed bg-red-50 p-2 rounded border">
                          {reason.far_reason}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500 pl-11">
                      <div className="space-y-1">
                        {reason.far_created_at && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Rejected: {formatDate(reason.far_created_at)}</span>
                          </div>
                        )}
                        {reason.created_at && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {formatDate(reason.created_at)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {reason.cuj_budget && (
                          <div>Budget: ₹{reason.cuj_budget}</div>
                        )}
                        {reason.cuj_status && (
                          <div>Job Status: 
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              reason.cuj_status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : reason.cuj_status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {reason.cuj_status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(reason.phone || reason.email) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 pl-11">
                        <div className="text-xs font-medium text-gray-600 mb-1">Contact Info:</div>
                        <div className="text-xs text-gray-500 space-x-3">
                          {reason.email && <span>Email: {reason.email}</span>}
                          {reason.phone && <span>Phone: {reason.phone}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {reasons.length > 0 && `${reasons.length} reason${reasons.length === 1 ? '' : 's'} found`}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Usage example component
const ExampleUsage = () => {
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setIsCommentsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          View Job Comments
        </button>
        
        <button
          onClick={() => setIsReasonModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          View Removal Reasons
        </button>
      </div>

      {/* Previous Job Comments Modal would go here */}
      
      <RemoveReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        jobId="7" // Replace with actual job ID
      />
    </div>
  );
};

export default RemoveReasonModal;