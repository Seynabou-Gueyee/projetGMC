import React, { useState, useRef } from 'react';
import './FileUploader.css';

const FileUploader = ({ onFilesSelected, maxSize = 50 * 1024 * 1024, acceptedTypes = null }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = acceptedTypes || {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
  };

  const getFileType = (mimeType) => {
    if (allowedTypes.image.includes(mimeType)) return 'image';
    if (allowedTypes.video.includes(mimeType)) return 'video';
    if (allowedTypes.audio.includes(mimeType)) return 'audio';
    if (allowedTypes.file.includes(mimeType)) return 'file';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎧';
      case 'file':
        return '📄';
      default:
        return '📎';
    }
  };

  const validateFile = (file) => {
    // Vérifier la taille
    if (file.size > maxSize) {
      setError(`Le fichier "${file.name}" dépasse la taille maximale de ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // Vérifier le type
    const allAllowedTypes = Object.values(allowedTypes).flat();
    if (!allAllowedTypes.includes(file.type)) {
      setError(`Le type de fichier "${file.type}" n'est pas autorisé`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (files) => {
    setError('');
    const newFiles = Array.from(files).filter(validateFile);

    if (newFiles.length > 0) {
      const fileData = newFiles.map(file => ({
        file,
        type: getFileType(file.type),
        name: file.name,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));

      setSelectedFiles(prev => [...prev, ...fileData]);
      onFilesSelected?.([...selectedFiles, ...fileData]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected?.(newFiles);
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFilesSelected?.([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-uploader">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <p className="drop-icon">📁</p>
          <p className="drop-text">Déposez vos fichiers ici ou cliquez pour sélectionner</p>
          <p className="drop-hint">Images, vidéos, audio, documents (Max: {maxSize / (1024 * 1024)}MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="file-input"
          accept={Object.values(allowedTypes).flat().map(type => {
            // Convertir mimeType en extension
            const ext = type.split('/')[1];
            return `.${ext}`;
          }).join(',')}
        />
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {selectedFiles.length > 0 && (
        <div className="uploaded-files">
          <div className="files-header">
            <h4>📎 Fichiers sélectionnés ({selectedFiles.length})</h4>
            <button className="clear-btn" onClick={handleClear}>Tout effacer</button>
          </div>
          <div className="files-list">
            {selectedFiles.map((fileData, index) => (
              <div key={index} className="file-item">
                <div className="file-preview">
                  {fileData.type === 'image' && fileData.preview ? (
                    <img src={fileData.preview} alt={fileData.name} className="image-preview" />
                  ) : (
                    <div className="file-icon">{getFileIcon(fileData.type)}</div>
                  )}
                </div>
                <div className="file-info">
                  <p className="file-name">{fileData.name}</p>
                  <p className="file-size">{formatFileSize(fileData.size)}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFile(index)}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
