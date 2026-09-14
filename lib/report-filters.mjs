export function reportFilters(params){
  const from=params.get('from')||null,to=params.get('to')||null,grain=params.get('grain')||'day',user=params.get('user')||null;
  for(const d of [from,to])if(d&&(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d))throw new Error('วันที่ไม่ถูกต้อง');
  if(from&&to&&from>to)throw new Error('วันเริ่มต้นต้องไม่เกินวันสิ้นสุด');
  if(!['day','month','year'].includes(grain))throw new Error('รูปแบบรายงานไม่ถูกต้อง');
  if(user&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user))throw new Error('ผู้ใช้ไม่ถูกต้อง');
  const page=Number(params.get('page')||0);
  if(!Number.isInteger(page)||page<0||page>100000)throw new Error('หน้าไม่ถูกต้อง');
  return {p_from:from,p_to:to,p_grain:grain,p_user:user,p_page:page};
}
