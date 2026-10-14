/* Service worker · versión 1
   - Pantalla principal: primero la red (así siempre llega la última versión) y, sin conexión, la copia guardada.
   - Fuentes e imágenes: primero la copia guardada. */
var CACHE="franco-v1";
var BASE=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(BASE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch",function(e){
  var req=e.request; if(req.method!=="GET"){ return; }
  var url=new URL(req.url);
  var propio=url.origin===location.origin;
  if(propio && (req.mode==="navigate" || /\/(index\.html)?$/.test(url.pathname))){
    e.respondWith(fetch(req).then(function(r){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put("index.html",cp); }); return r; })
      .catch(function(){ return caches.match("index.html").then(function(m){ return m||caches.match("./"); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(m){
    return m || fetch(req).then(function(r){
      if(r && (r.ok||r.type==="opaque")){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); }
      return r;
    });
  }));
});
