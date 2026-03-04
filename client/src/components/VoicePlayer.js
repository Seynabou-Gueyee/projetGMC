import React, { useState, useRef, useEffect } from 'react';
import './VoicePlayer.css';

const VoicePlayer = ({ voiceUrl, duration, transcription }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (audioRef.current?.duration || 0);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="voice-player">
      <audio ref={audioRef} src={voiceUrl} />
      
      <div className="player-controls">
        <button 
          className="play-button"
          onClick={togglePlayPause}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="player-timeline">
          <div 
            className="timeline-bar"
            onClick={handleProgressClick}
          >
            <div 
              className="timeline-progress"
              style={{ width: `${(currentTime / (audioRef.current?.duration || 0)) * 100}%` }}
            />
          </div>
        </div>

        <div className="player-time">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="separator">/</span>
          <span className="total-time">{formatTime(audioRef.current?.duration || duration)}</span>
        </div>
      </div>

      {transcription && (
        <div className="transcription">
          <div className="transcription-label">📝 Transcription:</div>
          <div className="transcription-text">{transcription}</div>
        </div>
      )}
    </div>
  );
};

export default VoicePlayer;
