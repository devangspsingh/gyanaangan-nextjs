'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications } from '@/services/apiService';

const LOCAL_STORAGE_READ_NOTIFICATIONS_KEY = 'gyanAanganReadNotificationIds';

const getReadNotificationIdsFromLocalStorage = () => {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem(LOCAL_STORAGE_READ_NOTIFICATIONS_KEY);
  try {
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (e) {
    console.error("Failed to parse read notification IDs from localStorage", e);
    return new Set();
  }
};

const addReadNotificationIdToLocalStorage = (id) => {
  if (typeof window === 'undefined') return;
  const currentIds = getReadNotificationIdsFromLocalStorage();
  currentIds.add(id);
  localStorage.setItem(LOCAL_STORAGE_READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(currentIds)));
};

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndProcessNotifications = useCallback(async () => {
    setIsLoading(true);
    const response = await getNotifications(1, 20); // Fetch a decent number for unread check, e.g., 20
    const localReadIds = getReadNotificationIdsFromLocalStorage();
    setReadNotificationIds(localReadIds);

    if (!response.error && response.data && response.data.results) {
      const fetchedNotifications = response.data.results;
      setNotifications(fetchedNotifications);
      const anyUnread = fetchedNotifications.some(n => !localReadIds.has(n.id));
      setHasUnread(anyUnread);
    } else {
      setNotifications([]);
      setHasUnread(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAndProcessNotifications();
    // Optional: Set up an interval to periodically refresh notifications
    // const intervalId = setInterval(fetchAndProcessNotifications, 60000 * 5); // every 5 minutes
    // return () => clearInterval(intervalId);
  }, [fetchAndProcessNotifications]);

  const markNotificationAsRead = useCallback((notificationId) => {
    addReadNotificationIdToLocalStorage(notificationId);
    const newReadIds = new Set(readNotificationIds).add(notificationId);
    setReadNotificationIds(newReadIds);
    // Re-evaluate hasUnread based on the current list of notifications in context
    const anyUnread = notifications.some(n => !newReadIds.has(n.id));
    setHasUnread(anyUnread);
  }, [readNotificationIds, notifications]);
  
  const refreshNotifications = useCallback(() => {
    fetchAndProcessNotifications();
  }, [fetchAndProcessNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, hasUnread, isLoading, markNotificationAsRead, readNotificationIds, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
