import test from 'node:test';
import assert from 'node:assert/strict';
import {saveHistory} from '../lib/save-history.mjs';
test('retry retains id and committed duplicate counts as success',async()=>{
 const ids=[];
 const chain={eq:()=>chain,maybeSingle:async()=>({data:{id:ids[0]},error:null})};
 const db={from:()=>({insert:async row=>{ids.push(row.id);return {error:{code:ids.length===1?'504':'23505'}};},select:()=>chain})};
 assert.equal(await saveHistory(db,{user_id:'owner'}),null);
 assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);
});
test('permission failures do not retry',async()=>{
 let n=0;const db={from:()=>({insert:async()=>{n++;return {error:{code:'42501'}};}})};
 assert.equal((await saveHistory(db,{})).code,'42501');assert.equal(n,1);
});
