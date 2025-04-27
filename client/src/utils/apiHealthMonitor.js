/**
 * API Health Monitor
 * 
 * This utility monitors API health and provides metrics on API performance and reliability.
 * It tracks request success rates, response times, and error patterns to help identify
 * and diagnose API issues.
 */
import networkManager from './networkManager';
import localforage from 'localforage';

// Initialize storage
const metricsStorage = localforage.createInstance({
  name: 'soloLeveling',
  storeName: 'apiMetrics'
});

// Constants
const METRICS_KEY = 'api_health_metrics';
const MAX_HISTORY_LENGTH = 100;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

class ApiHealthMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      networkErrors: 0,
      serverErrors: 0,
      clientErrors: 0,
      averageResponseTime: 0,
      responseTimeHistory: [],
      errorRateHistory: [],
      lastUpdated: Date.now(),
      endpoints: {},
      isHealthy: true,
      healthHistory: [],
      currentEndpoint: null
    };
    
    this.initialized = false;
    this.healthCheckTimer = null;
    this.endpointHealthThresholds = {
      errorRate: 0.2, // 20% error rate is considered unhealthy
      responseTime: 2000, // 2 seconds response time is considered slow
      timeoutRate: 0.1 // 10% timeout rate is considered unhealthy
    };
    
    this.init();
  }
  
  async init() {
    try {
      // Load metrics from storage
      const storedMetrics = await metricsStorage.getItem(METRICS_KEY);
      if (storedMetrics) {
        this.metrics = { ...this.metrics, ...storedMetrics };
      }
      
      // Start health check timer
      this.startHealthCheck();
      
      this.initialized = true;
      console.log('API Health Monitor initialized');
    } catch (error) {
      console.error('Failed to initialize API Health Monitor:', error);
    }
  }
  
  /**
   * Start a request tracking
   * @param {string} endpoint - API endpoint
   * @returns {Object} - Request tracking object
   */
  startRequest(endpoint) {
    const requestId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    // Initialize endpoint metrics if not exists
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeouts: 0,
        networkErrors: 0,
        serverErrors: 0,
        clientErrors: 0,
        averageResponseTime: 0,
        responseTimeHistory: [],
        errorRateHistory: [],
        lastUpdated: Date.now(),
        isHealthy: true
      };
    }
    
    this.metrics.totalRequests++;
    this.metrics.endpoints[endpoint].totalRequests++;
    this.metrics.currentEndpoint = endpoint;
    
    return {
      requestId,
      startTime,
      endpoint
    };
  }
  
  /**
   * End a request tracking and update metrics
   * @param {Object} tracking - Request tracking object
   * @param {Object} response - Response object
   */
  endRequest(tracking, response) {
    if (!tracking) return;
    
    const { requestId, startTime, endpoint } = tracking;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Update endpoint metrics
    const endpointMetrics = this.metrics.endpoints[endpoint];
    
    // Update response time metrics
    this.updateResponseTimeMetrics(endpointMetrics, responseTime);
    this.updateResponseTimeMetrics(this.metrics, responseTime);
    
    // Update success/failure metrics based on response
    if (response.status >= 200 && response.status < 300) {
      // Success
      this.metrics.successfulRequests++;
      endpointMetrics.successfulRequests++;
    } else {
      // Failure
      this.metrics.failedRequests++;
      endpointMetrics.failedRequests++;
      
      if (response.status >= 400 && response.status < 500) {
        // Client error
        this.metrics.clientErrors++;
        endpointMetrics.clientErrors++;
      } else if (response.status >= 500) {
        // Server error
        this.metrics.serverErrors++;
        endpointMetrics.serverErrors++;
      }
    }
    
    // Update error rate history
    this.updateErrorRateHistory(endpointMetrics);
    this.updateErrorRateHistory(this.metrics);
    
    // Update health status
    this.updateHealthStatus(endpoint);
    
    // Save metrics
    this.saveMetrics();
  }
  
  /**
   * Handle request error
   * @param {Object} tracking - Request tracking object
   * @param {Error} error - Error object
   */
  handleRequestError(tracking, error) {
    if (!tracking) return;
    
    const { requestId, startTime, endpoint } = tracking;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Update endpoint metrics
    const endpointMetrics = this.metrics.endpoints[endpoint];
    
    // Update response time metrics
    this.updateResponseTimeMetrics(endpointMetrics, responseTime);
    this.updateResponseTimeMetrics(this.metrics, responseTime);
    
    // Update failure metrics
    this.metrics.failedRequests++;
    endpointMetrics.failedRequests++;
    
    if (error.code === 'ECONNABORTED') {
      // Timeout
      this.metrics.timeouts++;
      endpointMetrics.timeouts++;
    } else if (error.message.includes('Network Error') || !error.response) {
      // Network error
      this.metrics.networkErrors++;
      endpointMetrics.networkErrors++;
    } else if (error.response && error.response.status >= 500) {
      // Server error
      this.metrics.serverErrors++;
      endpointMetrics.serverErrors++;
    } else if (error.response && error.response.status >= 400) {
      // Client error
      this.metrics.clientErrors++;
      endpointMetrics.clientErrors++;
    }
    
    // Update error rate history
    this.updateErrorRateHistory(endpointMetrics);
    this.updateErrorRateHistory(this.metrics);
    
    // Update health status
    this.updateHealthStatus(endpoint);
    
    // Save metrics
    this.saveMetrics();
  }
  
  /**
   * Update response time metrics
   * @param {Object} metrics - Metrics object
   * @param {number} responseTime - Response time in ms
   */
  updateResponseTimeMetrics(metrics, responseTime) {
    // Update average response time
    const totalTime = metrics.averageResponseTime * metrics.totalRequests;
    metrics.averageResponseTime = (totalTime + responseTime) / (metrics.totalRequests);
    
    // Update response time history
    metrics.responseTimeHistory.push({
      timestamp: Date.now(),
      value: responseTime
    });
    
    // Limit history length
    if (metrics.responseTimeHistory.length > MAX_HISTORY_LENGTH) {
      metrics.responseTimeHistory.shift();
    }
    
    metrics.lastUpdated = Date.now();
  }
  
  /**
   * Update error rate history
   * @param {Object} metrics - Metrics object
   */
  updateErrorRateHistory(metrics) {
    const errorRate = metrics.totalRequests > 0 
      ? metrics.failedRequests / metrics.totalRequests 
      : 0;
    
    metrics.errorRateHistory.push({
      timestamp: Date.now(),
      value: errorRate
    });
    
    // Limit history length
    if (metrics.errorRateHistory.length > MAX_HISTORY_LENGTH) {
      metrics.errorRateHistory.shift();
    }
    
    metrics.lastUpdated = Date.now();
  }
  
  /**
   * Update health status for an endpoint
   * @param {string} endpoint - API endpoint
   */
  updateHealthStatus(endpoint) {
    const endpointMetrics = this.metrics.endpoints[endpoint];
    
    // Calculate health indicators
    const errorRate = endpointMetrics.totalRequests > 0 
      ? endpointMetrics.failedRequests / endpointMetrics.totalRequests 
      : 0;
    
    const timeoutRate = endpointMetrics.totalRequests > 0 
      ? endpointMetrics.timeouts / endpointMetrics.totalRequests 
      : 0;
    
    const averageResponseTime = endpointMetrics.averageResponseTime;
    
    // Determine if endpoint is healthy
    const isHealthy = (
      errorRate < this.endpointHealthThresholds.errorRate &&
      timeoutRate < this.endpointHealthThresholds.timeoutRate &&
      averageResponseTime < this.endpointHealthThresholds.responseTime
    );
    
    // Update endpoint health status
    endpointMetrics.isHealthy = isHealthy;
    
    // Update overall health status
    this.updateOverallHealthStatus();
  }
  
  /**
   * Update overall API health status
   */
  updateOverallHealthStatus() {
    const endpoints = Object.values(this.metrics.endpoints);
    const unhealthyEndpoints = endpoints.filter(endpoint => !endpoint.isHealthy);
    
    // API is considered healthy if at least 80% of endpoints are healthy
    const isHealthy = unhealthyEndpoints.length / endpoints.length < 0.2;
    
    // Update health status
    this.metrics.isHealthy = isHealthy;
    
    // Update health history
    this.metrics.healthHistory.push({
      timestamp: Date.now(),
      value: isHealthy
    });
    
    // Limit history length
    if (this.metrics.healthHistory.length > MAX_HISTORY_LENGTH) {
      this.metrics.healthHistory.shift();
    }
    
    // Notify network manager of health status change
    networkManager.updateApiHealth(isHealthy);
  }
  
  /**
   * Save metrics to storage
   */
  async saveMetrics() {
    try {
      await metricsStorage.setItem(METRICS_KEY, this.metrics);
    } catch (error) {
      console.error('Failed to save API health metrics:', error);
    }
  }
  
  /**
   * Start health check timer
   */
  startHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(() => {
      this.checkApiHealth();
    }, HEALTH_CHECK_INTERVAL);
  }
  
  /**
   * Stop health check timer
   */
  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
  
  /**
   * Check API health
   */
  async checkApiHealth() {
    try {
      const isServerReachable = await networkManager.checkServerConnection();
      
      if (!isServerReachable) {
        // Server is not reachable, mark as unhealthy
        this.metrics.isHealthy = false;
        
        // Update health history
        this.metrics.healthHistory.push({
          timestamp: Date.now(),
          value: false
        });
        
        // Limit history length
        if (this.metrics.healthHistory.length > MAX_HISTORY_LENGTH) {
          this.metrics.healthHistory.shift();
        }
        
        // Save metrics
        this.saveMetrics();
      }
    } catch (error) {
      console.error('Failed to check API health:', error);
    }
  }
  
  /**
   * Get API health metrics
   * @returns {Object} - API health metrics
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Get health status for an endpoint
   * @param {string} endpoint - API endpoint
   * @returns {boolean} - Is endpoint healthy
   */
  isEndpointHealthy(endpoint) {
    if (!this.metrics.endpoints[endpoint]) {
      return true; // Assume healthy if no data
    }
    
    return this.metrics.endpoints[endpoint].isHealthy;
  }
  
  /**
   * Get overall API health status
   * @returns {boolean} - Is API healthy
   */
  isApiHealthy() {
    return this.metrics.isHealthy;
  }
  
  /**
   * Reset metrics
   */
  async resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      networkErrors: 0,
      serverErrors: 0,
      clientErrors: 0,
      averageResponseTime: 0,
      responseTimeHistory: [],
      errorRateHistory: [],
      lastUpdated: Date.now(),
      endpoints: {},
      isHealthy: true,
      healthHistory: [],
      currentEndpoint: null
    };
    
    await this.saveMetrics();
  }
}

// Create singleton instance
const apiHealthMonitor = new ApiHealthMonitor();

export default apiHealthMonitor;
