// Stillwater offline support.
// Keeps copies of this site's own pages and files so crisis numbers still show
// with a weak or no signal. It never touches other sites, sends nothing, and
// stores nothing about visitors. Always tries the network first, so updates
// appear as soon as there is a connection; the copy is only a fallback.
// Change VERSION whenever the list of core files changes.
var VERSION = 'stillwater-v3';
var CORE = [
  './',
  'get-help/',
  'help-someone/',
  'research/',
  'teens/',
  'card/',
  'not-sure/',
  'after-a-loss/',
  'about/',
  'es/',
  'es/obtener-ayuda/',
  'es/ayudar-a-alguien/',
  'es/investigacion/',
  'es/adolescentes/',
  'es/tarjeta/',
  'es/que-siento/',
  'es/despues-de-una-perdida/',
  'es/acerca-de/',
  '404.html',
  'assets/styles.css',
  'assets/menu.js',
  'assets/favicon.svg',
  'assets/icon-180.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/images/joshua-tree-sunset-800.webp',
  'assets/images/joshua-tree-sunset-1600.webp',
  'assets/988-lifeline.vcf',
  'assets/988-linea-es.vcf',
  'manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) {
        return name.indexOf('stillwater-') === 0 && name !== VERSION;
      }).map(function (name) {
        return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);
  // Only this site's own files, only plain reads. Everything else is left alone.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.indexOf(new URL('./', self.registration.scope).pathname) !== 0) return;

  event.respondWith(
    fetch(request).then(function (response) {
      if (response.ok) {
        var copy = response.clone();
        caches.open(VERSION).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () {
      return caches.match(request, { ignoreSearch: true }).then(function (cached) {
        if (cached) return cached;
        // A page that was never saved: show the "page not found" page, which has the
        // crisis numbers and works from any address.
        if (request.mode === 'navigate') return caches.match('404.html');
        return Response.error();
      });
    })
  );
});
