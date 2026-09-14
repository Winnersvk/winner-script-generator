export async function saveHistory(db,entry){
 const row={...entry,id:crypto.randomUUID()};
 let error;
 for(let attempt=0;attempt<3;attempt++){
  ({error}=await db.from('script_history').insert(row));
  if(!error)return null;
  if(error.code==='23505'){
   const found=await db.from('script_history').select('id').eq('id',row.id).eq('user_id',row.user_id).maybeSingle();
   if(found.data&&!found.error)return null;
  }
  if(error.code==='42501'||error.code==='23503')break;
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
 }
 return error;
}
