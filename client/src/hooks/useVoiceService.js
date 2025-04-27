/**
 * Voice Service Hook (Disabled)
 * 
 * This hook provides a dummy implementation of the voice service
 * since voice announcements have been removed from the application.
 */

export const useVoiceService = () => {
  // Return a dummy implementation with all voice functions disabled
  return {
    playVoice: () => {},
    isSpeaking: false,
    isMuted: true,
    toggleMute: () => {},
    stopSpeech: () => {},
    voices: [],
    selectedVoice: null,
    changeVoice: () => {}
  };
};
