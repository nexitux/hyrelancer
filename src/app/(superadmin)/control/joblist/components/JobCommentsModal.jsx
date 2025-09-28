import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Calendar, User } from 'lucide-react';
import adminApi from '@/config/adminApi';

const JobCommentsModal = ({ isOpen, onClose, jobId, userId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && jobId && userId) {
      fetchComments();
    }
  }, [isOpen, jobId, userId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert jobId and userId to base64 format as shown in the API
      const jobIdBase64 = btoa(jobId);
      const userIdBase64 = btoa(userId);
      
      const response = await adminApi.get(`/getFeJobComments/${jobIdBase64}/${userIdBase64}`);
      setComments(response.data.commentList || []);
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Job Comments</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={fetchComments}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No comments found for this job.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.fjc_id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          User ID: {comment.fjc_fe_u_id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 leading-relaxed">
                      {comment.fjc_comment}
                    </p>
                    
                    {comment.created_at !== comment.updated_at && (
                      <div className="mt-2 text-xs text-gray-500">
                        Updated: {formatDate(comment.updated_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        View Job Comments
      </button>

      <JobCommentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobId="7" // Replace with actual job ID
        userId="2" // Replace with actual user ID
      />
    </div>
  );
};

export default JobCommentsModal;