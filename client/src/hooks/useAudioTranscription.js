import { useState, useRef, useCallback } from 'react';

/**
 * Hook personnalisé pour la transcription audio avec Web Speech API
 * @param {string} language - Code langue (ex: 'fr-FR', 'en-US')
 * @returns {Object} État et fonctions de contrôle
 */
export const useAudioTranscription = (language = 'fr-FR') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Initialiser Web Speech API
  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API non supportée');
      return null;
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
      }

      if (finalConfidence > 0) {
        setConfidence(Math.round(finalConfidence * 100));
      }
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'Aucun son détecté',
        'audio-capture': 'Aucun microphone trouvé',
        'network': 'Erreur de connexion réseau',
        'aborted': 'Reconnaissance annulée',
        'service-not-allowed': 'Service non disponible'
      };

      setError(errorMessages[event.error] || `Erreur: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [language]);

  // Démarrer l'écoute
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Web Speech API non supportée');
      return;
    }

    if (!recognitionRef.current) {
      initializeRecognition();
    }

    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening, isSupported, initializeRecognition]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Réinitialiser
  const reset = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    setTranscript('');
    setConfidence(0);
    setError('');
  }, [isListening, stopListening]);

  // Nettoyer
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
    cleanup,
    setTranscript
  };
};

export default useAudioTranscription;
