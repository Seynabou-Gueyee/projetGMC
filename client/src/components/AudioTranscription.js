import React, { useState, useRef, useEffect } from 'react';
import './AudioTranscription.css';

const AudioTranscription = ({ onTranscriptionComplete, language = 'fr-FR' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isFinalTranscript, setIsFinalTranscript] = useState(false);
  const recognitionRef = useRef(null);
  const [browserSupportsWebSpeech, setBrowserSupportsWebSpeech] = useState(true);

  useEffect(() => {
    // Initialiser Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupportsWebSpeech(false);
      setError('Web Speech API non supportée dans ce navigateur');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript);
          finalConfidence = event.results[i][0].confidence;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript);
        setIsFinalTranscript(false);
      }

      if (finalConfidence > 0) {
        setConfidence(Math.round(finalConfidence * 100));
      }
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Erreur de reconnaissance vocale: ';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage += 'Aucun son détecté';
          break;
        case 'audio-capture':
          errorMessage += 'Aucun microphone trouvé';
          break;
        case 'network':
          errorMessage += 'Erreur de connexion réseau';
          break;
        case 'aborted':
          errorMessage += 'Reconnaissance annulée';
          break;
        default:
          errorMessage += event.error;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsFinalTranscript(true);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleCompleteTranscription = () => {
    if (transcript.trim()) {
      onTranscriptionComplete(transcript);
      setTranscript('');
      setConfidence(0);
      setIsFinalTranscript(false);
    }
  };

  const handleCancelTranscription = () => {
    if (isListening) {
      stopListening();
    }
    setTranscript('');
    setConfidence(0);
    setError('');
    setIsFinalTranscript(false);
  };

  if (!browserSupportsWebSpeech) {
    return (
      <div className="transcription-error">
        <p>⚠️ Votre navigateur ne supporte pas la transcription vocale</p>
        <p>Veuillez utiliser Chrome, Edge, ou Safari 14.1+</p>
      </div>
    );
  }

  return (
    <div className="audio-transcription">
      <div className="transcription-header">
        <h4>🎤 Transcription vocale</h4>
      </div>

      {/* Zone de contrôle */}
      <div className="transcription-controls">
        {!isListening ? (
          <button 
            className="btn-start-listening"
            onClick={startListening}
            title="Commencer l'enregistrement"
          >
            🎤 Démarrer l'enregistrement
          </button>
        ) : (
          <button 
            className="btn-stop-listening"
            onClick={stopListening}
            title="Arrêter l'enregistrement"
          >
            ⏹️ Arrêter l'enregistrement
          </button>
        )}
      </div>

      {/* Indicateur d'écoute */}
      {isListening && (
        <div className="listening-indicator">
          <div className="pulse-dot"></div>
          <span>En écoute...</span>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="transcription-error">
          ⚠️ {error}
        </div>
      )}

      {/* Résultat transcription */}
      {transcript && (
        <div className="transcription-result">
          <div className="transcript-text">
            {transcript}
            {!isFinalTranscript && <span className="cursor">|</span>}
          </div>
          
          {confidence > 0 && (
            <div className="confidence-indicator">
              <span>Confiance: {confidence}%</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
            </div>
          )}

          {isFinalTranscript && (
            <div className="transcription-actions">
              <button 
                className="btn-accept"
                onClick={handleCompleteTranscription}
              >
                ✓ Continuer avec ce texte
              </button>
              <button 
                className="btn-cancel"
                onClick={handleCancelTranscription}
              >
                ✕ Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="transcription-info">
        💡 Cliquez sur le micro pour commencer à parler
      </div>
    </div>
  );
};

export default AudioTranscription;
