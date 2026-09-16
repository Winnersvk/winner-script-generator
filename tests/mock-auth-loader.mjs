import {registerHooks} from 'node:module';
const mock=`export const privateHeaders={'Cache-Control':'private, no-store'};export const sameOrigin=r=>r.headers.get('origin')===new URL(r.url).origin;export const signedIn=async()=>({user:{id:'test-user'},db:{from:()=>({insert:async row=>{globalThis.savedHistory=row;return {error:null}}})}});`;
registerHooks({resolve(specifier,context,next){if(specifier.endsWith('/lib/auth'))return {url:'data:text/javascript,'+encodeURIComponent(mock),shortCircuit:true};return next(specifier,context);}});
await import('./generate.test.mjs');
