import {createClient} from '@supabase/supabase-js';
import {signedIn,sameOrigin} from '../../../../lib/auth';
import {supabaseUrl} from '../../../../lib/supabase-config';
import {createEmployee} from '../../../../lib/create-employee.mjs';

export async function POST(req){
 return createEmployee(req,{signedIn,sameOrigin,createAccount:async attributes=>{
  const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)throw new Error('ADMIN_AUTH_NOT_CONFIGURED');
  const db=createClient(supabaseUrl,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return db.auth.admin.createUser(attributes);
 }});
}
