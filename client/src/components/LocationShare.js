import React, { useState, useEffect } from 'react';
import './LocationShare.css';

/**
 * Composant pour afficher une localisation sur une carte simple
 */
export const LocationPreview = ({ location, onRemove }) => {
  if (!location) return null;

  const { latitude, longitude, address, accuracy } = location;

  return (
    <div className="location-preview">
      <div className="location-header">
        <span className="location-icon">📍</span>
        <span className="location-title">Localisation partagée</span>
        {onRemove && (
          <button
            className="remove-location-btn"
            onClick={onRemove}
            title="Supprimer la localisation"
          >
            ✕
          </button>
        )}
      </div>

      <div className="location-map">
        <iframe
          title="Location map"
          width="100%"
          height="200"
          frameBorder="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
          style={{ borderRadius: '8px' }}
        />
      </div>

      <div className="location-details">
        <div className="location-coords">
          <span className="coord-label">Latitude:</span>
          <span className="coord-value">{latitude.toFixed(6)}</span>
        </div>
        <div className="location-coords">
          <span className="coord-label">Longitude:</span>
          <span className="coord-value">{longitude.toFixed(6)}</span>
        </div>
        {accuracy && (
          <div className="location-coords">
            <span className="coord-label">Précision:</span>
            <span className="coord-value">{accuracy.toFixed(2)}m</span>
          </div>
        )}
        {address && (
          <div className="location-address">
            <span className="address-label">Adresse:</span>
            <span className="address-value">{address}</span>
          </div>
        )}
      </div>

      <div className="location-footer">
        <a
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="view-map-btn"
        >
          Voir sur Google Maps
        </a>
      </div>
    </div>
  );
};

/**
 * Composant pour afficher une localisation dans un message
 */
export const LocationMessage = ({ location, isAuthor }) => {
  if (!location) return null;

  const { latitude, longitude, address, accuracy, timestamp } = location;

  return (
    <div className={`location-message ${isAuthor ? 'author' : ''}`}>
      <div className="location-marker">📍 Localisation</div>

      <div className="location-map-small">
        <iframe
          title="Location map"
          width="100%"
          height="180"
          frameBorder="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
          style={{ borderRadius: '6px' }}
        />
      </div>

      {address && (
        <div className="location-address-display">
          {address}
        </div>
      )}

      <div className="location-coords-display">
        <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        {accuracy && <span>±{accuracy.toFixed(0)}m</span>}
      </div>

      <a
        href={`https://maps.google.com/?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="view-location-link"
      >
        Ouvrir Maps →
      </a>

      {timestamp && (
        <div className="location-time">
          {new Date(timestamp).toLocaleTimeString('fr-FR')}
        </div>
      )}
    </div>
  );
};

/**
 * Hook pour gérer la localisation
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt');

  useEffect(() => {
    // Vérifier la permission au montage
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setPermission(result.state);
          result.addEventListener('change', () => {
            setPermission(result.state);
          });
        })
        .catch(() => {
          // Permissions API non supportée
        });
    }
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Essayer d'obtenir l'adresse via reverse geocoding
        let address = null;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          address = data.address?.city || data.address?.town || data.address?.country;
        } catch (err) {
          console.log('Reverse geocoding failed:', err);
        }

        setLocation({
          latitude,
          longitude,
          accuracy,
          address,
          timestamp: new Date().toISOString()
        });

        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Erreur lors de la récupération de la localisation';
        
        if (err.code === 1) {
          errorMsg = 'Permission de localisation refusée';
        } else if (err.code === 2) {
          errorMsg = 'Position indisponible';
        } else if (err.code === 3) {
          errorMsg = 'Délai d\'attente dépassé';
        }

        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    permission,
    getCurrentLocation,
    clearLocation
  };
};

/**
 * Composant pour le sélecteur de localisation
 */
export const LocationPicker = ({ onLocationSelect, onCancel }) => {
  const { location, loading, error, getLocation } = useGeolocation();
  const [showMap, setShowMap] = useState(false);

  const handleGetLocation = async () => {
    getLocation();
  };

  const handleConfirm = () => {
    if (location) {
      onLocationSelect(location);
      setShowMap(false);
    }
  };

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <h3>Partager ma localisation</h3>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="location-picker-body">
        {error && (
          <div className="location-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {!showMap ? (
          <div className="location-info">
            <p>Partager votre localisation actuelle avec les autres membres du chat.</p>
            <button
              className="get-location-btn"
              onClick={handleGetLocation}
              disabled={loading}
            >
              {loading ? '⏳ Localisation...' : '📍 Obtenir ma localisation'}
            </button>
          </div>
        ) : (
          <>
            {location && (
              <div className="location-confirmation">
                <LocationPreview location={location} />
                <div className="location-picker-actions">
                  <button
                    className="confirm-btn"
                    onClick={handleConfirm}
                  >
                    ✓ Partager cette localisation
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowMap(false)}
                  >
                    ✕ Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationMessage;
