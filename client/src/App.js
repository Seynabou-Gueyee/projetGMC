import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
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
          <div className="header-logo-container">
            <img src="/logo.svg" alt="TalkMe Logo" className="app-logo" />
            <h1>TalkMe</h1>
          </div>
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
                <ChatPage 
                  user={user}
                  token={localStorage.getItem('token')}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/auth"} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
