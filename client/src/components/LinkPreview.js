import React from 'react';
import './LinkPreview.css';

const LinkPreview = ({ preview, onRemove }) => {
  if (!preview) return null;

  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Lien';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="link-preview">
      <div className="preview-container">
        {preview.image && (
          <div className="preview-image">
            <img src={preview.image} alt={preview.title} />
          </div>
        )}

        <div className="preview-content">
          <a href={preview.url} target="_blank" rel="noopener noreferrer" className="preview-title">
            {preview.title || truncateText(preview.url, 60)}
          </a>

          {preview.description && (
            <p className="preview-description">
              {truncateText(preview.description, 150)}
            </p>
          )}

          <div className="preview-url">
            <span className="link-icon">🔗</span>
            <span className="domain">{getDomain(preview.url)}</span>
          </div>
        </div>

        {onRemove && (
          <button className="remove-preview" onClick={onRemove} title="Supprimer l'aperçu">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default LinkPreview;
