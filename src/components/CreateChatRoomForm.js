import React, { useState } from 'react';
import axios from 'axios';
import './ChatRoomForm.css';

const CreateChatRoomForm = ({ onRoomCreated, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Le nom du salon est requis');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat-rooms',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Appeler le callback
      if (onRoomCreated) {
        onRoomCreated(response.data.room);
      }

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du salon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-chat-room-form-container">
      <h3>Créer un nouveau salon</h3>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du salon :</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Entrez le nom du salon"
            maxLength="50"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description :</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez le salon (optionnel)"
            maxLength="200"
            rows="3"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer le salon'}
        </button>
      </form>
    </div>
  );
};

export default CreateChatRoomForm;
