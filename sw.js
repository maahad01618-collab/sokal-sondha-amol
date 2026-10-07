// Service Worker — অফলাইন সাপোর্ট
const CACHE_NAME = 'sokal-sondha-amol-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// ইনস্টল — সব অ্যাসেট ক্যাশ করো
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// অ্যাক্টিভেট — পুরনো ক্যাশ মুছে ফেলো
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ফেচ — আগে ক্যাশ, না পেলে নেটওয়ার্ক
self.addEventListener('fetch', (event) => {
  // শুধু GET রিকোয়েস্ট ক্যাশ করবো
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // সফল রেসপন্স হলে ক্যাশে সেভ করো
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // অফলাইন হলে index.html ফেরত দাও
        return caches.match('./index.html');
      });
    })
  );
});
