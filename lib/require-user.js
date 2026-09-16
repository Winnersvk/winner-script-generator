import {redirect} from 'next/navigation';
import {signedIn} from './auth';
export async function requireUser(){let ctx;try{ctx=await signedIn();}catch{}if(!ctx?.user)redirect('/login');const {data:admin}=await ctx.db.rpc('is_app_admin');return {...ctx,admin:!!admin};}
