import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create Voice Context
export const VoiceContext = createContext();

/**
 * Voice Provider Component
 * Provides voice service functionality throughout the application
 */
export const VoiceProvider = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queue, setQueue] = useState([]);
  const [isMuted, setIsMuted] = useState(true); 
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  // Load mute preference from localStorage
  useEffect(() => {
    setIsMuted(true);
    localStorage.setItem('voiceServiceMuted', 'true');
    
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) {
      setSelectedVoice(JSON.parse(savedVoice));
    }
    
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          if (!selectedVoice) {
            const preferredVoices = availableVoices.filter(voice => 
              voice.name.includes('Male') || 
              voice.name.includes('Deep') || 
              voice.name.includes('Daniel')
            );
            
            if (preferredVoices.length > 0) {
              setSelectedVoice(preferredVoices[0]);
              localStorage.setItem('selectedVoice', JSON.stringify(preferredVoices[0]));
            } else {
              setSelectedVoice(availableVoices[0]);
              localStorage.setItem('selectedVoice', JSON.stringify(availableVoices[0]));
            }
          }
        }
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
  }, []);

  useEffect(() => {
  }, [queue, isSpeaking, isMuted]);

  const speak = (text) => {
    return new Promise((resolve) => {
      resolve();
    });
  };

  const playVoice = useCallback(() => {
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(true);
    localStorage.setItem('voiceServiceMuted', 'true');
  }, []);

  const stopSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setQueue([]);
    setIsSpeaking(false);
  }, []);

  const changeVoice = useCallback((voice) => {
    setSelectedVoice(voice);
    localStorage.setItem('selectedVoice', JSON.stringify(voice));
  }, []);

  const contextValue = {
    playVoice,
    isSpeaking,
    isMuted,
    toggleMute,
    stopSpeech,
    voices,
    selectedVoice,
    changeVoice
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

export default VoiceProvider;
