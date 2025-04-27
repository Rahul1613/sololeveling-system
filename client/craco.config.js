const path = require('path');

module.exports = {
  webpack: {
    alias: {
      // Redirect Font Awesome imports to our mock implementations
      '@fortawesome/fontawesome-svg-core': path.resolve(__dirname, 'src/fontawesome-svg-core.js'),
    },
    configure: (webpackConfig) => {
      // Add fallbacks for webpack 5
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
      };
      
      return webpackConfig;
    },
  },
};
