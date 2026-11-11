const CACHE = 'examw9-v1';
const SHELL = ['./', './index.html', './gas-bridge.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // Hanya file milik sendiri; panggilan ke Google Apps Script tidak pernah di-cache
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Halaman: ambil dari jaringan dulu, cadangan dari cache (agar update cepat terlihat)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Aset lain: cache dulu, lalu perbarui di latar belakang
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
