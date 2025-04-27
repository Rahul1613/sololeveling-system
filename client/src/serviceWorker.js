/**
 * Service Worker for Solo Leveling application
 * Provides basic offline capabilities
 */

// Cache name for app shell and data
const CACHE_NAME = 'solo-leveling-cache-v1';

// Assets to cache on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/offline.html',
  '/images/offline-image.svg',
  '/manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting for the new service worker to activate
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients immediately
  self.clients.claim();
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a request is an API request
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper function to determine if a request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper function to determine if a request is an image
function isImageRequest(request) {
  return request.destination === 'image';
}

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a basic offline response for API requests
          return new Response(
            JSON.stringify({
              success: false,
              message: 'You are offline. Please check your internet connection.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle image requests
  if (isImageRequest(event.request)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Cache the fetched image
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
              return response;
            })
            .catch(() => {
              // Return fallback image
              return caches.match('/images/offline-image.svg');
            });
        })
    );
    return;
  }
  
  // Handle navigation requests
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return the offline page for navigation requests when offline
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Default strategy - try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the response for future use
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Try to get from cache
        return caches.match(event.request);
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle sync events (basic implementation)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event.tag);
  
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(
      // This would normally process pending requests stored in IndexedDB or localStorage
      // For now, just log that we received the sync event
      console.log('[Service Worker] Processing background sync for pending requests')
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from Solo Leveling',
    icon: '/badge.svg',
    badge: '/badge.svg',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Solo Leveling', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
