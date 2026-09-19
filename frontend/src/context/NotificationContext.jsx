import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/notifications/unread/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification');
    }
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
