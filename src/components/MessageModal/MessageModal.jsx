'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, X, Paperclip, Smile } from 'lucide-react';
import api from '@/config/api';
import { messageAPI } from '@/config/api';
import { showSuccessNotification, showErrorNotification } from '@/utils/notificationService';

const MessageModal = ({ isOpen, onClose, freelancerData }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [prefilledMessages, setPrefilledMessages] = useState([]);
  const [loadingPrefilled, setLoadingPrefilled] = useState(false);
  const messagesEndRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  
  // Get authentication data from Redux store
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const currentUserId = user?.id;

  // Fetch prefilled messages from API
  const fetchPrefilledMessages = async () => {
    setLoadingPrefilled(true);
    try {
      const response = await messageAPI.getPrefilledMessages();
      if (response.status === 'success' && response.messages) {
        // Handle the actual API response structure
        // The API returns messages with createdBy relationship
        const messages = response.messages.map(msg => ({
          id: msg.id,
          text: msg.body || msg.message || msg.text || msg.content, // Handle different possible field names
          category: msg.created_by?.ad_name || 'General',
          createdBy: msg.created_by
        }));
        setPrefilledMessages(messages);
      } else {
        console.warn('Failed to fetch prefilled messages:', response);
        // Fallback to default messages if API fails
        setPrefilledMessages(getDefaultPrefilledMessages());
      }
    } catch (error) {
      console.error('Error fetching prefilled messages:', error);
      // Fallback to default messages if API fails
      setPrefilledMessages(getDefaultPrefilledMessages());
    } finally {
      setLoadingPrefilled(false);
    }
  };

  // Default prefilled messages as fallback
  const getDefaultPrefilledMessages = () => [
    {
      id: 1,
      text: "Hi! I'm interested in your services. Can we discuss my project?",
      category: "General"
    },
    {
      id: 2,
      text: "Hello! I'd like to know more about your availability and rates.",
      category: "General"
    },
    {
      id: 3,
      text: "Hi there! I have a project that might be a good fit for your skills.",
      category: "General"
    },
    {
      id: 4,
      text: "Hello! Could you please share more details about your experience?",
      category: "General"
    },
    {
      id: 5,
      text: "Hi! I'm looking for someone with your expertise. Are you available?",
      category: "General"
    }
  ];

  useEffect(() => {
    if (isOpen && freelancerData) {
      // Load conversation history
      loadMessages();
      // Fetch prefilled messages
      fetchPrefilledMessages();
      
      // Setup auto-refresh interval to check for new messages
      refreshIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 5000); // Check for new messages every 5 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isOpen, freelancerData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setMessage('');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!freelancerData?.fp_u_id || !token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://hyre.hyrelancer.com/api/conversation/${freelancerData.fp_u_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Conversation API Response:', data);
        
        if (data.status && data.data && Array.isArray(data.data)) {
          const formattedMessages = data.data.map(msg => ({
            id: msg.uc_id,
            text: msg.uc_message,
            sender: msg.uc_sender_id === currentUserId ? 'me' : 'other',
            timestamp: formatMessageTime(msg.created_at),
            rawTimestamp: msg.created_at,
            isRead: msg.is_read
          }));
          
          // Sort messages by creation time (ascending)
          formattedMessages.sort((a, b) => new Date(a.rawTimestamp) - new Date(b.rawTimestamp));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !freelancerData?.fp_u_id || !token) return;
    
    const receiverId = freelancerData.fp_u_id;
    
    // Optimistically add message to UI immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: 'me',
      timestamp: formatMessageTime(new Date()),
      rawTimestamp: new Date().toISOString(),
      isRead: 0,
      sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const response = await fetch('https://hyre.hyrelancer.com/api/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message: messageText
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status && data.data) {
        // Replace optimistic message with real message from server
        const realMessage = {
          id: data.data.uc_id,
          text: messageText,
          sender: 'me',
          timestamp: formatMessageTime(data.data.created_at),
          rawTimestamp: data.data.created_at,
          isRead: data.data.is_read,
          sending: false
        };

        setMessages(prev => 
          prev.map(msg => msg.id === tempMessage.id ? realMessage : msg)
        );
        
        showSuccessNotification('Message sent successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      showErrorNotification('Failed to send message. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const messageText = message.trim();
    setMessage('');
    await sendMessage(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePrefilledMessage = (prefilledText) => {
    setMessage(prefilledText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {freelancerData?.fp_display_name?.charAt(0) || 'F'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {freelancerData?.fp_display_name || 'Freelancer'}
              </h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3e5a9a] mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Start a conversation with {freelancerData?.fp_display_name || 'this freelancer'}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-3">Quick messages:</p>
                {loadingPrefilled ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3e5a9a]"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading messages...</span>
                  </div>
                ) : (
                  prefilledMessages.map((msg, index) => (
                    <button
                      key={msg.id || index}
                      onClick={() => handlePrefilledMessage(msg.text)}
                      className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {msg.text}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.sender === 'me' ? 'ml-auto' : 'mr-auto'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                        msg.sender === 'me'
                          ? 'bg-[#3e5a9a] text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {msg.timestamp}
                        </span>
                        {msg.sending && (
                          <div className="ml-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3e5a9a] focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-[#3e5a9a] text-white p-3 rounded-xl hover:bg-[#2d4a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
