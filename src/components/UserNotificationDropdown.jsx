"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MdNotifications, 
  MdNotificationsNone, 
  MdClose
} from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { userNotificationAPI } from '@/config/api';

const UserNotificationDropdown = ({ userType = 'user' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  
  const { user } = useSelector(state => state.auth);

  // Fetch notifications on component mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await userNotificationAPI.getNotifications();
      
      if (response && response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(notification => !notification.is_read);
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read if it's not already read
      if (!notification.is_read) {
        await userNotificationAPI.markAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Parse the notification data to get the link
      const data = parseNotificationData(notification.data);
      
      // Navigate to the link if available
      if (data?.link) {
        router.push(data.link);
      } else {
        // Default navigation based on user type
        const defaultPath = getDefaultPath(userType);
        if (defaultPath) {
          router.push(defaultPath);
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      const data = parseNotificationData(notification.data);
      if (data?.link) {
        router.push(data.link);
      }
    }
    
    setIsOpen(false);
  };

  const getDefaultPath = (type) => {
    switch (type) {
      case 'freelancer':
        return '/freelancer-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const parseNotificationData = (dataString) => {
    try {
      return JSON.parse(dataString);
    } catch {
      return { title: 'Notification', message: 'Unable to parse notification data' };
    }
  };

  const recentNotifications = notifications.slice(0, 5); // Show only latest 5

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 hover:text-gray-800"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <MdNotifications size={20} className="text-gray-600" />
        ) : (
          <MdNotificationsNone size={20} className="text-gray-600" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              recentNotifications.map((notification) => {
                const data = parseNotificationData(notification.data);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {data.title || notification.title || 'Notification'}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p 
                          className="text-sm text-gray-600 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: data.message || notification.message || 'No message available' 
                          }}
                        />
                        {data.type && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {data.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const notificationsPath = getDefaultPath(userType) + '/notifications';
                  router.push(notificationsPath);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserNotificationDropdown;
