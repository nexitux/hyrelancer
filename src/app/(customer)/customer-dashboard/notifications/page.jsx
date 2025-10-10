"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  MdNotifications, 
  MdNotificationsNone, 
  MdMarkEmailRead,
  MdRefresh,
  MdArrowBack
} from 'react-icons/md';
import { userNotificationAPI } from '@/config/api';

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const router = useRouter();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await userNotificationAPI.getNotifications();
      
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(notificationId);
      await userNotificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => userNotificationAPI.markAsRead(n.id)));
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </button> */}
              <div className="flex items-center">
                <MdNotifications className="w-6 h-6 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-2 py-1">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchNotifications}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <MdRefresh className="w-5 h-5 text-gray-600" />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MdMarkEmailRead className="w-4 h-4 mr-2" />
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <MdNotificationsNone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">You'll see notifications about your job posts, freelancer applications, and account updates here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const data = parseNotificationData(notification.data);
              const isUnread = !notification.is_read;
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
                    isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          isUnread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {data.title || notification.title || 'Notification'}
                        </h3>
                        <span className="ml-auto text-sm text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      
                      <div 
                        className="text-gray-700 mb-4"
                        dangerouslySetInnerHTML={{ 
                          __html: data.message || notification.message || 'No message available' 
                        }}
                      />
                      
                      {data.type && (
                        <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                          {data.type}
                        </span>
                      )}
                    </div>
                    
                    {isUnread && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        disabled={markingAsRead === notification.id}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Mark as read"
                      >
                        {markingAsRead === notification.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MdMarkEmailRead className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerNotifications;
