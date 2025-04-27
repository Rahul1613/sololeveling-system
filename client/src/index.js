// Apply direct slice fix first (before anything else)
// import './utils/directSliceFix';

// Apply error fixer patch first to catch all errors
// import './utils/errorFixerPatch';

// Initialize module resolver for Font Awesome dependencies
// import './module-resolver';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';
import errorHandler from './utils/errorHandler';
import { initGlobalErrorInterceptor } from './utils/globalErrorInterceptor';
// Import fonts
import '@fontsource/rajdhani';
// Fix Font Awesome import issues
// import './utils/fixFontAwesomeImports';

// Initialize global error interceptor
initGlobalErrorInterceptor();

// Initialize Web Audio API only after user interaction to comply with browser policies
const initAudio = () => {
  if (!window.audioContext) {
    try {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
};

// Add event listeners to initialize audio on user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

// Audio context will be initialized on user interaction

// Initialize error tracking
errorHandler.initErrorTracking();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Service worker registration will be added in a future update
