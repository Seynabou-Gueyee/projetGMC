import React, { useState, useEffect } from 'react';
import './RoomUsers.css';

const RoomUsers = ({ room, socket, currentUserId }) => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!socket || !room) return;

    // Écouter les utilisateurs qui rejoignent le salon
    socket.on('user_joined', (data) => {
      if (data.room === room._id || data.room === room.name) {
        setActiveUsers(prevUsers => {
          const userExists = prevUsers.find(u => u.id === data.userId);
          if (!userExists) {
            return [...prevUsers, { id: data.userId, joinedAt: new Date() }];
          }
          return prevUsers;
        });
      }
    });

    // Écouter les utilisateurs qui quittent le salon
    socket.on('user_left', (data) => {
      if (data.room === room._id || data.room === room.name) {
        setActiveUsers(prevUsers =>
          prevUsers.filter(user => user.id !== data.userId)
        );
      }
    });

    // Initialiser avec les membres du salon
    if (room.members && room.members.length > 0) {
      const initialUsers = room.members.map(member => ({
        id: member._id || member,
        username: member.username || 'Utilisateur',
        email: member.email || ''
      }));
      setActiveUsers(initialUsers);
    }

    return () => {
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, room]);

  return (
    <div className="room-users-container">
      <h4>Utilisateurs en ligne ({activeUsers.length})</h4>
      {activeUsers.length === 0 ? (
        <p className="no-users">Aucun utilisateur en ligne</p>
      ) : (
        <ul className="users-list">
          {activeUsers.map(user => (
            <li key={user.id} className={`user-item ${user.id === currentUserId ? 'current-user' : ''}`}>
              <span className="user-avatar">
                {(user.username || user.id).charAt(0).toUpperCase()}
              </span>
              <span className="user-name">
                {user.username || 'Utilisateur'}
                {user.id === currentUserId && <span className="you-badge"> (Vous)</span>}
              </span>
              <span className="user-status online"></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomUsers;
