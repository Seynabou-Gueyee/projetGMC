import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './AuthPage.css';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    navigate('/chat');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-container">
          <img src="/logo.svg" alt="TalkMe Logo" className="auth-logo" />
          <h1>TalkMe</h1>
          <p className="auth-tagline">Chat en Temps Réel avec Vos Amis</p>
        </div>

        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Connexion
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Inscription
          </button>
        </div>

        <div className="auth-form">
          {isLogin ? (
            <LoginForm onLoginSuccess={handleAuthSuccess} />
          ) : (
            <RegisterForm onRegisterSuccess={handleAuthSuccess} />
          )}
        </div>

        <div className="auth-toggle-text">
          {isLogin ? (
            <p>Pas encore inscrit ? <button onClick={() => setIsLogin(false)}>S'inscrire</button></p>
          ) : (
            <p>Déjà inscrit ? <button onClick={() => setIsLogin(true)}>Se connecter</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
