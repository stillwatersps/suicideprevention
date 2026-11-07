// Tidelight offline support.
// Keeps copies of this site's own files, so the crisis numbers still show with a weak
// signal or none. It never touches other sites and sends nothing. It keeps only those
// files, under plain addresses with any ?query or #part removed, and nothing a visitor
// types. Their order and dates can still show which pages were opened, and on a shared device
// they are a trace of the visit, as the About page says.
// It asks the network first, so a visit with a connection gets updates. They can take up to about
// 10 minutes to appear, because the host lets browsers reuse a file for that long. A saved copy is
// used if the network fails, answers with a server error, or takes longer than WAIT_MS.
// Change VERSION whenever the list of core files changes, or a crisis detail is corrected.
var VERSION = 'tidelight-v7';
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
  'manifest.webmanifest',
  'es/manifest.webmanifest'
];

// How long to wait for the network before showing a saved copy, if there is one.
var WAIT_MS = 3000;
// After the network stalls, use saved copies at once for a little while, so a page's style
// sheet and script don't each make the person wait again.
var STALLED_MS = 15000;
var stalledUntil = 0;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // 'reload' skips the browser's own short-term cache. A corrected number must not be
      // saved here from a copy the browser fetched a few minutes before the correction.
      return cache.addAll(CORE.map(function (path) {
        return new Request(path, { cache: 'reload' });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) {
        // Also removes copies saved under the project's earlier name, Stillwater.
        return (name.indexOf('tidelight-') === 0 || name.indexOf('stillwater-') === 0) && name !== VERSION;
      }).map(function (name) {
        return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function savedCopy(key) {
  return caches.match(key, { ignoreVary: true });
}

// What to show when the network can't give a good answer.
function fallback(key, isPage, response) {
  return savedCopy(key).then(function (copy) {
    if (copy) return copy;
    if (!isPage) return undefined;
    // An address typed without its final slash, such as .../get-help: send the browser to the
    // address with the slash, as GitHub Pages does, so the saved page's links and style work.
    var last = key.slice(key.lastIndexOf('/') + 1);
    var withSlash = last && last.indexOf('.') < 0 ? savedCopy(key + '/') : Promise.resolve(undefined);
    return withSlash.then(function (page) {
      if (page) return Response.redirect(key + '/', 301);
      // A page that was never saved: the "page not found" page has the crisis numbers and
      // works from any address.
      return savedCopy('404.html');
    });
  }).then(function (copy) {
    return copy || response || Response.error();
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);
  // Only this site's own files, only plain reads. Everything else is left alone.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.indexOf(new URL('./', self.registration.scope).pathname) !== 0) return;

  var key = url.origin + url.pathname;
  var isPage = request.mode === 'navigate';
  var network = fetch(request);

  // Save a good answer for next time, even if a saved copy was already shown this time.
  event.waitUntil(network.then(function (response) {
    if (!response.ok) return undefined;
    stalledUntil = 0;
    var copy = response.clone();
    return caches.open(VERSION).then(function (cache) {
      return cache.put(key, copy);
    });
  }).catch(function () {}));

  var fromNetwork = network.then(function (response) {
    return response.status >= 500 ? fallback(key, isPage, response) : response;
  }, function () {
    return fallback(key, isPage);
  });

  event.respondWith(new Promise(function (resolve) {
    var timer = setTimeout(function () {
      savedCopy(key).then(function (copy) {
        if (!copy) return; // Nothing saved, so the network is the only hope. Keep waiting.
        stalledUntil = Date.now() + STALLED_MS;
        resolve(copy);
      }).catch(function () {});
    }, Date.now() < stalledUntil ? 0 : WAIT_MS);
    fromNetwork.then(function (answer) {
      clearTimeout(timer);
      resolve(answer);
    }, function () {
      clearTimeout(timer);
      resolve(Response.error());
    });
  }));
});
