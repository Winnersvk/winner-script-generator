import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3010';
let r=await fetch(base,{redirect:'manual'});assert.equal(r.status,307);assert.equal(new URL(r.headers.get('location'),base).pathname,'/login');
r=await fetch(base+'/login');assert.equal(r.status,200);
for(const path of ['/api/history','/api/history?id=00000000-0000-0000-0000-000000000000']){r=await fetch(base+path);assert.equal(r.status,401);}
r=await fetch(base+'/api/generate',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({topic:'test'})});assert.equal(r.status,401);
r=await fetch(base+'/api/generate',{method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json'},body:'{}'});assert.equal(r.status,403);
r=await fetch(base+'/api/auth',{method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json'},body:'{}'});assert.equal(r.status,403);
console.log('PASS: protected page, private history, blocked generation, cross-origin requests');
