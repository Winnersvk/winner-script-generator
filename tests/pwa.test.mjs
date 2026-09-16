import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('PWA only caches public assets and clears old private page caches',async()=>{
 const events={},added=[],removed=[];
 const context={self:{location:{origin:'https://example.test'},skipWaiting:async()=>{},clients:{claim:async()=>{}},addEventListener:(type,cb)=>events[type]=cb},caches:{open:async()=>({addAll:async urls=>added.push(...urls)}),keys:async()=>['winner-shell-v2','winner-public-v3','other-app'],delete:async key=>removed.push(key)},URL,Response};
 vm.runInNewContext(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8'),context);
 let pending;events.install({waitUntil:p=>pending=p});await pending;
 assert.deepEqual(added,['/manifest.webmanifest','/icon-192.png','/icon-512.png']);
 events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(removed,['winner-shell-v2','winner-public-v3']);
 for(const url of ['/','/login','/api/history','/api/generate'])events.fetch({request:new Request('https://example.test'+url),respondWith:()=>assert.fail('Private data must never be cached')});
});
