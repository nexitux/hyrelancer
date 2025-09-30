import React, { useState, useEffect } from 'react';
import { X, Send, MapPin, Loader, CheckCircle } from 'lucide-react';
import { freelancerJobAPI } from '@/config/api';

const ChatModal = ({ isOpen, onClose, companyName = "PrimeEdge Solutions", location = "Las Vegas, USA", jobData, jobId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState(null);

  // Get current user ID from localStorage or Redux store
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '2'; // Default user ID
    }
    return '2';
  };

  // Fetch job comments when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      fetchComments();
    }
  }, [isOpen, jobId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      const response = await freelancerJobAPI.getJobComments(jobId, userId);
      
      if (response && response.commentList) {
        const formattedComments = response.commentList.map(comment => ({
          id: comment.fjc_id,
          text: comment.fjc_comment,
          time: new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(comment.created_at).toLocaleDateString(),
          sender: 'user', // All comments from freelancers are user comments
          created_at: comment.created_at
        }));
        
        setMessages(formattedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setNotification('Failed to load comments');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMessage = async () => {
    if (message.trim() && !sending) {
      try {
        setSending(true);
        const response = await freelancerJobAPI.storeFeComment(jobId, message.trim());
        
        if (response) {
          // Add the new comment to the messages list
          const newMessage = {
            id: `temp_${Date.now()}`, // Temporary ID until we get real one from API
            text: message.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            sender: "user",
            created_at: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, newMessage]);
          setMessage('');
          showNotification('Comment added successfully!');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-2xl overflow-hidden">
        {/* Notification */}
        {notification && (
          <div className={`absolute top-4 right-4 z-10 flex items-center p-3 rounded-lg shadow-lg ${
            typeof notification === 'string' ? 'bg-red-100 text-red-800' : 
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{typeof notification === 'string' ? notification : notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{companyName}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {location}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto px-6 py-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading comments...</span>
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No comments yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          )}
          
          {!loading && messages.map((msg, index) => (
            <div key={msg.id} className="space-y-2">
              {msg.date && (
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {msg.date}
                  </span>
                </div>
              )}
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-md">
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <div className={`mt-1 text-xs text-gray-500 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;