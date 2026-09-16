import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../app/api/generate/route.js';
const request=value=>new Request('http://localhost/api/generate',{method:'POST',headers:{origin:'http://localhost'},body:JSON.stringify(value)});
test('reject invalid requests before AI call',async()=>{
 for(const body of [{},null,{topic:123},{topic:'test',profile:{pageName:'test',tone:{}}}])assert.equal((await POST(request(body))).status,400);
});
test('selected profile reaches AI with fallback product and audience',async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.OPENAI_API_KEY;let sent;
 process.env.OPENAI_API_KEY='test-placeholder';
 globalThis.fetch=async(url,init)=>{sent=JSON.parse(init.body);return Response.json({id:'test',object:'response',status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({directions:[{script:'a'},{script:'b'},{script:'c'}]})}]}]});};
 try{const response=await POST(request({topic:'test',profile:{pageName:'test page',product:'signboard',audience:'shop owners',tone:'friendly',personality:'honest',cta:'message us',keywords:'care',avoid:'guaranteed revenue',contact:'service team'}}));
 assert.equal(response.status,200);assert.equal((await response.json()).directions.length,3);
 for(const value of ['signboard','shop owners','friendly','honest','message us','guaranteed revenue','service team'])assert.ok(sent.input.includes(value));
 assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;}
});

