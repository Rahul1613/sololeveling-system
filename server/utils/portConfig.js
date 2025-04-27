/**
 * Utility to manage port configuration and sync with client
 */
const fs = require('fs');
const path = require('path');

/**
 * Updates the client config.js file with the correct port
 * @param {Number} port - The port the server is running on
 */
const updateClientConfig = (port) => {
  try {
    // Path to client config file
    const clientConfigPath = path.join(__dirname, '../../client/src/config.js');
    
    // Check if file exists
    if (!fs.existsSync(clientConfigPath)) {
      console.error(`Client config file not found at ${clientConfigPath}`);
      return false;
    }
    
    // Read the current config
    let configContent = fs.readFileSync(clientConfigPath, 'utf8');
    
    // Update API_URL and SOCKET_URL with the new port
    configContent = configContent.replace(
      /export const API_URL = process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:\d+\/api';/,
      `export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:${port}/api';`
    );
    
    configContent = configContent.replace(
      /export const SOCKET_URL = process\.env\.REACT_APP_SOCKET_URL \|\| 'http:\/\/localhost:\d+';/,
      `export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:${port}';`
    );
    
    // Write the updated config back to the file
    fs.writeFileSync(clientConfigPath, configContent, 'utf8');
    
    console.log(`Updated client config with port ${port}`);
    return true;
  } catch (error) {
    console.error('Error updating client config:', error);
    return false;
  }
};

/**
 * Gets the current server port from the port.json file
 * @returns {Number|null} - The port number or null if not found
 */
const getCurrentPort = () => {
  try {
    const portInfoPath = path.join(__dirname, '../port.json');
    
    if (!fs.existsSync(portInfoPath)) {
      return null;
    }
    
    const portInfo = JSON.parse(fs.readFileSync(portInfoPath, 'utf8'));
    return portInfo.port;
  } catch (error) {
    console.error('Error reading port info:', error);
    return null;
  }
};

module.exports = {
  updateClientConfig,
  getCurrentPort
};
