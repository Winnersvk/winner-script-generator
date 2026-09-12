const CACHE='winner-shell-v2';
const SHELL=['/','/manifest.webmanifest','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL);const page=await cache.match('/');const html=await page.text();const assets=[...new Set([...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(path=>path.startsWith('/_next/static/')))];await cache.addAll(assets);})());});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('winner-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||request.headers.get('RSC'))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response.ok&&url.pathname==='/')event.waitUntil(caches.open(CACHE).then(c=>c.put('/',response.clone())));return response;}).catch(()=>caches.match('/').then(r=>r||Response.error())));return;
  }
  if(url.pathname.startsWith('/_next/static/')||SHELL.includes(url.pathname))event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok)event.waitUntil(caches.open(CACHE).then(c=>c.put(request,response.clone())));return response;})));
});
