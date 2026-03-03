import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JoinedChatRooms.css';

const JoinedChatRooms = ({ token, joinedRoomsIds = [], onSelectRoom, onRoomLeft }) => {
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les détails des salons rejoints
  useEffect(() => {
    if (joinedRoomsIds.length > 0) {
      fetchJoinedRoomsDetails();
    }
  }, [joinedRoomsIds, token]);

  const fetchJoinedRoomsDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const roomsData = await Promise.all(
        joinedRoomsIds.map(roomId =>
          axios.get(
            `http://localhost:5000/api/chat-rooms/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        )
      );
      setJoinedRooms(roomsData.map(res => res.data.room));
    } catch (err) {
      setError('Erreur lors du chargement des salons rejoints');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/chat-rooms/${roomId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Retirer le salon de la liste
      setJoinedRooms(joinedRooms.filter(room => room._id !== roomId));

      // Appeler le callback
      if (onRoomLeft) {
        onRoomLeft(roomId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la déconnexion au salon');
    }
  };

  const handleSelectRoom = (room) => {
    if (onSelectRoom) {
      onSelectRoom(room);
    }
  };

  if (joinedRoomsIds.length === 0) {
    return (
      <div className="joined-chat-rooms-container">
        <h3>Mes salons</h3>
        <p className="no-rooms">Aucun salon rejoint. Rejoignez un salon pour commencer.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="joined-chat-rooms-container">
        <h3>Mes salons</h3>
        <p>Chargement des salons...</p>
      </div>
    );
  }

  return (
    <div className="joined-chat-rooms-container">
      <h3>Mes salons ({joinedRooms.length})</h3>
      {error && <div className="error-message">{error}</div>}

      <div className="joined-rooms-list">
        {joinedRooms.map(room => (
          <div key={room._id} className="joined-room-item">
            <div className="room-info">
              <h4>{room.name}</h4>
              {room.description && (
                <p className="room-description">{room.description}</p>
              )}
              <span className="room-members">
                {room.members?.length || 0} membre(s)
              </span>
            </div>

            <div className="room-actions">
              <button 
                className="enter-button"
                onClick={() => handleSelectRoom(room)}
              >
                Accéder
              </button>
              <button 
                className="leave-button"
                onClick={() => handleLeaveRoom(room._id)}
              >
                Quitter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinedChatRooms;
