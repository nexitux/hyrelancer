"use client";
import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([
    {
    id: 1,
    type: 'info',
    title: 'New Project Match',
    message: 'A new project "React Native e-commerce" matches your skills. Bid now!',
    time: 'just now',
    unread: true
  },
  {
    id: 2,
    type: 'info',
    title: 'New Message from Client',
    message: 'Client "Arjun Tech" sent you a message about the proposal for Mobile App Dev.',
    time: '5 minutes ago',
    unread: true
  },
  {
    id: 3,
    type: 'success',
    title: 'Proposal Accepted',
    message: 'Your proposal for "Landing Page Redesign" was accepted by Priya.',
    time: '12 minutes ago',
    unread: true
  },
  {
    id: 4,
    type: 'success',
    title: 'Milestone Paid',
    message: 'Milestone 1 for "Website Migration" has been paid — ₹12,500 deposited to your account.',
    time: '1 hour ago',
    unread: false
  },
  {
    id: 5,
    type: 'info',
    title: 'New Review Received',
    message: 'You received a 5★ review from "Ravi Kumar" for "SEO Optimization".',
    time: '3 hours ago',
    unread: false
  },
  {
    id: 6,
    type: 'success',
    title: 'Profile Viewed',
    message: 'Your profile was viewed 27 times in the last 24 hours.',
    time: '8 hours ago',
    unread: false
  },
  {
    id: 7,
    type: 'warning',
    title: 'Contract Ending Soon',
    message: 'Your contract with "Zen Solutions" ends in 3 days — consider offering an extension.',
    time: '1 day ago',
    unread: false
  },
  {
    id: 8,
    type: 'warning',
    title: 'Payment Issue',
    message: 'A payout to your bank failed — please update payment details to avoid delays.',
    time: '2 days ago',
    unread: false
  }
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white dark:bg-gray-800 h-full rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-128 overflow-y-auto scrollbar-hide">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border transition-colors ${
              notification.unread
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                    {notification.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {notification.unread && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-500 hover:text-blue-600 text-xs"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;