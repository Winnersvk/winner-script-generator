import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bangkokISO,bangkokInput,imagePaths} from '../lib/publisher.mjs';
test('Bangkok scheduling preserves dates across UTC and leap day',()=>{assert.equal(bangkokISO('2028-02-29T00:15'),'2028-02-28T17:15:00.000Z');assert.equal(bangkokInput('2028-02-28T17:15:00Z'),'2028-02-29T00:15');assert.throws(()=>bangkokISO('2027-02-29T12:00'));});
test('media only accepts unique paths owned by the current member',()=>{const u='11111111-1111-4111-8111-111111111111',p=u+'/22222222-2222-4222-8222-222222222222.jpg';assert.deepEqual(imagePaths([p],u),[p]);assert.throws(()=>imagePaths([p,p],u));assert.throws(()=>imagePaths(['https://example.com/a.jpg'],u));assert.throws(()=>imagePaths(['other/'+p],u));});
