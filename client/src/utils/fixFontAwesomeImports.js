/**
 * Font Awesome Import Fixer
 * 
 * This script fixes Font Awesome import issues by providing a global shim
 * that replaces all Font Awesome imports with Material-UI icons.
 */

// Create a global Font Awesome shim
if (typeof window !== 'undefined') {
  // Create mock modules
  window.__fontawesome__ = {
    icon: () => null,
    layer: () => null,
    text: () => null,
    dom: {
      css: () => null,
      watch: () => null
    },
    parse: {
      transform: () => null
    },
    findIconDefinition: () => null
  };
  
  // Create a mock FontAwesome object
  window.FontAwesome = window.__fontawesome__;
  
  // Create a mock fontawesome-svg-core module
  window.__FONT_AWESOME__ = {
    styles: {},
    hooks: {},
    shims: [],
    layers: () => null,
    parse: {
      icon: () => null,
      transform: () => null
    }
  };
  
  // Create a mock for the free-solid-svg-icons module
  const createDummyIcon = (name) => ({ 
    iconName: name,
    prefix: 'fas',
    icon: [512, 512, [], name, "M0 0h512v512H0z"]
  });
  
  // Common icons used in the application
  const mockIcons = {
    faArrowUp: createDummyIcon('arrow-up'),
    faArrowLeft: createDummyIcon('arrow-left'),
    faCheck: createDummyIcon('check'),
    faTimes: createDummyIcon('times'),
    faExclamationTriangle: createDummyIcon('exclamation-triangle'),
    faVideo: createDummyIcon('video'),
    faCamera: createDummyIcon('camera'),
    faLocationArrow: createDummyIcon('location-arrow'),
    faSkull: createDummyIcon('skull'),
    faMedal: createDummyIcon('medal'),
    faTrophy: createDummyIcon('trophy'),
    faScroll: createDummyIcon('scroll'),
    faCoins: createDummyIcon('coins'),
    faStar: createDummyIcon('star'),
    faShoppingCart: createDummyIcon('shopping-cart'),
    faInfoCircle: createDummyIcon('info-circle'),
    faLevelUp: createDummyIcon('level-up'),
    faPlus: createDummyIcon('plus'),
    faShieldAlt: createDummyIcon('shield-alt'),
    faFlask: createDummyIcon('flask'),
    faTrash: createDummyIcon('trash'),
    faHandHolding: createDummyIcon('hand-holding'),
    faTshirt: createDummyIcon('tshirt'),
    faDumbbell: createDummyIcon('dumbbell'),
    faGoogle: createDummyIcon('google'),
    faFacebookF: createDummyIcon('facebook-f')
  };
  
  // Add icons to window object
  window.__FONT_AWESOME_ICONS__ = mockIcons;
  
  // Create mock modules
  window['@fortawesome/fontawesome-svg-core'] = {
    library: { add: () => {} },
    dom: { watch: () => {} },
    ...window.__fontawesome__
  };
  
  window['@fortawesome/free-solid-svg-icons'] = mockIcons;
  window['@fortawesome/free-brands-svg-icons'] = {
    faGoogle: mockIcons.faGoogle,
    faFacebookF: mockIcons.faFacebookF
  };
  
  window['@fortawesome/react-fontawesome'] = {
    FontAwesomeIcon: function() {
      return null;
    }
  };
  
  console.log('Font Awesome shims initialized');
}

export default {
  init: () => {
    console.log('Font Awesome import fixes applied');
  }
};
