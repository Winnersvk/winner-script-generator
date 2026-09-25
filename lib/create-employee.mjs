// Only server routes should supply the privileged account creator.
export async function createEmployee(req,{signedIn,sameOrigin,createAccount}){
 const headers={'Cache-Control':'private, no-store'};
 const reply=(body,status)=>Response.json(body,{status,headers});
 if(!sameOrigin(req))return reply({error:'คำขอไม่ถูกต้อง'},403);
 try{
  const {db,user}=await signedIn();
  if(!user)return reply({error:'กรุณาเข้าสู่ระบบ'},401);
  const {data:admin,error}=await db.rpc('is_app_admin');
  if(error||admin!==true)return reply({error:'เฉพาะผู้ดูแลระบบเท่านั้น'},403);
  const raw=await req.text();
  if(raw.length>4096)return reply({error:'ข้อมูลยาวเกินไป'},413);
  let input;try{input=JSON.parse(raw);}catch{return reply({error:'ข้อมูลไม่ถูกต้อง'},400);}
  const email=typeof input?.email==='string'?input.email.trim().toLowerCase():'';
  const name=typeof input?.name==='string'?input.name.trim():'';
  const password=input?.password;
  if(!name||name.length>100||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<12||password.length>128)
   return reply({error:'กรอกชื่อไม่เกิน 100 ตัวอักษร อีเมลที่ถูกต้อง และรหัสผ่าน 12–128 ตัวอักษร'},400);
  // Explicit allowlist: never accept role, admin flags or app_metadata from the browser.
  const result=await createAccount({email,password,email_confirm:true,user_metadata:{full_name:name}});
  if(result.error){
   if(['email_exists','user_already_exists'].includes(result.error.code))return reply({error:'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาใช้อีเมลอื่น'},409);
   if(result.error.code==='weak_password')return reply({error:'รหัสผ่านไม่ผ่านเงื่อนไขความปลอดภัย กรุณาใช้รหัสผ่านที่ยาวและคาดเดายากขึ้น'},400);
   if(result.error.status===429)return reply({error:'ทำรายการบ่อยเกินไป กรุณารอสักครู่'},429);
   return reply({error:'สร้างบัญชีไม่สำเร็จ กรุณาติดต่อผู้ดูแลการตั้งค่าระบบ'},503);
  }
  if(!result.data?.user?.id)throw new Error('Missing user');
  return reply({user:{id:result.data.user.id,email:result.data.user.email}},201);
 }catch{return reply({error:'สร้างบัญชีไม่ได้ในขณะนี้ กรุณาตรวจสอบการตั้งค่าระบบ แล้วตรวจว่าบัญชีถูกสร้างแล้วหรือไม่ก่อนลองอีกครั้ง'},503);}
}
