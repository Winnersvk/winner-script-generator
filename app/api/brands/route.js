import {context,body,json,failure} from '../../../lib/publisher-api';
import {normalizeProfile} from '../../../lib/profiles.mjs';
import {uuid} from '../../../lib/publisher.mjs';
export async function GET(req){try{const {db}=await context(req);const {data,error}=await db.from('mkt_brands').select('id,data,updated_at').order('updated_at');if(error)throw error;return json({profiles:data.map(x=>({...x.data,id:x.id}))});}catch(e){return failure(e);}}
export async function POST(req){try{const {db,user}=await context(req,true);const x=await body(req);if(!Array.isArray(x.profiles)||x.profiles.length>100)throw new Error();const rows=x.profiles.map(p=>{if(!uuid(p.id))throw new Error();return {id:p.id,owner_id:user.id,data:normalizeProfile(p),updated_at:new Date().toISOString()};});if(rows.length){const {error}=await db.from('mkt_brands').upsert(rows);if(error)throw error;}return json({ok:true});}catch(e){return failure(e);}}
