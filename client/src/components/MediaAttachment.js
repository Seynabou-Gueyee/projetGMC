import React, { useState } from 'react';
import './MediaAttachment.css';

const MediaAttachment = ({ attachment, onDownload }) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (attachment.type === 'image') {
    return (
      <div className="media-attachment image-attachment">
        {showPreview ? (
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className="image-preview"
          />
        ) : (
          <div className="image-thumbnail">
            <img
              src={attachment.thumbnail || attachment.url}
              alt={attachment.fileName}
              onClick={() => setShowPreview(true)}
              className="thumbnail"
            />
            <div className="overlay">
              <button className="view-btn" onClick={() => setShowPreview(true)}>
                👁️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className="media-attachment video-attachment">
        <div className="video-player">
          <video
            src={attachment.url}
            controls
            poster={attachment.thumbnail}
            className="video"
          >
            Votre navigateur ne supporte pas la vidéo
          </video>
          {attachment.duration && (
            <span className="duration">{formatDuration(attachment.duration)}</span>
          )}
        </div>
      </div>
    );
  }

  if (attachment.type === 'audio') {
    return (
      <div className="media-attachment audio-attachment">
        <div className="audio-player">
          <audio src={attachment.url} controls className="audio" />
          <div className="audio-info">
            {attachment.fileName && (
              <p className="audio-name">{attachment.fileName}</p>
            )}
            {attachment.duration && (
              <p className="audio-duration">{formatDuration(attachment.duration)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fichier générique
  return (
    <div className="media-attachment file-attachment">
      <div className="file-info-box">
        <div className="file-icon">📄</div>
        <div className="file-details">
          <p className="file-name">{attachment.fileName}</p>
          <p className="file-size">{formatFileSize(attachment.fileSize)}</p>
        </div>
        <a
          href={attachment.url}
          download={attachment.fileName}
          className="download-btn"
          title="Télécharger"
        >
          ⬇️
        </a>
      </div>
    </div>
  );
};

export default MediaAttachment;
