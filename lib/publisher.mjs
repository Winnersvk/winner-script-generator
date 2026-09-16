export const statuses={draft:'ฉบับร่าง',pending:'รออนุมัติ',approved:'อนุมัติแล้ว',scheduled:'ตั้งเวลาแล้ว',publishing:'กำลังเผยแพร่',published:'เผยแพร่แล้ว',failed:'ไม่สำเร็จ',cancelled:'ยกเลิกแล้ว'};
export const styles={sale:'ขายสินค้า',story:'เล่าเรื่อง',promo:'โปรโมชัน',education:'ให้ความรู้',portfolio:'ผลงาน',beforeafter:'ก่อนและหลัง',engagement:'ชวนพูดคุย'};
export const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function imagePaths(value,owner){
 if(!Array.isArray(value)||value.length>10||value.some(p=>typeof p!=='string'||!new RegExp('^'+owner+'/[0-9a-f-]{36}\\.(jpg|png)$').test(p)))throw new Error('รูปภาพไม่ถูกต้อง');
 if(new Set(value).size!==value.length)throw new Error('รูปภาพซ้ำ');return value;
}
export function bangkokInput(iso){return iso?new Date(new Date(iso).getTime()+7*3600000).toISOString().slice(0,16):'';}
export function bangkokISO(input){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input))throw new Error('เลือกวันและเวลา');const d=new Date(input+':00+07:00');if(!Number.isFinite(d.getTime())||bangkokInput(d.toISOString())!==input)throw new Error('วันเวลาไม่ถูกต้อง');return d.toISOString();}
export const displayDate=iso=>iso?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(iso)):'ยังไม่ตั้งเวลา';
