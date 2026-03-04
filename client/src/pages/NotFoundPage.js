import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas</p>
        
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
