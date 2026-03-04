import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatRoomList.css';

const ChatRoomList = ({ token, onRoomSelect, onRoomJoined }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinedRooms, setJoinedRooms] = useState([]);

  // Récupérer la liste des salons au montage du composant
  useEffect(() => {
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'http://localhost:5000/api/chat-rooms',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRooms(response.data.rooms);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des salons');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/chat-rooms/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Ajouter le salon à la liste des salons rejoints
      setJoinedRooms([...joinedRooms, roomId]);

      // Appeler le callback
      if (onRoomJoined) {
        onRoomJoined(response.data.room);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion au salon');
    }
  };

  const handleSelectRoom = (room) => {
    if (onRoomSelect) {
      onRoomSelect(room);
    }
  };

  if (loading) {
    return <div className="chat-room-list-container">Chargement des salons...</div>;
  }

  return (
    <div className="chat-room-list-container">
      <h3>Salons disponibles</h3>
      {error && <div className="error-message">{error}</div>}

      {rooms.length === 0 ? (
        <p className="no-rooms">Aucun salon disponible</p>
      ) : (
        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-header">
                <h4>{room.name}</h4>
                <span className="room-creator">par {room.createdBy?.username}</span>
              </div>

              {room.description && (
                <p className="room-description">{room.description}</p>
              )}

              <div className="room-footer">
                <span className="room-members">
                  {room.members?.length || 0} membre(s)
                </span>
                <button
                  className={`join-button ${joinedRooms.includes(room._id) ? 'joined' : ''}`}
                  onClick={() => 
                    joinedRooms.includes(room._id) 
                      ? handleSelectRoom(room)
                      : handleJoinRoom(room._id)
                  }
                >
                  {joinedRooms.includes(room._id) ? 'Visiter' : 'Rejoindre'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="refresh-button" onClick={fetchRooms}>
        Rafraîchir
      </button>
    </div>
  );
};

export default ChatRoomList;
