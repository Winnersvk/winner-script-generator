import {signedIn,sameOrigin,privateHeaders} from './auth';
export const json=(data,status=200)=>Response.json(data,{status,headers:privateHeaders});
export async function context(req,write=false){
 if(write&&!sameOrigin(req))throw Object.assign(new Error('คำขอไม่ถูกต้อง'),{status:403});
 const ctx=await signedIn();if(!ctx.user)throw Object.assign(new Error('กรุณาเข้าสู่ระบบ'),{status:401});return ctx;
}
export async function body(req){const raw=await req.text();if(raw.length>250000)throw new Error('ข้อมูลใหญ่เกินไป');const x=JSON.parse(raw);if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('ข้อมูลไม่ถูกต้อง');return x;}
export const failure=e=>json({error:e.status?e.message:'ดำเนินการไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อผู้ดูแล'},e.status||400);
export async function signedImages(db,paths){if(!paths.length)return [];const {data,error}=await db.storage.from('mkt-content').createSignedUrls(paths,3600);if(error||data.some(x=>!x.signedUrl))throw new Error('อ่านภาพไม่ได้');return data.map((x,i)=>({path:paths[i],url:x.signedUrl}));}
