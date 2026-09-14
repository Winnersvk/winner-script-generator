import {signedIn,privateHeaders} from '../../../../lib/auth';
import {reportFilters} from '../../../../lib/report-filters.mjs';
export async function GET(req){
 try{
  const {db,user}=await signedIn();
  if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401,headers:privateHeaders});
  const {data:admin,error:roleError}=await db.rpc('is_app_admin');
  if(roleError||!admin)return Response.json({error:'เฉพาะแอดมินเท่านั้น'},{status:403,headers:privateHeaders});
  let filters;try{filters=reportFilters(new URL(req.url).searchParams);}catch(e){return Response.json({error:e.message},{status:400,headers:privateHeaders});}
  const {data,error}=await db.rpc('admin_usage_report',filters);
  if(error)throw error;
  return Response.json(data,{headers:privateHeaders});
 }catch{return Response.json({error:'โหลดรายงานไม่สำเร็จ กรุณาลองอีกครั้ง'},{status:503,headers:privateHeaders});}
}
