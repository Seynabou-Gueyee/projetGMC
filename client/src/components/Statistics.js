import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css';

const Statistics = ({ token }) => {
  const [stats, setStats] = useState({
    messagesToday: 0,
    activeUsers: 0,
    totalMessages: 0,
    messagesByHour: [],
    topSenders: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today'); // today, week, month

  useEffect(() => {
    fetchStatistics();
    // Actualiser les stats toutes les minutes
    const interval = setInterval(fetchStatistics, 60000);
    return () => clearInterval(interval);
  }, [period, token]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/statistics/messages?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="statistics-loading">Chargement des statistiques...</div>;
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h3>📊 Statistiques</h3>
        <div className="period-selector">
          <button 
            className={period === 'today' ? 'active' : ''}
            onClick={() => setPeriod('today')}
          >
            Aujourd'hui
          </button>
          <button 
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Cette semaine
          </button>
          <button 
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Ce mois
          </button>
        </div>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-label">Messages</div>
            <div className="stat-value">{stats.messagesToday}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Utilisateurs actifs</div>
            <div className="stat-value">{stats.activeUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Total messages</div>
            <div className="stat-value">{stats.totalMessages}</div>
          </div>
        </div>
      </div>

      {stats.messagesByHour && stats.messagesByHour.length > 0 && (
        <div className="statistics-section">
          <h4>Messages par heure</h4>
          <div className="chart-simple">
            {stats.messagesByHour.map((point, idx) => (
              <div key={idx} className="chart-bar" style={{ height: `${point.count * 2}px` }} title={`${point.hour}:00 - ${point.count} messages`}>
                <span className="bar-label">{point.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topSenders && stats.topSenders.length > 0 && (
        <div className="statistics-section">
          <h4>Utilisateurs les plus actifs</h4>
          <div className="top-senders">
            {stats.topSenders.map((sender, idx) => (
              <div key={idx} className="sender-item">
                <div className="sender-rank">#{idx + 1}</div>
                <div className="sender-name">{sender.username}</div>
                <div className="sender-count">{sender.messageCount} messages</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
