import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {supabaseUrl as url,supabaseKey as key} from './supabase-config';

export async function authClient(){
  const jar=await cookies();
  if(!url||!key)throw new Error('AUTH_NOT_CONFIGURED');
  return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:items=>{
    for(const {name,value,options} of items){try{jar.set(name,value,{...options,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});}catch{/* Server components cannot refresh cookies. Middleware does this. */}}
  }}});
}
export async function signedIn(){
  const db=await authClient();
  const {data:{user},error}=await db.auth.getUser();
  return {db,user:error?null:user};
}
export function sameOrigin(req){
  const origin=req.headers.get('origin');
  return !!origin&&origin===new URL(req.url).origin;
}
export const privateHeaders={'Cache-Control':'private, no-store'};
