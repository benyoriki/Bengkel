/* Service worker: syarat PWA + cache agar website tetap terbuka saat sinyal lemah */
const V='motocare-v3',FILES=['./','index.html','style.css','core.js','script.js','logo-sm.png','favicon.png','hero.jpg','icon-192.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  /* halaman & skrip: ambil terbaru dulu, cadangan dari cache; gambar: cache dulu */
  const img=/\.(png|jpe?g|webp|svg)$/i.test(r.url);
  e.respondWith(img?caches.match(r).then(m=>m||fetch(r).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(r,c));return n}))
    :fetch(r).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(r,c));return n}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
