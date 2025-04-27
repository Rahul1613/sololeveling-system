import React, { useEffect, useRef, useState } from 'react';
import '../styles/introAnimation.css';

const IntroAnimation = ({ onFinish }) => {
  const introContainerRef = useRef(null);
  const ariseTextRef = useRef(null);
  const portalRef = useRef(null);
  const shadowFigureRef = useRef(null);
  const eyesRef = useRef(null);
  const lightningRef = useRef(null);
  const shadowWaveRef = useRef(null);
  const [animationStartTime, setAnimationStartTime] = useState(null);

  useEffect(() => {
    // Record the start time of the animation
    setAnimationStartTime(Date.now());
    
    // Preload sounds
    const sounds = {
      arise: new Audio('/sounds/arise.mp3'),
      rumble: new Audio('/sounds/rumble.mp3'),
      impact: new Audio('/sounds/impact.mp3')
    };

    // Configure sound settings
    sounds.arise.volume = 1.0;
    sounds.arise.preload = 'auto';
    sounds.arise.addEventListener('error', (e) => {
      console.error('Error loading arise.mp3:', e);
      // Try fallback to wav format if mp3 fails
      sounds.arise.src = '/sounds/arise.wav';
    });
    sounds.arise.addEventListener('loadeddata', () => {
      console.log('arise sound loaded successfully');
    });

    // Play sound with volume control
    const playSound = (sound) => {
      if (!sound.paused) {
        sound.currentTime = 0;
      }
      
      // Get volume from localStorage or use default
      const volumeLevel = parseFloat(localStorage.getItem('VOLUME_LEVEL') || '1.0');
      sound.volume = volumeLevel;
      
      // Try to play the sound
      const playPromise = sound.play();
      
      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing sound:', error);
          // If there's an error, try playing again after user interaction
          if (sound === sounds.arise) {
            console.log('Attempting to play arise sound on next user interaction');
            const playOnInteraction = () => {
              sound.play().catch(e => console.error('Still could not play sound:', e));
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
          }
        });
      }
      
      return playPromise;
    };

    // Create deep background effects
    const createBackgroundEffects = () => {
      // Deep rumble
      sounds.rumble.volume = 0.7;
      sounds.rumble.preload = 'auto';
      sounds.rumble.addEventListener('error', (e) => {
        console.error('Error loading rumble.mp3:', e);
      });
      sounds.rumble.addEventListener('loadeddata', () => {
        console.log('rumble.mp3 loaded successfully');
      });
      playSound(sounds.rumble);

      // Sub-bass impact
      sounds.impact.volume = 0.9;
      sounds.impact.preload = 'auto';
      sounds.impact.addEventListener('error', (e) => {
        console.error('Error loading impact.mp3:', e);
      });
      sounds.impact.addEventListener('loadeddata', () => {
        console.log('impact.mp3 loaded successfully');
      });
      playSound(sounds.impact);
    };

    // Function to ensure minimum animation duration
    const ensureMinimumDuration = (callback, minimumDuration = 3000) => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - animationStartTime;
      const remainingTime = Math.max(0, minimumDuration - elapsedTime);
      
      console.log(`Animation elapsed time: ${elapsedTime}ms, waiting additional ${remainingTime}ms`);
      
      setTimeout(callback, remainingTime);
    };

    // Automatically start the animation after a short delay
    const startAnimation = async () => {
      // Make sure the intro container is visible
      if (introContainerRef.current) {
        introContainerRef.current.style.display = 'flex';
        introContainerRef.current.style.opacity = '1';
        introContainerRef.current.style.position = 'fixed';
        introContainerRef.current.style.top = '0';
        introContainerRef.current.style.left = '0';
        introContainerRef.current.style.width = '100%';
        introContainerRef.current.style.height = '100%';
        introContainerRef.current.style.justifyContent = 'center';
        introContainerRef.current.style.alignItems = 'center';
      }
      
      // Play the ARISE sound with higher priority
      try {
        console.log('Playing ARISE sound effect');
        await playSound(sounds.arise);
      } catch (error) {
        console.error('Failed to play ARISE sound:', error);
      }

      // Create deep background effects
      createBackgroundEffects();

      // Sequence of animations
      if (portalRef.current) {
        portalRef.current.classList.add('active');
      }
      
      // Create ripple at center
      if (introContainerRef.current) {
        const rect = introContainerRef.current.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = rect.width / 2 + 'px';
        ripple.style.top = rect.height / 2 + 'px';
        introContainerRef.current.appendChild(ripple);
        
        let size = 0;
        const interval = setInterval(() => {
          size += 5;
          ripple.style.width = size + 'px';
          ripple.style.height = size + 'px';
          ripple.style.opacity = 1 - size / 1000;
          
          if (size >= 1000) {
            clearInterval(interval);
            ripple.remove();
          }
        }, 20);
      }

      // Lightning effect
      if (lightningRef.current) {
        lightningRef.current.classList.add('active');
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = Math.random() * 100 + '%';
            bolt.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
            lightningRef.current.appendChild(bolt);
            
            setTimeout(() => {
              bolt.style.opacity = '0.8';
              setTimeout(() => {
                bolt.remove();
              }, 100);
            }, 50);
          }, i * 200);
        }
      }

      // Shadow figure and eyes
      setTimeout(() => {
        if (shadowFigureRef.current) {
          shadowFigureRef.current.classList.add('active');
          setTimeout(() => {
            if (eyesRef.current) {
              eyesRef.current.classList.add('active');
            }
          }, 500);
        }
      }, 800);

      // Shadow wave and transition - ensure minimum duration
      setTimeout(() => {
        if (shadowWaveRef.current) {
          shadowWaveRef.current.style.animation = 'shadowWave 1.5s ease-out forwards';
        }
        
        // Ensure the animation plays for at least 3 seconds total
        ensureMinimumDuration(() => {
          // Start fade out
          if (introContainerRef.current) {
            introContainerRef.current.style.opacity = '0';
            
            setTimeout(() => {
              if (introContainerRef.current) {
                introContainerRef.current.style.display = 'none';
              }
              if (onFinish) onFinish();
            }, 1000);
          }
        }, 3000);
      }, 2000);
    };

    // Start the animation after a short delay
    const timer = setTimeout(() => {
      startAnimation();
    }, 500);

    return () => {
      clearTimeout(timer);
      // Stop all sounds
      Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, [animationStartTime, onFinish]);

  return (
    <div className="intro-container" id="introContainer" ref={introContainerRef}>
      <div className="arise-text" id="ariseText" ref={ariseTextRef}>ARISE</div>
      <div className="portal" id="portal" ref={portalRef}></div>
      <div className="shadow-figure" id="shadowFigure" ref={shadowFigureRef}></div>
      <div className="eyes" id="eyes" ref={eyesRef}>
        <div className="eye"></div>
        <div className="eye"></div>
      </div>
      <div className="lightning" id="lightning" ref={lightningRef}></div>
      <div className="shadow-wave" id="shadowWave" ref={shadowWaveRef}></div>
    </div>
  );
};

export default IntroAnimation;
