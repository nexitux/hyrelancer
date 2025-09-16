"use client";
import { useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, Video } from 'lucide-react';

export default function MessageBox() {
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(1);

    const [users] = useState([
        {
            id: 1,
            name: 'Alex Johnson',
            lastMessage: 'Same here! Want to collaborate on something cool?',
            timestamp: '2:35 PM',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: true
        },
        {
            id: 2,
            name: 'Sarah Chen',
            lastMessage: 'Thanks for the feedback on the design!',
            timestamp: '1:20 PM',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            unreadCount: 2,
            online: false
        },
        {
            id: 3,
            name: 'Michael Brown',
            lastMessage: 'The meeting is scheduled for tomorrow',
            timestamp: '11:45 AM',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: true
        },
        {
            id: 4,
            name: 'Emily Davis',
            lastMessage: 'Can you send me the project files?',
            timestamp: 'Yesterday',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            unreadCount: 1,
            online: false
        },
        {
            id: 5,
            name: 'Team Alpha',
            lastMessage: 'Great work everyone! 🎉',
            timestamp: 'Yesterday',
            avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: false
        }
    ]);

    const [messages, setMessages] = useState({
        1: [
            {
                id: 1,
                text: "Hey! How's your day going?",
                sender: 'other',
                timestamp: '2:30 PM'
            },
            {
                id: 2,
                text: "Pretty good! Just working on some new designs. What about you?",
                sender: 'me',
                timestamp: '2:32 PM'
            },
            {
                id: 3,
                text: "Same here! Want to collaborate on something cool?",
                sender: 'other',
                timestamp: '2:35 PM'
            }
        ],
        2: [
            {
                id: 1,
                text: "I've reviewed your latest design mockups",
                sender: 'other',
                timestamp: '1:15 PM'
            },
            {
                id: 2,
                text: "Thanks for the feedback on the design!",
                sender: 'other',
                timestamp: '1:20 PM'
            }
        ]
    });

    const selectedUserData = users.find(user => user.id === selectedUser);
    const currentMessages = messages[selectedUser] || [];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: (currentMessages.length || 0) + 1,
                text: message,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => ({
                ...prev,
                [selectedUser]: [...(prev[selectedUser] || []), newMessage]
            }));
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (

        <div className="w-full max-w-[1600px] mx-auto">

            {/* Messages Header */}
            <div className="flex-shrink-0 p-4 sm:p-6">
                <h1 className="text-xl font-bold sm:text-2xl text-slate-800">Messages</h1>
            </div>

            {/* Messages Container */}
            <div className="overflow-hidden mx-4 bg-white rounded-lg border shadow-lg border-slate-200 sm:mx-6" style={{ height: 'calc(100vh - 180px)' }}>
                <div className="flex flex-col h-full sm:flex-row">
                    {/* Users Sidebar */}
                    <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 lg:w-1/4 bg-slate-50 border-r border-slate-200 flex-col`}>
                        {/* Search Header */}
                        <div className="flex-shrink-0 p-3 border-b bg-slate-100 border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="py-2 pr-3 pl-9 w-full text-sm bg-white rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="overflow-y-auto flex-1">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`flex items-center p-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors ${selectedUser === user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="object-cover w-10 h-10 rounded-full"
                                        />
                                        {user.online && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 ml-3 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-medium truncate text-slate-900">{user.name}</h3>
                                            <span className="text-xs text-slate-500">{user.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mt-0.5">{user.lastMessage}</p>
                                    </div>
                                    {user.unreadCount > 0 && (
                                        <div className="flex justify-center items-center ml-2 w-4 h-4 text-xs text-white bg-green-500 rounded-full">
                                            {user.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedUser ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-slate-25`}>
                        {/* Chat Header */}
                        <div className="flex flex-shrink-0 justify-between items-center px-3 py-3 bg-blue-50 sm:px-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1 mr-2 rounded-full transition-colors sm:hidden hover:bg-blue-700"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="relative">
                                    <img
                                        src={selectedUserData?.avatar}
                                        alt={selectedUserData?.name}
                                        className="object-cover w-8 h-8 rounded-full ring-2 ring-blue-300 sm:w-9 sm:h-9"
                                    />
                                    {selectedUserData?.online && (
                                        <div className="absolute right-0 bottom-0 w-2 h-2 bg-green-400 rounded-full ring ring-blue-600"></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-600 sm:text-base">{selectedUserData?.name}</h2>
                                    <p className="hidden text-xs text-blue-500 sm:block">
                                        {selectedUserData?.online ? 'Online' : 'Last seen recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                {/* <button className="p-1.5 hover:bg-blue-700 rounded-full transition-colors hidden sm:block">
                                    <Video className="w-4 h-4 text-white" />
                                </button>
                                <button className="p-1.5 hover:bg-blue-700 rounded-full transition-colors">
                                    <Phone className="w-4 h-4 text-white" />
                                </button> */}
                                <button className="p-1.5 hover:bg-blue-200 rounded-full transition-colors hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="overflow-y-auto flex-1 p-2 sm:p-3 bg-slate-50">
                            <div className="space-y-2 sm:space-y-3">
                                {currentMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md ${msg.sender === 'me' ? 'order-1' : 'order-2'}`}>
                                            <div
                                                className={`px-3 py-2 rounded-lg shadow-sm text-sm ${msg.sender === 'me'
                                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200'
                                                    }`}
                                            >
                                                <p className="leading-relaxed">{msg.text}</p>
                                                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-green-100' : 'text-slate-500'}`}>
                                                    {msg.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="flex-shrink-0 p-2 bg-white border-t border-slate-200 sm:p-3">
                            <div className="flex justify-center items-center space-x-2">
                                {/* <button className="hidden flex-shrink-0 p-2 rounded-full transition-colors hover:bg-slate-100 sm:block">
                                    <Paperclip className="w-4 h-4 text-slate-600" />
                                </button> */}

                                <div className="flex-1">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="w-full px-3 py-2 pr-8 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 resize-none transition-all max-h-16 min-h-[36px] text-sm"
                                        rows={1}
                                    />
                                    {/* <button className="absolute right-2 top-1/2 p-1 rounded-full transition-colors transform -translate-y-1/2 hover:bg-slate-200">
                                        <Smile className="w-4 h-4 text-slate-500" />
                                    </button> */}
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="flex-shrink-0 p-3 text-white bg-green-500 rounded-full transition-all cursor-pointer hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}   