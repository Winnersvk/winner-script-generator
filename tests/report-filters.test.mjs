import test from 'node:test';
import assert from 'node:assert/strict';
import {reportFilters} from '../lib/report-filters.mjs';
test('date report filters accept leap dates and optional full history',()=>{
 assert.equal(reportFilters(new URLSearchParams()).p_from,null);
 assert.deepEqual(reportFilters(new URLSearchParams('from=2024-02-29&to=2024-03-01&grain=month&page=2')),{p_from:'2024-02-29',p_to:'2024-03-01',p_grain:'month',p_user:null,p_page:2});
});
test('reject invalid calendar dates, reversed range and malformed identifiers',()=>{
 for(const q of ['from=2025-02-29','from=2024-13-01','from=2024-03-02&to=2024-03-01','grain=hour','page=-1','page=1.2','user=not-a-user'])assert.throws(()=>reportFilters(new URLSearchParams(q)));
});
