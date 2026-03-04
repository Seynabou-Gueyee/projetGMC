import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onVoiceMessageSend, disabled = false, token }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur accès au micro:', error);
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTranscribe = async () => {
    if (!recordedBlob) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', recordedBlob, 'voice-message.webm');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/voice/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.transcription;
    } catch (error) {
      console.error('Erreur transcription:', error);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = async () => {
    if (!recordedBlob) return;

    // Uploader le fichier audio
    const formData = new FormData();
    formData.append('audio', recordedBlob, 'voice-message.webm');

    try {
      const uploadResponse = await axios.post(
        'http://localhost:5000/api/voice/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Optionnellement transcrire
      let transcription = null;
      if (uploadResponse.data.transcriptionUrl) {
        transcription = await handleTranscribe();
      }

      onVoiceMessageSend({
        voiceUrl: uploadResponse.data.url,
        duration: duration,
        transcription: transcription,
        mimeType: 'audio/webm'
      });

      setRecordedBlob(null);
      setDuration(0);
    } catch (error) {
      console.error('Erreur envoi message vocal:', error);
      alert('Erreur lors de l\'envoi du message vocal');
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setRecordedBlob(null);
    setDuration(0);
  };

  return (
    <div className="voice-recorder">
      {!recordedBlob ? (
        <>
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isTranscribing}
            title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer un message vocal'}
          >
            <span className="record-icon">🎤</span>
            <span className="record-text">
              {isRecording ? formatDuration(duration) : 'Enregistrer'}
            </span>
          </button>
        </>
      ) : (
        <div className="voice-preview">
          <div className="preview-info">
            <span className="duration-badge">🎵 {formatDuration(duration)}</span>
          </div>
          <div className="preview-actions">
            <button 
              className="action-button cancel"
              onClick={handleCancel}
              disabled={isTranscribing}
            >
              ✕ Annuler
            </button>
            <button 
              className="action-button transcribe"
              onClick={handleTranscribe}
              disabled={isTranscribing}
            >
              {isTranscribing ? '⏳ Transcription...' : '📝 Transcrire'}
            </button>
            <button 
              className="action-button send"
              onClick={handleSend}
              disabled={isTranscribing}
            >
              ✓ Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
