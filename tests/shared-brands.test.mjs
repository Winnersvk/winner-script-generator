import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {pendingProfiles} from '../lib/profile-sync.mjs';

test('shared profiles are never uploaded from cache, including revoked or stale entries',()=>{
 const saved=[{id:'own'},{id:'shared',canEdit:false},{id:'revoked',canEdit:false},{id:'stale',canEdit:true}];
 assert.deepEqual(pendingProfiles(saved,['shared','revoked','stale'],[{id:'shared',canEdit:false},{id:'stale',canEdit:false}]),[{id:'own'}]);
 assert.deepEqual(pendingProfiles([{id:'own'}],[],[{id:'own',canEdit:true}]),[]);
 assert.deepEqual(pendingProfiles([{id:'own'}],['own'],[{id:'own',canEdit:true}]),[{id:'own'}]);
});

test('employees can read admin brands and save their own posts without changing shared brands or seeing coworker data',async()=>{
 const db=new PGlite();
 const admin='11111111-1111-4111-8111-111111111111',employee='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
 const shared='44444444-4444-4444-8444-444444444444',privateBrand='55555555-5555-4555-8555-555555555555',post='66666666-6666-4666-8666-666666666666';
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${admin}'),('${employee}'),('${other}');create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;create table app_admins(user_id uuid primary key);insert into app_admins values('${admin}');create function public.is_app_admin() returns boolean language sql security definer as $$select exists(select 1 from app_admins where user_id=auth.uid())$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(bucket_id text,name text);create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;grant usage on schema auth,storage to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/publisher.sql',import.meta.url),'utf8'));
 // Existing profiles require no backfill or copying.
 await db.exec(`insert into mkt_brands values('${shared}','${admin}','{"pageName":"Admin page"}',now()),('${privateBrand}','${other}','{"pageName":"Private"}',now());`);
 const migration=await readFile(new URL('../supabase/shared-brands.sql',import.meta.url),'utf8');
 await db.exec(migration);await db.exec(migration);
 await db.exec(`set role authenticated;set test.uid='${employee}';`);
 assert.deepEqual((await db.query('select id from mkt_brands')).rows.map(x=>x.id),[shared]);
 assert.equal((await db.query(`update mkt_brands set data='{}' where id='${shared}' returning id`)).rows.length,0);
 await assert.rejects(()=>db.query(`insert into mkt_brands(id,owner_id,data) values('${shared}','${employee}','{}') on conflict(id) do update set owner_id=excluded.owner_id,data=excluded.data`),/row-level security/);
 await assert.rejects(()=>db.query('select * from app_admins'),/permission denied/);
 const save=(brand,rev,action='draft')=>db.query('select * from mkt_save_post($1,$2,$3,$4,$5::jsonb,$6,$7)',[post,rev,brand,'Caption',JSON.stringify([employee+'/'+post+'.jpg']),'story',action]);
 await assert.rejects(()=>save(privateBrand,0),/INVALID_BRAND/);
 assert.equal((await save(shared,0)).rows[0].owner_id,employee);
 assert.equal((await db.query('select b.data from mkt_posts p join mkt_brands b on b.id=p.brand_id')).rows[0].data.pageName,'Admin page');
 await save(shared,1,'pending');await assert.rejects(()=>save(shared,2,'approve'),/FORBIDDEN/);
 await db.exec(`set test.uid='${other}';`);
 assert.equal((await db.query('select * from mkt_posts')).rows.length,0);
 await assert.rejects(()=>save(shared,2),/FORBIDDEN/);
 await db.exec(`set test.uid='${admin}';update mkt_brands set data='{"pageName":"Updated"}' where id='${shared}';`);
 await save(shared,2,'approve');
 await db.exec(`set test.uid='${employee}';`);
 assert.equal((await db.query(`select data from mkt_brands where id='${shared}'`)).rows[0].data.pageName,'Updated');
 await db.exec('reset role;delete from app_admins;set role authenticated');
 assert.equal((await db.query('select * from mkt_brands')).rows.length,0);
 await assert.rejects(()=>save(shared,3),/INVALID_BRAND/);
 await db.exec('reset role;set role anon');
 await assert.rejects(()=>db.query('select * from mkt_brands'),/permission denied/);
 await assert.rejects(()=>db.query('select mkt_can_use_brand($1)',[shared]),/permission denied/);
 }finally{await db.close();}
});
