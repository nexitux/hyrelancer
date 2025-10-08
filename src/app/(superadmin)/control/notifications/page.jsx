"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MdNotifications, 
  MdRefresh,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import { fetchNotifications, markNotificationAsRead } from '../../../../redux/slices/adminSlice';
import { useRouter } from 'next/navigation';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { notifications, unreadCount } = useSelector(state => state.admin);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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

  const parseNotificationData = (dataString) => {
    try {
      return JSON.parse(dataString);
    } catch {
      return { title: 'Notification', message: 'Unable to parse notification data' };
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read if it's not already read
      if (!notification.is_read) {
        await dispatch(markNotificationAsRead(notification.id));
      }
      
      // Parse the notification data to get the link
      const data = parseNotificationData(notification.data);
      
      // Navigate to the link if available
      if (data?.link) {
        const url = new URL(data.link);
        const path = url.pathname.replace('/api/admin', '/control');
        router.push(path);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      const data = parseNotificationData(notification.data);
      if (data?.link) {
        const url = new URL(data.link);
        const path = url.pathname.replace('/api/admin', '/control');
        router.push(path);
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdNotifications size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  {unreadCount} unread notifications
                </p>
              </div>
            </div>
            
            <button
              onClick={() => dispatch(fetchNotifications())}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh notifications"
            >
              <MdRefresh size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <MdNotifications size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {currentNotifications.map((notification) => {
                  const data = parseNotificationData(notification.data);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Notification indicator */}
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {data.title}
                              </h3>
                              <div 
                                className="text-gray-600 mb-2"
                                dangerouslySetInnerHTML={{ __html: data.message }}
                              />
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{formatTimeAgo(notification.created_at)}</span>
                                <span>{formatDate(notification.created_at)}</span>
                                {data.teType && (
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {data.teType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, notifications.length)} of {notifications.length} notifications
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MdChevronLeft size={20} />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MdChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
