import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>TalkMe - Chat en Temps Réel</h1>
          {isAuthenticated && (
            <div className="user-info">
              <span>Bienvenue, {user?.username}</span>
              <button onClick={handleLogout}>Déconnexion</button>
            </div>
          )}
        </header>

        <Routes>
          <Route
            path="/auth"
            element={
              !isAuthenticated ? (
                <AuthPage onAuthSuccess={handleAuthSuccess} />
              ) : (
                <Navigate to="/chat" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <div className="chat-placeholder">
                  <h2>Bienvenue dans le chat, {user?.username}!</h2>
                  <p>Interface de chat en cours de développement...</p>
                </div>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/auth"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
