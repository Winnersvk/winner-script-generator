import {authClient,sameOrigin,privateHeaders} from '../../../lib/auth';
export async function POST(req){
  if(!sameOrigin(req))return Response.json({error:'คำขอไม่ถูกต้อง'},{status:403,headers:privateHeaders});
  try{
    const raw=await req.text();
    if(raw.length>4096)return Response.json({error:'ข้อมูลยาวเกินไป'},{status:413});
    const x=JSON.parse(raw),db=await authClient();
    if(x.action==='logout'){
      const {error}=await db.auth.signOut({scope:'local'});
      if(error)throw error;
      return Response.json({ok:true},{headers:privateHeaders});
    }
    if(x.action!=='login'||typeof x.email!=='string'||typeof x.password!=='string'||x.password.length>1024)
      return Response.json({error:'ข้อมูลไม่ถูกต้อง'},{status:400,headers:privateHeaders});
    const {error}=await db.auth.signInWithPassword({email:x.email.trim(),password:x.password});
    if(error)return Response.json({error:'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่พร้อมใช้งาน'},{status:error.status===429?429:401,headers:privateHeaders});
    return Response.json({ok:true},{headers:privateHeaders});
  }catch{return Response.json({error:'เข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้งหรือติดต่อเจ้าของร้าน'},{status:503,headers:privateHeaders});}
}
