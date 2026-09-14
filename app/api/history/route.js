import {signedIn,privateHeaders} from '../../../lib/auth';
export async function GET(req){
  try{
    const {db,user}=await signedIn();
    if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401,headers:privateHeaders});
    const u=new URL(req.url),id=u.searchParams.get('id');
    if(id){
      if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'ไม่พบประวัติ'},{status:404,headers:privateHeaders});
      let query=db.from('script_history').select('id,created_at,title,input,output').eq('id',id);
      if(u.searchParams.get('admin')==='1'){
        const {data:admin,error}=await db.rpc('is_app_admin');
        if(error||!admin)return Response.json({error:'เฉพาะแอดมินเท่านั้น'},{status:403,headers:privateHeaders});
      }else query=query.eq('user_id',user.id);
      const {data,error}=await query.maybeSingle();
      if(error)throw error;
      return Response.json(data||{error:'ไม่พบประวัติ'},{status:data?200:404,headers:privateHeaders});
    }
    const page=Math.max(0,Math.min(100000,Number(u.searchParams.get('page'))||0));
    const {data,error}=await db.from('script_history').select('id,created_at,title').eq('user_id',user.id).order('created_at',{ascending:false}).order('id').range(page*20,page*20+19);
    if(error)throw error;
    return Response.json({items:data},{headers:privateHeaders});
  }catch{return Response.json({error:'โหลดประวัติไม่ได้ กรุณาลองอีกครั้ง'},{status:503,headers:privateHeaders});}
}
