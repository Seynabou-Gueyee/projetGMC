import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MessageForm from './MessageForm';
import FileUploader from './FileUploader';
import RoomUsers from './RoomUsers';
import Message from './Message';
import SearchMessages from './SearchMessages';
import PinnedMessages from './PinnedMessages';
import './ChatRoom.css';

const ChatRoom = ({ room, user, token }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  // Drag & drop state
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Initialiser Socket.IO et charger les messages historiques
  useEffect(() => {
    if (!room || !token) return;

    // Créer la connexion Socket.IO
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      // Rejoindre le salon
      newSocket.emit('join_room', room._id || room.id);
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, {
        _id: data._id,
        userId: data.userId,
        senderName: data.senderName,
        content: data.content,
        room: data.room,
        timestamp: data.timestamp || data.createdAt || new Date(),
        sender: data.sender,
        createdAt: data.createdAt || data.timestamp,
        attachments: data.attachments || [],
        linkPreview: data.linkPreview || null,
        emojiReactions: data.emojiReactions || []
      }]);
      
      // Nettoyer l'indicateur typing
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[data.userId];
        return newTyping;
      });
    });

    newSocket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.username
        }));
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[data.userId];
        return newTyping;
      });
    });

    // Événement: Message édité
    newSocket.on('message_edited', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
          : msg
      ));
    });

    // Événement: Message supprimé
    newSocket.on('message_deleted', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, isDeleted: true }
          : msg
      ));
    });

    // Événement: Réaction ajoutée
    newSocket.on('reaction_added', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    // Événement: Réaction retirée
    newSocket.on('reaction_removed', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    // Événement: Réaction emoji ajoutée
    newSocket.on('emoji_reaction_added', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, emojiReactions: data.emojiReactions }
          : msg
      ));
    });

    // Événement: Réaction emoji retirée
    newSocket.on('emoji_reaction_removed', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, emojiReactions: data.emojiReactions }
          : msg
      ));
    });

    // Événement: Message marqué comme lu
    newSocket.on('message_read', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, readBy: data.readBy }
          : msg
      ));
    });

    // Événement: Message épinglé
    newSocket.on('message_pinned', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, isPinned: true, pinnedAt: data.pinnedAt }
          : msg
      ));
    });

    // Événement: Message dépinglé
    newSocket.on('message_unpinned', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, isPinned: false }
          : msg
      ));
    });

    // Événement: Confirmation de livraison
    newSocket.on('message_delivered', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data._id
          ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
          : msg
      ));
    });

    setSocket(newSocket);

    // Charger les messages historiques
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/room/${room._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setMessages(response.data.messages || []);
        // Activer le scroll automatique après le chargement initial
        shouldAutoScroll.current = true;
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
      }
    };
    fetchMessages();

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', room._id || room.id);
        newSocket.disconnect();
      }
    };
  }, [room, token]);

  // Auto-scroll vers les nouveaux messages (amélioré)
  useEffect(() => {
    if (shouldAutoScroll.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
    } else if (!shouldAutoScroll.current && messages.length > 0) {
      // Il y a des nouveaux messages mais l'utilisateur a scrollé vers le haut
      setHasNewMessages(true);
    }
  }, [messages]);

  // Détecter le scroll de l'utilisateur
  const handleScroll = (e) => {
    const element = e.target;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    shouldAutoScroll.current = isNearBottom;
  };

  // Envoyer un message via Socket.IO
  const handleSendMessage = async (messageData) => {
    if (!socket) {
      console.error('Socket.IO non connecté');
      return;
    }

    setLoading(true);

    try {
      // Si messageData est un string (compatibilité avec ancien format)
      if (typeof messageData === 'string') {
        socket.emit('send_message', {
          content: messageData,
          room: room._id || room.id
        });
      } else {
        // Nouveau format avec attachments et linkPreview
        const attachments = [];
        
        // Uploader les fichiers s'il y en a
        if (messageData.attachments && messageData.attachments.length > 0) {
          const formData = new FormData();
          messageData.attachments.forEach((file) => {
            formData.append('files', file.file || file);
          });

          try {
            const uploadResponse = await axios.post(
              'http://localhost:5000/api/uploads/multiple',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (uploadResponse.data.files) {
              attachments.push(...uploadResponse.data.files);
            }
          } catch (uploadErr) {
            console.error('Erreur lors de l\'upload des fichiers:', uploadErr);
            alert('Erreur lors de l\'upload des fichiers');
          }
        }

        socket.emit('send_message', {
          content: messageData.content,
          room: room._id || room.id,
          attachments: attachments,
          linkPreview: messageData.linkPreview || null
        });
      }
      
      shouldAutoScroll.current = true;
      // Nettoyer les fichiers après envoi réussi
      setSelectedFiles([]);
      setShowFileUploader(false);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop handler for chat area
  const handleDropFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFileUploader(true);
    if (e.dataTransfer?.files?.length) {
      // Transformer les fichiers du drag&drop comme FileUploader le fait
      const files = Array.from(e.dataTransfer.files);
      const fileData = files.map(file => ({
        file,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file',
        name: file.name,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setSelectedFiles(fileData);
    }
  };

  const handleDragOverFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="chat-room-container" onDrop={handleDropFiles} onDragOver={handleDragOverFiles}>
      <div className="chat-header">
        <div className="header-content">
          <h2>{room.name}</h2>
          {room.description && <p>{room.description}</p>}
        </div>
        <div className="header-actions">
          <button 
            className="header-btn" 
            onClick={() => setShowSearch(!showSearch)}
            title="Rechercher des messages"
          >
            🔍
          </button>
          <button 
            className="header-btn" 
            onClick={() => setShowPinned(!showPinned)}
            title="Messages épinglés"
          >
            📌
          </button>
        </div>
      </div>

      <div className="chat-content">
        <div className="messages-section">
          <div className="messages-list" onScroll={handleScroll}>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Aucun message. Soyez le premier à écrire!</p>
              </div>
            ) : (
              messages.map((msg) => (
                !msg.isDeleted && (
                  <Message
                    key={msg._id}
                    message={msg}
                    currentUserId={user?.id}
                    socket={socket}
                    room={room}
                  />
                )
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {hasNewMessages && (
            <div className="new-messages-indicator">
              <button onClick={() => {
                shouldAutoScroll.current = true;
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}>
                ⬇️ Nouveaux messages
              </button>
            </div>
          )}

          {Object.keys(typingUsers).length > 0 && (
            <div className="typing-indicator">
              <p>
                {Object.values(typingUsers).join(', ')} 
                {Object.keys(typingUsers).length === 1 ? ' est en train d\'écrire' : ' sont en train d\'écrire'}...
              </p>
            </div>
          )}

          {/* Zone drag & drop fichiers */}
          {showFileUploader && (
            <div style={{ marginBottom: 12 }}>
              <FileUploader
                onFilesSelected={setSelectedFiles}
                maxSize={100 * 1024 * 1024}
              />
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>📎 Fichiers à envoyer ({selectedFiles.length}):</strong>
                  <ul style={{ marginTop: 4 }}>
                    {selectedFiles.map((fileData, idx) => {
                      const file = fileData.file || fileData;
                      return (
                        <li key={idx} style={{ fontSize: '12px' }}>
                          {fileData.type && <span>{fileData.type === 'image' ? '🖼️' : fileData.type === 'video' ? '🎥' : fileData.type === 'audio' ? '🎧' : '📄'} </span>}
                          {file.name} ({(file.size/1024/1024).toFixed(2)}MB)
                          <button 
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{ marginLeft: 8, cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          <MessageForm 
            onSendMessage={data => handleSendMessage({ ...data, attachments: [...(data.attachments||[]), ...selectedFiles] })}
            disabled={loading || !socket}
            placeholder="Écrivez un message... (ou glissez-déposez un fichier)"
            socket={socket}
            room={room}
          />
        </div>

        <aside className="sidebar">
          <RoomUsers room={room} socket={socket} currentUserId={user?.id} />
        </aside>
      </div>

      <SearchMessages 
        token={token}
        room={room}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSearchResults={setSearchResults}
      />

      <PinnedMessages 
        messages={messages}
        isOpen={showPinned}
        onClose={() => setShowPinned(false)}
        socket={socket}
        room={room}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default ChatRoom;
