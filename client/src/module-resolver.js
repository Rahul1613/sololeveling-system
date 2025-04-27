/**
 * Module Resolver for Font Awesome Dependencies
 * 
 * This file sets up a custom module resolution system to handle Font Awesome imports
 * without requiring the actual packages to be installed.
 */

// Create a mock implementation of the fontawesome-svg-core module
const createCoreMock = () => {
  // Create a mock icon function
  const icon = () => ({
    html: [],
    node: document.createElement('span'),
    abstract: []
  });

  // Create mock library functions
  const library = {
    add: () => {},
    reset: () => {}
  };

  // Create mock DOM functions
  const dom = {
    css: () => {},
    watch: () => {}
  };

  // Create mock parse functions
  const parse = {
    transform: () => ({}),
    icon: () => ({})
  };

  return {
    icon,
    library,
    dom,
    parse,
    findIconDefinition: () => ({}),
    text: () => ({}),
    counter: () => ({}),
    layer: () => ({}),
    toHtml: () => ''
  };
};

// Create a mock implementation of the free-solid-svg-icons module
const createIconsMock = () => {
  // Create a mock icon object
  const createIcon = (name) => ({
    prefix: 'fas',
    iconName: name,
    icon: [512, 512, [], name, "M0 0h512v512H0z"]
  });

  // Create mock icons for common Font Awesome icons
  return {
    faArrowUp: createIcon('arrow-up'),
    faArrowLeft: createIcon('arrow-left'),
    faCheck: createIcon('check'),
    faTimes: createIcon('times'),
    faExclamationTriangle: createIcon('exclamation-triangle'),
    faVideo: createIcon('video'),
    faCamera: createIcon('camera'),
    faLocationArrow: createIcon('location-arrow'),
    faSkull: createIcon('skull'),
    faMedal: createIcon('medal'),
    faTrophy: createIcon('trophy'),
    faScroll: createIcon('scroll'),
    faCoins: createIcon('coins'),
    faStar: createIcon('star'),
    faShoppingCart: createIcon('shopping-cart'),
    faInfoCircle: createIcon('info-circle'),
    faLevelUp: createIcon('level-up'),
    faPlus: createIcon('plus'),
    faShieldAlt: createIcon('shield-alt'),
    faFlask: createIcon('flask'),
    faTrash: createIcon('trash'),
    faHandHolding: createIcon('hand-holding'),
    faTshirt: createIcon('tshirt'),
    faDumbbell: createIcon('dumbbell')
  };
};

// Create a mock implementation of the free-brands-svg-icons module
const createBrandsMock = () => {
  // Create a mock icon object
  const createIcon = (name) => ({
    prefix: 'fab',
    iconName: name,
    icon: [512, 512, [], name, "M0 0h512v512H0z"]
  });

  // Create mock icons for common Font Awesome brand icons
  return {
    faGoogle: createIcon('google'),
    faFacebookF: createIcon('facebook-f'),
    faTwitter: createIcon('twitter'),
    faLinkedin: createIcon('linkedin'),
    faGithub: createIcon('github')
  };
};

// Create a mock implementation of the react-fontawesome module
const createReactMock = () => {
  // Import our custom FontAwesomeIcon component
  const { FontAwesomeIcon } = require('./components/icons');

  return {
    FontAwesomeIcon
  };
};

// Set up the module resolver
if (typeof window !== 'undefined') {
  // Create the mock modules
  const coreMock = createCoreMock();
  const iconsMock = createIconsMock();
  const brandsMock = createBrandsMock();
  const reactMock = createReactMock();

  // Create a mock require function
  const originalRequire = window.require;
  window.require = function(moduleName) {
    // Intercept Font Awesome module imports
    if (moduleName === '@fortawesome/fontawesome-svg-core') {
      return coreMock;
    } else if (moduleName === '@fortawesome/free-solid-svg-icons') {
      return iconsMock;
    } else if (moduleName === '@fortawesome/free-brands-svg-icons') {
      return brandsMock;
    } else if (moduleName === '@fortawesome/react-fontawesome') {
      return reactMock;
    }

    // Fall back to the original require function
    return originalRequire ? originalRequire(moduleName) : undefined;
  };

  // Add the mock modules to the window object for direct imports
  window['@fortawesome/fontawesome-svg-core'] = coreMock;
  window['@fortawesome/free-solid-svg-icons'] = iconsMock;
  window['@fortawesome/free-brands-svg-icons'] = brandsMock;
  window['@fortawesome/react-fontawesome'] = reactMock;

  console.log('Module resolver initialized for Font Awesome dependencies');
}

export default {
  init: () => {
    console.log('Module resolver initialized');
  }
};
