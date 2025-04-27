/**
 * Solo Leveling Service Worker
 * Provides offline capabilities and background synchronization
 */

// Cache names
const CACHE_NAME = 'solo-leveling-cache-v1';
const DYNAMIC_CACHE = 'solo-leveling-dynamic-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Failed to install:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
  
  return self.clients.claim();
});

// Fetch event - network first with cache fallback strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the successful response
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch((error) => {
          console.log('[Service Worker] Network request failed, trying cache', error);
          
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If no cached response, return a custom offline response for API
              return new Response(
                JSON.stringify({
                  success: false,
                  message: 'You are currently offline. This request will be processed when you are back online.',
                  offline: true
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the successful response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Network request failed for static asset', error);
            
            // For HTML requests, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // For image requests, return a placeholder
            if (event.request.headers.get('accept').includes('image')) {
              return caches.match('/images/offline-image.png');
            }
            
            // Default fallback
            return new Response('Offline content not available');
          });
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event);
  
  if (event.tag === 'sync-new-quests') {
    event.waitUntil(
      syncNewQuests()
    );
  }
  
  if (event.tag === 'sync-quest-updates') {
    event.waitUntil(
      syncQuestUpdates()
    );
  }
  
  if (event.tag === 'sync-inventory-changes') {
    event.waitUntil(
      syncInventoryChanges()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received', event);
  
  let data = { title: 'Solo Leveling', body: 'New notification!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[Service Worker] Failed to parse push data:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// Message event handler
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to sync new quests
async function syncNewQuests() {
  try {
    const db = await openDB();
    const quests = await db.getAll('offline-quests');
    
    for (const quest of quests) {
      try {
        const response = await fetch('/api/quests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': quest.token
          },
          body: JSON.stringify(quest.data)
        });
        
        if (response.ok) {
          await db.delete('offline-quests', quest.id);
          console.log('[Service Worker] Successfully synced quest:', quest.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync quest:', quest.id, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync quests:', error);
  }
}

// Helper function to sync quest updates
async function syncQuestUpdates() {
  try {
    const db = await openDB();
    const updates = await db.getAll('offline-quest-updates');
    
    for (const update of updates) {
      try {
        const response = await fetch(`/api/quests/${update.questId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': update.token
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await db.delete('offline-quest-updates', update.id);
          console.log('[Service Worker] Successfully synced quest update:', update.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync quest update:', update.id, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync quest updates:', error);
  }
}

// Helper function to sync inventory changes
async function syncInventoryChanges() {
  try {
    const db = await openDB();
    const changes = await db.getAll('offline-inventory-changes');
    
    for (const change of changes) {
      try {
        const response = await fetch('/api/inventory', {
          method: change.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': change.token
          },
          body: JSON.stringify(change.data)
        });
        
        if (response.ok) {
          await db.delete('offline-inventory-changes', change.id);
          console.log('[Service Worker] Successfully synced inventory change:', change.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync inventory change:', change.id, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync inventory changes:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('solo-leveling-offline-db', 1);
    
    request.onerror = (event) => {
      reject('Failed to open IndexedDB');
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('offline-quests')) {
        db.createObjectStore('offline-quests', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offline-quest-updates')) {
        db.createObjectStore('offline-quest-updates', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offline-inventory-changes')) {
        db.createObjectStore('offline-inventory-changes', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
