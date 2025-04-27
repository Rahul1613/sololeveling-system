/**
 * Voice Service for Solo Leveling System
 * DISABLED - No voice announcements will be played
 */

class VoiceService {
  constructor() {
    this.initialized = false;
    this.enabled = false; // Voice announcements disabled by default
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    // Do nothing - voice service is disabled
    return;
  }

  // Set volume (0-1)
  setVolume() {
    // Do nothing - voice service is disabled
    return;
  }

  // Enable/disable voice announcements
  setEnabled() {
    // Always keep disabled
    return;
  }

  // Set voice type (male/female)
  setVoiceType() {
    // Do nothing - voice service is disabled
    return;
  }

  // Custom announcement - disabled
  announce() {
    // Do nothing - voice service is disabled
    return;
  }

  // All announcement methods are disabled
  announceQuestComplete() { return; }
  announceLevelUp() { return; }
  announceRankChange() { return; }
  announceAchievement() { return; }
  announceDailyQuests() { return; }
  announceSpecialEvent() { return; }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService;
