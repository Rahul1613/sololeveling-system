/**
 * Animation Service for Solo Leveling System
 * Handles 3D animations and visual effects
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { playSoundEffect, SoundEffect, preloadAllSounds } from './soundEffects';

class AnimationService {
  constructor() {
    this.initialized = false;
    this.enabled = true;
    this.models = {};
    this.animations = {};
    this.scenes = {};
    this.renderer = null;
    this.camera = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.fallbackMode = false;
  }

  /**
   * Initialize the animation service
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    try {
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0x000000, 0);
      // Use the updated property in Three.js
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Create camera
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);

      // Load models and prepare animations
      await this.loadModels();
      
      // Initialize audio context for sound effects
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Preload sound effects
      await preloadAllSounds();
      
      this.initialized = true;
      console.log('Animation service initialized');
    } catch (error) {
      console.error('Error initializing animation service:', error);
      this.fallbackMode = true;
    }
  }

  /**
   * Load 3D models
   * @returns {Promise<void>}
   */
  async loadModels() {
    try {
      const loader = new GLTFLoader();
      
      // Load Shadow Monarch model
      const shadowMonarchModel = await new Promise((resolve, reject) => {
        loader.load('/static/models/shadow-monarch.gltf', resolve, 
          // Progress callback
          (progress) => {
            console.log(`Loading model: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
          },
          // Error callback
          (error) => {
            console.error('Error loading model:', error);
            this.fallbackMode = true;
            reject(error);
          }
        );
      });
      
      this.models.shadowMonarch = shadowMonarchModel;
      
      // Create a scene for the shadow monarch
      const scene = new THREE.Scene();
      scene.add(shadowMonarchModel.scene);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(0, 10, 10);
      scene.add(directionalLight);
      
      // Add a subtle backlight for better visibility
      const backLight = new THREE.DirectionalLight(0x6666ff, 0.5);
      backLight.position.set(0, 5, -10);
      scene.add(backLight);
      
      this.scenes.shadowMonarch = scene;
      
      // Set up animation mixer if the model has animations
      if (shadowMonarchModel.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(shadowMonarchModel.scene);
        shadowMonarchModel.animations.forEach(clip => {
          this.animations[clip.name] = this.mixer.clipAction(clip);
        });
      } else {
        // If no animations in the model, create a simple rotation animation
        this.createFallbackAnimation(shadowMonarchModel.scene);
      }
      
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      this.fallbackMode = true;
      this.createFallbackScene();
    }
  }

  /**
   * Create a fallback scene with a simple shape when model loading fails
   */
  createFallbackScene() {
    // Create a fallback scene with a glowing blue cube
    const scene = new THREE.Scene();
    
    // Create a geometry
    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x3366ff,
      emissive: 0x1133cc,
      metalness: 0.5,
      roughness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    this.scenes.fallback = scene;
    this.createFallbackAnimation(mesh);
  }

  /**
   * Create a simple rotation animation for objects without animations
   * @param {THREE.Object3D} object - The object to animate
   */
  createFallbackAnimation(object) {
    // Store the object to animate in the animation loop
    this.fallbackObject = object;
  }

  /**
   * Play the intro animation
   * @param {HTMLElement} container - DOM element to attach the renderer to
   * @returns {Promise<void>}
   */
  async playIntroAnimation(container) {
    if (!this.initialized || !container) return;
    
    try {
      // Resize renderer to fit container
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      
      // Append renderer to container
      container.appendChild(this.renderer.domElement);
      
      // Play arise sound effect
      playSoundEffect(SoundEffect.SHADOW_SUMMON, 0.8);
      
      // Create text overlay for "SOLO LEVELING"
      const textOverlay = document.createElement('div');
      textOverlay.style.position = 'absolute';
      textOverlay.style.top = '50%';
      textOverlay.style.left = '50%';
      textOverlay.style.transform = 'translate(-50%, -50%)';
      textOverlay.style.color = '#ffffff';
      textOverlay.style.fontSize = '3rem';
      textOverlay.style.fontWeight = 'bold';
      textOverlay.style.fontFamily = 'Rajdhani, sans-serif';
      textOverlay.style.textShadow = '0 0 10px #3366ff, 0 0 20px #3366ff';
      textOverlay.style.opacity = '0';
      textOverlay.style.transition = 'opacity 1s ease-in-out';
      textOverlay.textContent = 'SOLO LEVELING';
      container.appendChild(textOverlay);
      
      // Fade in text after a delay
      setTimeout(() => {
        textOverlay.style.opacity = '1';
      }, 1000);
      
      // Play animation if available
      if (this.animations.idle) {
        this.animations.idle.reset().play();
      }
      
      // Start animation loop
      this.animate();
      
      // Return promise that resolves when animation is complete
      return new Promise(resolve => {
        setTimeout(() => {
          // Fade out text
          textOverlay.style.opacity = '0';
          
          setTimeout(() => {
            this.stopAnimation();
            if (container.contains(this.renderer.domElement)) {
              container.removeChild(this.renderer.domElement);
            }
            if (container.contains(textOverlay)) {
              container.removeChild(textOverlay);
            }
            resolve();
          }, 1000);
        }, 4000); // Animation duration in milliseconds
      });
    } catch (error) {
      console.error('Error playing intro animation:', error);
    }
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.initialized) return;
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    // Update animation mixer
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
    
    // Apply fallback animation (rotation) if needed
    if (this.fallbackObject) {
      this.fallbackObject.rotation.y += 0.01;
      this.fallbackObject.rotation.x += 0.005;
    }
    
    // Render the scene
    if (this.fallbackMode && this.scenes.fallback) {
      this.renderer.render(this.scenes.fallback, this.camera);
    } else if (this.scenes.shadowMonarch) {
      this.renderer.render(this.scenes.shadowMonarch, this.camera);
    }
  }

  /**
   * Stop the animation loop
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stopAnimation();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Clear references
    this.models = {};
    this.animations = {};
    this.scenes = {};
    this.renderer = null;
    this.camera = null;
    this.mixer = null;
    
    this.initialized = false;
  }
}

// Create singleton instance
const animationService = new AnimationService();

export default animationService;
