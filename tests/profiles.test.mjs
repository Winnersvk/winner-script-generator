import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile,parseProfiles,profilePrompt} from '../lib/profiles.mjs';
test('all brand fields survive export/import without executable or unknown properties',()=>{
 const p={pageName:'ร้านทดสอบ',contact:'ฝ่ายบริการ',tone:'อบอุ่น',personality:'จริงใจ',cta:'ทักเพจ',keywords:'งานละเอียด',avoid:'ห้ามรับประกันยอดขาย',phone:'020-000-0000',unexpected:'ignore'};
 const [restored]=parseProfiles(JSON.stringify({version:2,profiles:[p]}));
 for(const k of Object.keys(p).filter(k=>k!=='unexpected'))assert.equal(restored[k],p[k]);
 assert.equal(restored.unexpected,undefined);
 const prompt=profilePrompt(restored);assert.match(prompt,/020-000-0000/);assert.match(prompt,/ห้ามรับประกันยอดขาย/);assert.match(prompt,/อบอุ่น/);
});
test('invalid imports and oversized content are rejected',()=>{
 for(const bad of ['{}','null','{"version":9,"profiles":[]}','[{"pageName":""}]','[{"pageName":"test","tone":{}}]'])assert.throws(()=>parseProfiles(bad));
 assert.throws(()=>normalizeProfile({pageName:'test',notes:'a'.repeat(2001)}));
 assert.throws(()=>parseProfiles(JSON.stringify(Array.from({length:101},()=>({pageName:'test'})))));
});
