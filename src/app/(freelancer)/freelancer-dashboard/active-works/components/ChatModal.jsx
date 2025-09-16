import React, { useState } from 'react';
import { X, Send, MapPin } from 'lucide-react';

const ChatModal = ({ isOpen, onClose, companyName = "PrimeEdge Solutions", location = "Las Vegas, USA" }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "How was your weekend?",
      time: "11:28 AM",
      sender: "company",
      isFirstMessage: true
    },
    {
      id: 2,
      text: "Hi, John! It was great, thanks for asking. I went hiking with some friends. How about you?",
      time: "11:30 AM",
      sender: "user"
    },
    {
      id: 3,
      text: "By the way, did you hear about the new project our team is starting?",
      time: "09:30 AM",
      sender: "company",
      date: "April 22, 2024"
    },
    {
      id: 4,
      text: "Yes, I did! It sounds exciting. Are you involved in it?",
      time: "11:30 AM",
      sender: "user"
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: "user"
      };
      setMessages([...messages, newMessage]);
      setMessage('');
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
          {messages.map((msg, index) => (
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
              className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;