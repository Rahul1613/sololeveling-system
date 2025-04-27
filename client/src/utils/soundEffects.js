// Sound effects for Solo Leveling System

// Cache for loaded audio files
const audioCache = {};

/**
 * Load an audio file and cache it
 * @param {string} url - URL of the audio file
 * @returns {Promise<AudioBuffer>} - Audio buffer
 */
export const loadSound = async (url) => {
  if (audioCache[url]) {
    return audioCache[url];
  }
  
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await window.audioContext.decodeAudioData(arrayBuffer);
    audioCache[url] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error('Error loading sound:', error);
    return null;
  }
};

/**
 * Play a sound effect
 * @param {string} url - URL of the audio file
 * @param {number} volume - Volume level (0-1)
 * @param {boolean} loop - Whether to loop the sound
 * @returns {AudioBufferSourceNode} - Audio source node
 */
export const playSound = async (url, volume = 1, loop = false) => {
  try {
    // Resume audio context if it's suspended (needed for Chrome's autoplay policy)
    if (window.audioContext.state === 'suspended') {
      await window.audioContext.resume();
    }
    
    const audioBuffer = await loadSound(url);
    if (!audioBuffer) return null;
    
    const source = window.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;
    
    // Create gain node for volume control
    const gainNode = window.audioContext.createGain();
    gainNode.gain.value = volume;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    // Start playback
    source.start(0);
    
    return source;
  } catch (error) {
    console.error('Error playing sound:', error);
    return null;
  }
};

/**
 * Stop a sound effect
 * @param {AudioBufferSourceNode} source - Audio source node
 */
export const stopSound = (source) => {
  if (source) {
    try {
      source.stop();
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
};

// Sound effect URLs
const SOUND_EFFECTS = {
  LEVEL_UP: '/sounds/level-up.mp3',
  QUEST_COMPLETE: '/sounds/quest-complete.mp3',
  QUEST_ACCEPT: '/sounds/quest-accept.mp3',
  QUEST_FAIL: '/sounds/quest-fail.mp3',
  RANK_UP: '/sounds/rank-up.mp3',
  ACHIEVEMENT: '/sounds/achievement.mp3',
  ITEM_ACQUIRE: '/sounds/item-acquire.mp3',
  SHADOW_SUMMON: '/sounds/shadow-summon.mp3',
  BUTTON_CLICK: '/sounds/button-click.mp3',
  NOTIFICATION: '/sounds/notification.mp3'
};

/**
 * Play a sound effect by name
 * @param {string} soundName - Name of the sound effect
 * @param {number} volume - Volume level (0-1)
 * @returns {AudioBufferSourceNode} - Audio source node
 */
export const playSoundEffect = (soundName, volume = 1) => {
  const soundUrl = SOUND_EFFECTS[soundName];
  if (!soundUrl) {
    console.error(`Sound effect "${soundName}" not found`);
    return null;
  }
  
  return playSound(soundUrl, volume);
};

/**
 * Preload all sound effects
 */
export const preloadAllSounds = async () => {
  const loadPromises = Object.values(SOUND_EFFECTS).map(url => loadSound(url));
  await Promise.all(loadPromises);
  
  console.log('All sounds preloaded');
};

// Export sound effect names for easy access
export const SoundEffect = {
  LEVEL_UP: 'LEVEL_UP',
  QUEST_COMPLETE: 'QUEST_COMPLETE',
  QUEST_ACCEPT: 'QUEST_ACCEPT',
  QUEST_FAIL: 'QUEST_FAIL',
  RANK_UP: 'RANK_UP',
  ACHIEVEMENT: 'ACHIEVEMENT',
  ITEM_ACQUIRE: 'ITEM_ACQUIRE',
  SHADOW_SUMMON: 'SHADOW_SUMMON',
  BUTTON_CLICK: 'BUTTON_CLICK',
  NOTIFICATION: 'NOTIFICATION'
};
