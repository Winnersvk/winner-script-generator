import {createServerClient} from '@supabase/ssr';
import {NextResponse} from 'next/server';
import {supabaseUrl as url,supabaseKey as key} from './lib/supabase-config';

export async function middleware(req){
  let response=NextResponse.next({request:req});
  response.headers.set('Cache-Control','private, no-store');
  if(!url||!key)return response;
  const db=createServerClient(url,key,{cookies:{getAll:()=>req.cookies.getAll(),setAll:items=>{
    items.forEach(({name,value})=>req.cookies.set(name,value));
    response=NextResponse.next({request:req});
    response.headers.set('Cache-Control','private, no-store');
    items.forEach(({name,value,options})=>response.cookies.set(name,value,{...options,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'}));
  }}});
  await db.auth.getUser();
  return response;
}
export const config={matcher:['/','/login','/api/:path*']};
