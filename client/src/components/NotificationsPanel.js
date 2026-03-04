import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './NotificationsPanel.css';

const NotificationsPanel = ({ token, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');

  // Initialiser Socket.IO
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('new_notification', (notification) => {
      console.log('Nouvelle notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('message_received', (data) => {
      // Créer une notification pour le nouveau message
      const notification = {
        _id: Date.now(),
        type: 'message',
        sender: data.sender,
        title: data.sender.username,
        content: data.content,
        isRead: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  // Charger les notifications
  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/notifications?unreadOnly=false',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(response.data.notifications || []);
      const unread = response.data.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/all/read',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const notif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (!notif?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'group_invite':
        return '👥';
      case 'mention':
        return '📢';
      case 'reaction':
        return '😊';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return '#007bff';
      case 'group_invite':
        return '#17a2b8';
      case 'mention':
        return '#ffc107';
      case 'reaction':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="notifications-panel">
      {/* Bouton cloche */}
      <button
        className="notifications-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>🔔 Notifications</h3>
            <button
              className="close-dropdown"
              onClick={() => setIsOpen(false)}
              title="Fermer"
            >
              ✕
            </button>
          </div>

          {unreadCount > 0 && (
            <div className="dropdown-actions">
              <button
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            </div>
          )}

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous ({notifications.length})
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Non lus ({unreadCount})
            </button>
          </div>

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <p>Pas de notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(notif => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  style={{
                    borderLeftColor: getNotificationColor(notif.type)
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="notification-content">
                    <p className="notification-title">
                      {notif.title || notif.sender?.username}
                    </p>
                    <p className="notification-message">
                      {notif.content || notif.message?.content || 'Nouveau message'}
                    </p>
                    <p className="notification-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="notification-actions">
                    {!notif.isRead && (
                      <button
                        className="btn-read"
                        onClick={() => handleMarkAsRead(notif._id)}
                        title="Marquer comme lu"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteNotification(notif._id)}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
