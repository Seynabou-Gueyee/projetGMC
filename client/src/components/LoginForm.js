import React, { useState } from 'react';
import axios from 'axios';
import './Forms.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData, {
        timeout: 15000 // 15 secondes de timeout
      });
      
      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userAvatar', response.data.user.avatar || '');

      // Appeler le callback
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('⚠️ Timeout - Le serveur ne répond pas. Assurez-vous que MongoDB est configuré (voir MONGODB_SETUP.md)');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Erreur de connexion');
      } else if (err.code === 'ERR_NETWORK') {
        setError('❌ Erreur réseau - Le serveur n\'est pas accessible sur http://localhost:5000');
      } else {
        setError(err.response?.data?.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Connexion</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Entrez votre email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Entrez votre mot de passe"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
