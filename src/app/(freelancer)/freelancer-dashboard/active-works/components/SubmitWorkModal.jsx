import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertCircle, Loader, MessageSquare } from 'lucide-react';
import { freelancerJobAPI } from '@/config/api';

const SubmitWorkModal = ({ isOpen, onClose, jobData, jobId, onJobStatusUpdate }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [jobStatus, setJobStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const statusOptions = [
    { value: 'started', label: 'Started', icon: Clock, color: 'blue' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'blue' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
    
  ];

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      fetchComments();
    }
  }, [isOpen, jobId]);

  // Get current user ID from localStorage or Redux store
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '2'; // Default user ID
    }
    return '2';
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const userId = getCurrentUserId();
      const response = await freelancerJobAPI.getJobComments(jobId, userId);
      
      if (response && response.commentList) {
        const formattedComments = response.commentList.map(comment => ({
          id: comment.fjc_id,
          text: comment.fjc_comment,
          time: new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(comment.created_at).toLocaleDateString(),
          created_at: comment.created_at
        }));
        
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setNotification('Failed to load comments');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoadingComments(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size <= 200 * 1024 * 1024) { 
      setFile(selectedFile);
    } else if (selectedFile) {
      alert('File size must be under 200MB');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSubmitting(true);
      const statusResponse = await freelancerJobAPI.updateJobStatus(jobId, jobStatus);
      console.log('Status update response:', statusResponse);
      
      if (statusResponse && statusResponse.message) {
        showNotification(`Job status updated to ${jobStatus}!`);
        setJobStatus('');
        if (onJobStatusUpdate) {
          onJobStatusUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      setSubmitting(true);
      const commentResponse = await freelancerJobAPI.storeFeComment(jobId, message.trim());
      console.log('Comment response:', commentResponse);
      
      if (commentResponse && commentResponse.message) {
        showNotification('Comment added successfully!');
        setMessage('');
        // Refresh comments list
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showNotification('Failed to add comment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSubmit = async () => {
    try {
      setSubmitting(true);
      // Handle file upload logic here if needed
      showNotification('File upload functionality will be implemented!');
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Failed to upload file. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
        <div
          className="
            bg-white rounded-2xl shadow-2xl
            w-full
            max-w-lg
            sm:max-w-2xl
            md:max-w-3xl
            lg:max-w-4xl
            xl:max-w-5xl
            mx-auto
            max-h-[90vh]
            flex flex-col justify-between
            overflow-y-auto
            border border-gray-200
          "
          style={{
            minHeight: 'min(600px, 90vh)',
            height: 'auto',
          }}
        >
          {/* Notification */}
          {notification && (
            <div className={`p-3 mx-6 mt-4 rounded-lg flex items-center ${
              typeof notification === 'string' ? 'bg-red-100 text-red-800' : 
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm">{typeof notification === 'string' ? notification : notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Job Info Header */}
          {jobData && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{jobData.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Company:</span> {jobData.company}</p>
                <p><span className="font-medium">Budget:</span> {jobData.pricing}</p>
                <p><span className="font-medium">Work Mode:</span> {jobData.workMode}</p>
                <p><span className="font-medium">Experience Required:</span> {jobData.experience}</p>
                {jobData.languages && (
                  <p><span className="font-medium">Languages:</span> {jobData.languages}</p>
                )}
              </div>
              {jobData.description && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">{jobData.description}</p>
                </div>
              )}
            </div>
          )}
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Manage Job</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Job Status Update Section */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Update Job Status
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select New Status:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setJobStatus(option.value)}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                          jobStatus === option.value
                            ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {jobStatus && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: <span className="font-medium">{statusOptions.find(s => s.value === jobStatus)?.label}</span>
                  </p>
                )}
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={submitting || !jobStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Updating Status...
                  </>
                ) : (
                  'Update Job Status'
                )}
              </button>
            </div>

            {/* Comment Section */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                <span className="mr-2">💬</span>
                Comments & Communication
              </h3>
              
              {/* Existing Comments */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Job Comments ({comments.length})
                </h4>
                
                {loadingComments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="w-4 h-4 animate-spin text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Loading comments...</span>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-3 bg-white rounded-lg p-3 border border-gray-200">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-800 flex-1">{comment.text}</p>
                          <span className="text-xs text-gray-500 ml-2">{comment.time}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{comment.date}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs">Be the first to comment!</p>
                  </div>
                )}
              </div>

              {/* Add New Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a new comment:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                onClick={handleCommentSubmit}
                disabled={submitting || !message.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Adding Comment...
                  </>
                ) : (
                  'Add Comment'
                )}
              </button>
            </div>
            
         
          </div>
        </div>
      </div>
    </>
  );  
};

export default SubmitWorkModal;